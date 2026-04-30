'use strict';
const { checkCommand, checkWritePath, checkReadPath, checkInjection, isCheckDisabled } = require('./check');

// Codex 6-event hook surface (verified against codex-rs/hooks/src/lib.rs HOOK_EVENT_NAMES).
const CODEX_EVENT_PRE_TOOL_USE       = 'PreToolUse';
const CODEX_EVENT_PERMISSION_REQUEST = 'PermissionRequest';
const CODEX_EVENT_POST_TOOL_USE      = 'PostToolUse';
const CODEX_EVENT_SESSION_START      = 'SessionStart';
const CODEX_EVENT_USER_PROMPT_SUBMIT = 'UserPromptSubmit';
const CODEX_EVENT_STOP               = 'Stop';

function extractStringValues(obj, depth) {
  if (!depth) depth = 0;
  if (depth > 3) return [];
  if (typeof obj === 'string') return [obj];
  if (Array.isArray(obj)) return obj.flatMap(v => extractStringValues(v, depth + 1));
  if (obj && typeof obj === 'object') return Object.values(obj).flatMap(v => extractStringValues(v, depth + 1));
  return [];
}

/**
 * Extract file paths from a V4A apply_patch envelope.
 * Codex's `apply_patch` tool wraps the patch as `tool_input.command = "<full V4A patch text>"`.
 * V4A header markers we care about for path detection:
 *   *** Add File: path/to/file
 *   *** Update File: path/to/file
 *   *** Delete File: path/to/file
 *   *** Move to: path/to/file        (rename target)
 */
function extractApplyPatchPaths(patchText) {
  if (typeof patchText !== 'string' || !patchText) return [];
  const paths = [];
  const re = /^\*\*\*\s+(?:Add File|Update File|Delete File|Move to):\s+(.+?)\s*$/gm;
  let m;
  while ((m = re.exec(patchText)) !== null) {
    paths.push(m[1].trim());
  }
  return paths;
}

/**
 * Run the engine against a Codex hook event.
 * Returns: { result, toolName, preview, eventName, requestedPermission }
 *   result: { blocked, reason, ruleId, risk, critical, sanitized? } | null
 *   requestedPermission: 'shell'|'mcp'|'patch'|'prompt'|null — for routing PermissionRequest decisions
 */
function runEngine(event, config) {
  const eventName = event.hook_event_name || '';
  let result = null;
  let toolName = '';
  let preview = '';
  let requestedPermission = null;

  if (eventName === CODEX_EVENT_PRE_TOOL_USE || eventName === CODEX_EVENT_PERMISSION_REQUEST) {
    toolName = event.tool_name || '';
    const input = event.tool_input || {};

    if (toolName === 'Bash') {
      const command = String(input.command || '');
      preview = command;
      requestedPermission = 'shell';
      result = checkCommand(command, config);
    } else if (toolName === 'apply_patch') {
      // V4A patch envelope — content is patch text, NOT shell.
      const patchText = String(input.command || '');
      const paths = extractApplyPatchPaths(patchText);
      preview = paths.join(',') || patchText.slice(0, 80);
      requestedPermission = 'patch';
      for (const fp of paths) {
        const r = checkWritePath(fp, config);
        if (r) { result = r; break; }
      }
    } else if (toolName === 'Write' || toolName === 'Edit' || toolName === 'NotebookEdit') {
      const filePath = input.file_path || input.path || '';
      preview = filePath;
      requestedPermission = 'patch';
      result = checkWritePath(filePath, config);
    } else if (toolName === 'MultiEdit') {
      const paths = [input.file_path, ...((input.edits || []).map(e => e.file_path))].filter(Boolean);
      preview = paths.join(',');
      requestedPermission = 'patch';
      for (const fp of paths) {
        const r = checkWritePath(fp, config);
        if (r) { result = r; break; }
      }
    } else if (toolName.startsWith('mcp__')) {
      requestedPermission = 'mcp';
      if (!isCheckDisabled(config, 'mcp_inspection')) {
        preview = JSON.stringify(input).slice(0, 200);
        const values = extractStringValues(input);
        for (const v of values) {
          const r = checkInjection(v, config);
          if (r) { result = { blocked: true, reason: r.reason, ruleId: r.id, risk: 'high' }; break; }
        }
      }
    }
  } else if (eventName === CODEX_EVENT_USER_PROMPT_SUBMIT) {
    toolName = 'UserPrompt';
    const prompt = String(event.prompt || '');
    preview = prompt.slice(0, 200);
    requestedPermission = 'prompt';
    if (!isCheckDisabled(config, 'mcp_inspection')) {
      const r = checkInjection(prompt, config);
      if (r) result = { blocked: true, reason: r.reason, ruleId: r.id, risk: 'high' };
    }
  }
  // SessionStart, PostToolUse, Stop: no enforcement decisions — purely audit/lifecycle.

  return { result, toolName, preview, eventName, requestedPermission };
}

/**
 * Build the Codex response payload for a given engine result.
 * Returns: { response: object|null, exitCode: number, stderr: string|null }
 *
 * Wire format per codex-rs/hooks/src/schema.rs:
 *   PreToolUse modern: { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason } }
 *     (only `deny` is honored — `allow` and `ask` are parsed-then-rejected)
 *   PreToolUse legacy: { decision: 'block', reason }
 *   PermissionRequest: { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: { behavior: 'deny', message } } }
 *   UserPromptSubmit:  { decision: 'block', reason }  (also accepts hookSpecificOutput.additionalContext for non-block)
 *   PostToolUse:       { decision: 'block', reason }  (force model to reconsider — no rollback of side effect)
 *   Stop:              { decision: 'block', reason }  (force continuation with reason)
 *   SessionStart:      { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } }
 *
 * For critical (rule.risk='critical' or rule.critical=true), emit JSON AND exit 2 with stderr —
 * Codex parses exit-2+stderr as a hard block independent of stdout shape.
 */
function buildResponse(eventName, result, config) {
  if (!result) return { response: null, exitCode: 0, stderr: null };

  if (result.sanitized) {
    // Codex has no `updatedInput` accept path on PreToolUse (rejected by parser).
    // Best we can do: deny with the sanitize hint as the reason so the model retries.
    const reason = `Knox would sanitize: ${result.reason}. Please rewrite without the flagged pattern.`;
    return {
      response: {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason
        }
      },
      exitCode: 0,
      stderr: null
    };
  }

  if (!result.blocked) return { response: null, exitCode: 0, stderr: null };

  const isCritical = result.risk === 'critical' || result.critical === true;
  const reason = result.reason || 'Knox: blocked by policy';

  if (eventName === CODEX_EVENT_PRE_TOOL_USE) {
    return {
      response: {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason
        }
      },
      exitCode: isCritical ? 2 : 0,
      stderr: isCritical ? reason : null
    };
  }

  if (eventName === CODEX_EVENT_PERMISSION_REQUEST) {
    return {
      response: {
        hookSpecificOutput: {
          hookEventName: 'PermissionRequest',
          decision: { behavior: 'deny', message: reason }
        }
      },
      exitCode: isCritical ? 2 : 0,
      stderr: isCritical ? reason : null
    };
  }

  if (eventName === CODEX_EVENT_USER_PROMPT_SUBMIT) {
    return {
      response: { decision: 'block', reason },
      exitCode: isCritical ? 2 : 0,
      stderr: isCritical ? reason : null
    };
  }

  if (eventName === CODEX_EVENT_POST_TOOL_USE || eventName === CODEX_EVENT_STOP) {
    return { response: { decision: 'block', reason }, exitCode: 0, stderr: null };
  }

  // Unknown event with a result — still emit a valid passthrough.
  return { response: null, exitCode: 0, stderr: null };
}

module.exports = {
  runEngine,
  buildResponse,
  extractStringValues,
  extractApplyPatchPaths,
  CODEX_EVENTS: {
    CODEX_EVENT_PRE_TOOL_USE,
    CODEX_EVENT_PERMISSION_REQUEST,
    CODEX_EVENT_POST_TOOL_USE,
    CODEX_EVENT_SESSION_START,
    CODEX_EVENT_USER_PROMPT_SUBMIT,
    CODEX_EVENT_STOP
  }
};
