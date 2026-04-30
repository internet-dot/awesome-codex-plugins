'use strict';
const { getBlocklistForPreset } = require('./patterns');
const { extractScriptPath, inspectScript } = require('./script-inspect');
const {
  checkEnvPrefix,
  checkEnvExport,
  checkKnoxFileMutate,
  checkAliasShadow,
  checkKnoxKill,
  checkVariableIndirection,
} = require('./self-protect');
const { unwrapAll } = require('./unwrap');
const { tokenize } = require('./tokenize');
const { analyzeRm, analyzeFind } = require('./parsers/rm');
const { extractInlineCode, inspectInline } = require('./inline-inspect');
const { checkExfilPair } = require('./exfil');
const { checkRedirectWrite } = require('./redirect');

// Patterns that are PROVISIONAL — they are replaced by smarter parsers in v1.1.
// Skipped in the regex pass; equivalent (or better) logic runs via the tokenized
// parsers and self-protection module.
const PROVISIONAL_BLOCKLIST_IDS = new Set([
  'BL-011', // bash_inline — blanket "bash -c" blocks too much; smart unwrap handles it
  'BL-001', // rm_rf_root — replaced by tokenized rm parser (lib/parsers/rm.js)
  'BL-002', // rm_rf_home — replaced by tokenized rm parser
  'BL-003', // rm_rf_relative — parser is authoritative
  'BL-040', // find_delete_exec — replaced by analyzeFind (only fires on sensitive targets)
]);

function normalizeCommand(cmd) {
  // Strip sudo + all flags (e.g. sudo -n -u root, sudo --non-interactive)
  return cmd.replace(/^\s*sudo\s+(?:-[A-Za-z]+\s+)*(?:--\S+\s+)*(?:-[A-Za-z]+=\S+\s+)*/, '').trim();
}

/**
 * Returns true if a check category has been disabled via config.disabled_checks.
 * 'blocklist' and 'self_protection' are never toggleable — callers must not pass them.
 */
function isCheckDisabled(config, checkName) {
  return Array.isArray(config.disabled_checks) && config.disabled_checks.includes(checkName);
}

/**
 * Check a Bash/Monitor/PowerShell command against policy.
 * Returns: { blocked, sanitized, decision, reason, ruleId, risk } or null (allow)
 */
function checkCommand(command, config) {
  const preset = (config && config.preset) || 'standard';
  const blocklist = getBlocklistForPreset(preset);

  // v1.1 P0: self-protection checks (unconditional — cannot be disabled)
  // These run FIRST so attackers can't hide behind wrapping/obfuscation.
  const envExport = checkEnvExport(command);
  if (envExport) return { ...envExport, sanitized: false };

  const envCheck = checkEnvPrefix(command);
  if (envCheck.blocked) return { ...envCheck, sanitized: false };

  const knoxMutate = checkKnoxFileMutate(command);
  if (knoxMutate) return { ...knoxMutate, sanitized: false };

  const aliasShadow = checkAliasShadow(command);
  if (aliasShadow) return { ...aliasShadow, sanitized: false };

  const knoxKill = checkKnoxKill(command);
  if (knoxKill) return { ...knoxKill, sanitized: false };

  const varIndir = checkVariableIndirection(command);
  if (varIndir) return { ...varIndir, sanitized: false };

  // Strip legitimate leading KEY=val assignments before matching (e.g. `DEBUG=1 npm test`)
  const effectiveCommand = envCheck.stripped || command;

  // Check if command contains sudo — for sanitization
  const hasSudo = /^\s*sudo\s/.test(effectiveCommand);
  const normalized = normalizeCommand(effectiveCommand);

  // v1.1 P1: unwrap wrappers (bash -c, eval, $(), backticks, <()) and splits (&&, ||, ;)
  // Recursively check each unwrapped fragment against the blocklist.
  const unwrapped = unwrapAll(effectiveCommand);
  unwrapped.add(normalized);

  // v1.1 P2: tokenized parsers for rm/find — catches variants that regex can't.
  for (const fragment of unwrapped) {
    const tokens = tokenize(fragment);
    const rmResult = analyzeRm(tokens);
    if (rmResult) return { ...rmResult, sanitized: false };
    const findResult = analyzeFind(tokens);
    if (findResult) return { ...findResult, sanitized: false };
  }

  // v1.1 P3: extract inline code from python -c / node -e / perl -e / ruby -e / php -r
  // and scan it for dangerous API calls.
  for (const fragment of unwrapped) {
    const inlineSnippets = extractInlineCode(fragment);
    for (const snippet of inlineSnippets) {
      const result = inspectInline(snippet.language, snippet.code);
      if (result) return { ...result, sanitized: false };
    }
  }

  // v1.1 P4: exfiltration conjunction check (sensitive read + egress)
  for (const fragment of unwrapped) {
    const exfilResult = checkExfilPair(fragment);
    if (exfilResult) return { ...exfilResult, sanitized: false };
  }

  // v1.1 P5: redirect-target parsing (persistence via >, >>, tee)
  for (const fragment of unwrapped) {
    const redirResult = checkRedirectWrite(fragment);
    if (redirResult) return { ...redirResult, sanitized: false };
  }

  // Default blocklist check on all unwrapped fragments
  for (const pattern of blocklist) {
    if (PROVISIONAL_BLOCKLIST_IDS.has(pattern.id)) continue;
    for (const fragment of unwrapped) {
      if (pattern.re.test(fragment)) {
        // sudo su is always blocked even with sudo stripping
        if (hasSudo && pattern.id === 'BL-024') {
          return { blocked: true, reason: 'Knox: Blocked — sudo su', ruleId: pattern.id, risk: pattern.risk, sanitized: false };
        }
        const decision = (config && config.use_ask_not_deny) ? 'ask' : 'deny';
        return {
          blocked: true,
          decision,
          reason: `Knox: Blocked — ${pattern.label.replace(/_/g, ' ')} [${pattern.id}]`,
          ruleId: pattern.id,
          risk: pattern.risk,
          sanitized: false
        };
      }
    }
  }

  // Custom blocklist (checked BEFORE allowlist)
  for (const cb of ((config && config.custom_blocklist) || [])) {
    try {
      const re = new RegExp(cb.pattern, cb.flags || 'i');
      if (re.test(normalized) || re.test(command)) {
        return {
          blocked: true,
          reason: `Knox: Blocked — custom rule: ${cb.label || cb.pattern}`,
          ruleId: 'custom',
          risk: cb.risk || 'high',
          sanitized: false
        };
      }
    } catch { /* invalid custom pattern — skip */ }
  }

  // Custom allowlist — checked LAST (cannot override default blocklist)
  for (const al of ((config && config.custom_allowlist) || [])) {
    try {
      const re = new RegExp(al.pattern, al.flags || 'i');
      if (re.test(normalized) || re.test(command)) {
        return null; // explicitly allowed
      }
    } catch { /* invalid pattern — skip */ }
  }

  // Script content inspection (standard+ presets, unless disabled)
  const scriptInspectionEnabled = config
    ? (config.script_inspection !== false && !isCheckDisabled(config, 'script_inspection'))
    : true;
  if (preset !== 'minimal' && scriptInspectionEnabled) {
    const scriptPath = extractScriptPath(command);
    if (scriptPath) {
      const result = inspectScript(scriptPath, process.env.KNOX_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd());
      if (result && result.blocked) {
        return {
          blocked: true,
          reason: `Knox: Blocked — ${result.reason}`,
          ruleId: result.id,
          risk: result.risk || 'high',
          sanitized: false
        };
      }
    }
  }

  // sudo sanitization at standard (not strict/paranoid — those deny outright)
  if (hasSudo && (config && config.sanitize_sudo !== false) && (preset === 'minimal' || preset === 'standard')) {
    return {
      blocked: false,
      sanitized: true,
      sanitizedCommand: normalized,
      reason: 'Knox: sudo stripped — running without elevation',
      ruleId: 'sanitize-sudo',
      risk: 'low'
    };
  }

  return null; // allow
}

// Sensitive paths blocked for Read tool
const SENSITIVE_READ_PREFIXES = [
  { p: '~/.ssh/', label: 'SSH private keys' },
  { p: '~/.aws/credentials', label: 'AWS credentials' },
  { p: '~/.gnupg/', label: 'GPG keys' },
  { p: '~/.kube/config', label: 'Kubernetes credentials' },
  { p: '~/.config/gcloud/', label: 'GCloud credentials' },
  { p: '~/.netrc', label: 'netrc credentials' }
];
const SENSITIVE_READ_EXACT = ['.env', '.env.local', '.env.production', '.env.development'];

/**
 * Check a file path for read protection (sensitive files).
 * Returns { blocked, reason } or null (allow).
 */
function checkReadPath(filePath, config) {
  if (config && isCheckDisabled(config, 'read_path_protection')) return null;
  const os = require('os');
  const p = require('path');
  const basename = p.basename(p.resolve(filePath));

  // Exact sensitive filenames
  for (const e of SENSITIVE_READ_EXACT) {
    if (basename === e || filePath === e) {
      return { blocked: true, reason: `Knox: Reading ${e} blocked — may contain secrets` };
    }
  }
  // Sensitive path prefixes
  for (const { p: prefix, label } of SENSITIVE_READ_PREFIXES) {
    const expanded = prefix.startsWith('~/') ? p.join(os.homedir(), prefix.slice(2)) : prefix;
    if (filePath.startsWith(prefix) || p.resolve(filePath).startsWith(p.resolve(expanded))) {
      return { blocked: true, reason: `Knox: Reading ${label} blocked (${prefix}*)` };
    }
  }
  return null;
}

/**
 * Check a file path for write protection.
 * Returns { blocked, critical, reason } or null (allow).
 */
function checkWritePath(filePath, config) {
  if (config && isCheckDisabled(config, 'write_path_protection')) return null;
  const { loadPatterns } = require('./patterns');
  const patterns = loadPatterns();
  const { exact, prefix } = patterns.protected_write_paths;

  const p = require('path');
  const os = require('os');
  const resolved = p.resolve(filePath);
  const basename = p.basename(resolved);

  for (const e of exact) {
    if (basename === e || filePath === e) {
      return { blocked: true, critical: true, reason: `Knox: Write to ${e} blocked` };
    }
  }
  for (const pfx of prefix) {
    if (pfx.startsWith('~/')) {
      // Expand ~/  and resolve for homedir-anchored paths
      const expanded = p.join(os.homedir(), pfx.slice(2));
      if (filePath.startsWith(pfx) || resolved.startsWith(expanded)) {
        return { blocked: true, critical: true, reason: `Knox: Write to ${pfx}* blocked` };
      }
    } else {
      // Literal prefix match only — never resolve relative paths like ../
      // (resolving ../ to CWD parent would match ALL project files)
      if (filePath.startsWith(pfx) || filePath === pfx.replace(/\/$/, '')) {
        return { blocked: true, critical: true, reason: `Knox: Write to ${pfx}* blocked` };
      }
    }
  }
  return null;
}

/**
 * Check text content for injection patterns.
 * Returns { detected, reason, id } or null.
 */
function checkInjection(text, config) {
  if (config && isCheckDisabled(config, 'injection_detection')) return null;
  const { loadPatterns } = require('./patterns');
  const patterns = loadPatterns();
  for (const p of patterns.injection_patterns) {
    if (p.re.test(text)) {
      return { detected: true, reason: `Knox: Injection pattern detected — ${p.label}`, id: p.id };
    }
  }
  return null;
}

module.exports = {
  checkCommand,
  checkWritePath,
  checkReadPath,
  checkInjection,
  normalizeCommand,
  isCheckDisabled
};
