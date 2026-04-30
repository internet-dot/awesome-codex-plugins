'use strict';
const { checkCommand, checkWritePath, checkReadPath, checkInjection, isCheckDisabled } = require('./check');

const CURSOR_EVENT_BEFORE_SHELL  = 'beforeShellExecution';
const CURSOR_EVENT_BEFORE_MCP    = 'beforeMCPExecution';
const CURSOR_EVENT_BEFORE_READ   = 'beforeReadFile';
const CURSOR_EVENT_PRE_TOOL      = 'preToolUse';
const CURSOR_EVENT_BEFORE_PROMPT = 'beforeSubmitPrompt';
const CURSOR_EVENT_SESSION_START = 'sessionStart';
const CURSOR_EVENT_SESSION_END   = 'sessionEnd';
const CURSOR_EVENT_STOP          = 'stop';
const CURSOR_EVENT_SUBAGENT_STOP = 'subagentStop';
const CURSOR_EVENT_PRE_COMPACT   = 'preCompact';

function extractStringValues(obj, depth) {
  if (!depth) depth = 0;
  if (depth > 3) return [];
  if (typeof obj === 'string') return [obj];
  if (Array.isArray(obj)) return obj.flatMap(v => extractStringValues(v, depth + 1));
  if (obj && typeof obj === 'object') return Object.values(obj).flatMap(v => extractStringValues(v, depth + 1));
  return [];
}

/**
 * Run the engine against a Cursor event.
 * Returns: { result, toolName, preview, eventName }
 *   result: { blocked, sanitized?, sanitizedCommand?, reason, ruleId, risk, critical } | null
 */
function runEngine(event, config) {
  const eventName = event.hook_event_name || '';
  let result = null;
  let toolName = '';
  let preview = '';

  if (eventName === CURSOR_EVENT_BEFORE_SHELL) {
    toolName = 'Bash';
    const command = event.command || '';
    preview = command;
    result = checkCommand(command, config);
  } else if (eventName === CURSOR_EVENT_BEFORE_MCP) {
    toolName = event.tool_name || 'mcp';
    if (!isCheckDisabled(config, 'mcp_inspection')) {
      const blob = event.tool_input || event;
      preview = JSON.stringify(blob).slice(0, 200);
      const values = extractStringValues(blob);
      for (const v of values) {
        const r = checkInjection(v, config);
        if (r) { result = { blocked: true, reason: r.reason, ruleId: r.id, risk: 'high' }; break; }
      }
    }
  } else if (eventName === CURSOR_EVENT_BEFORE_READ) {
    toolName = 'Read';
    const filePath = event.file_path || '';
    preview = filePath;
    if (!isCheckDisabled(config, 'read_path_protection')) {
      result = checkReadPath(filePath, config);
      if (result) result.risk = 'high';
    }
  } else if (eventName === CURSOR_EVENT_PRE_TOOL) {
    // Cursor preserves tool_name + tool_input here (matches Claude shape)
    toolName = event.tool_name || '';
    const input = event.tool_input || {};
    if (['Bash', 'Monitor', 'PowerShell', 'Shell'].includes(toolName)) {
      const command = input.command || '';
      preview = command;
      result = checkCommand(command, config);
    } else if (['Write', 'Edit', 'NotebookEdit'].includes(toolName)) {
      const filePath = input.file_path || input.path || '';
      preview = filePath;
      result = checkWritePath(filePath, config);
    } else if (toolName === 'Read') {
      const filePath = input.file_path || input.path || '';
      preview = filePath;
      if (!isCheckDisabled(config, 'read_path_protection')) {
        result = checkReadPath(filePath, config);
        if (result) result.risk = 'high';
      }
    } else if (toolName === 'MultiEdit') {
      const paths = [input.file_path, ...((input.edits || []).map(e => e.file_path))].filter(Boolean);
      preview = paths.join(',');
      for (const fp of paths) {
        result = checkWritePath(fp, config);
        if (result) break;
      }
    } else if (toolName.startsWith('mcp__')) {
      if (!isCheckDisabled(config, 'mcp_inspection')) {
        preview = JSON.stringify(input).slice(0, 200);
        const values = extractStringValues(input);
        for (const v of values) {
          const r = checkInjection(v, config);
          if (r) { result = { blocked: true, reason: r.reason, ruleId: r.id, risk: 'high' }; break; }
        }
      }
    }
  } else if (eventName === CURSOR_EVENT_BEFORE_PROMPT) {
    toolName = 'UserPrompt';
    const prompt = event.prompt || event.user_message || '';
    preview = String(prompt).slice(0, 200);
    if (!isCheckDisabled(config, 'mcp_inspection')) {
      const r = checkInjection(prompt, config);
      if (r) result = { blocked: true, reason: r.reason, ruleId: r.id, risk: 'high' };
    }
  }

  return { result, toolName, preview, eventName };
}

/**
 * Build the Cursor response payload for a given engine result.
 * Returns: { response: object, exitCode: number }
 *
 * Wire format per Cursor docs (cursor.com/docs/hooks):
 *   - beforeSubmitPrompt → { continue: false, user_message }
 *   - all other gates    → { permission: 'allow'|'deny'|'ask', user_message, agent_message, updated_input? }
 *   - sessionStart       → { env?, additional_context? }
 */
function buildResponse(eventName, result, config, additionalCtx) {
  if (eventName === CURSOR_EVENT_SESSION_START ||
      eventName === CURSOR_EVENT_SESSION_END ||
      eventName === CURSOR_EVENT_STOP ||
      eventName === CURSOR_EVENT_SUBAGENT_STOP ||
      eventName === CURSOR_EVENT_PRE_COMPACT) {
    return { response: additionalCtx ? { additional_context: additionalCtx } : {}, exitCode: 0 };
  }

  if (!result) return { response: {}, exitCode: 0 };

  if (result.sanitized) {
    return {
      response: {
        permission: 'allow',
        user_message: `Knox sanitized: ${result.reason}`,
        updated_input: { command: result.sanitizedCommand }
      },
      exitCode: 0
    };
  }

  if (result.blocked) {
    if (eventName === CURSOR_EVENT_BEFORE_PROMPT) {
      return {
        response: {
          continue: false,
          user_message: `Knox erased prompt: ${result.reason}`
        },
        exitCode: 0
      };
    }

    const decision = config.use_ask_not_deny ? 'ask' : 'deny';
    const response = {
      permission: decision,
      user_message: result.reason,
      agent_message: result.reason
    };
    if (additionalCtx) response.agent_message = `${result.reason}\n\n${additionalCtx}`;
    return { response, exitCode: 0 };
  }

  return { response: {}, exitCode: 0 };
}

module.exports = {
  runEngine,
  buildResponse,
  // Exposed for tests
  extractStringValues,
  CURSOR_EVENTS: {
    CURSOR_EVENT_BEFORE_SHELL, CURSOR_EVENT_BEFORE_MCP, CURSOR_EVENT_BEFORE_READ,
    CURSOR_EVENT_PRE_TOOL, CURSOR_EVENT_BEFORE_PROMPT,
    CURSOR_EVENT_SESSION_START, CURSOR_EVENT_SESSION_END, CURSOR_EVENT_STOP,
    CURSOR_EVENT_SUBAGENT_STOP, CURSOR_EVENT_PRE_COMPACT
  }
};
