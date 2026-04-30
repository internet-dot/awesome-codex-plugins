'use strict';
const { tokenize, expandPath } = require('../tokenize');
const os = require('os');
const path = require('path');

// Targets where recursive delete is always catastrophic
const SENSITIVE_TARGETS = [
  '/', '/etc', '/var', '/usr', '/bin', '/boot', '/lib', '/lib64',
  '/opt', '/root', '/sbin', '/sys', '/proc',
  // Note: /home intentionally excluded — would false-positive on `rm -rf ~/test`
  // which is legitimate cleanup inside the user's own home directory.
  // `rm -rf ~` itself is still caught by isHomeTarget.
];

function isHomeTarget(absPath, home) {
  // Match home itself (but NOT a subdir like ~/projects)
  return absPath === home || absPath === home + '/';
}

const HOME_SENSITIVE_DIRS = ['.ssh', '.aws', '.gnupg', '.kube', '.config/gcloud', '.gcloud'];

function isSensitiveTarget(absPath, home) {
  if (isHomeTarget(absPath, home)) return true;
  // Exact system paths and any subdirectory of them
  for (const t of SENSITIVE_TARGETS) {
    if (absPath === t || absPath === t + '/' || absPath.startsWith(t + '/')) return true;
  }
  // /home/<otheruser> is sensitive (wiping another user's home).
  // /home/<current>/anything is allowed — legitimate dev workflow.
  if (absPath === '/home' || absPath === '/home/') return true;
  const homeMatch = absPath.match(/^\/home\/([^/]+)/);
  if (homeMatch) {
    const targetUser = homeMatch[1];
    const currentHome = home.match(/^\/home\/([^/]+)/);
    if (!currentHome || currentHome[1] !== targetUser) return true;
  }
  // Sensitive dotfile dirs inside home
  for (const d of HOME_SENSITIVE_DIRS) {
    const full = home + '/' + d;
    if (absPath === full || absPath === full + '/' || absPath.startsWith(full + '/')) return true;
  }
  return false;
}

/**
 * Parse an rm invocation and determine if it targets a sensitive path.
 * Returns { blocked, reason, target } or null.
 */
function analyzeRm(tokens) {
  if (tokens.length === 0) return null;

  // First token must be rm or end with /rm (e.g. /bin/rm, /usr/bin/rm)
  const cmd = tokens[0];
  const cmdBase = path.basename(cmd);
  if (cmdBase !== 'rm') return null;

  const home = os.homedir();
  let recursive = false;
  let force = false;
  let noPreserveRoot = false;
  const targets = [];

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '--') {
      // Everything after is positional
      for (let j = i + 1; j < tokens.length; j++) targets.push(tokens[j]);
      break;
    }
    if (t.startsWith('--')) {
      if (t === '--recursive') recursive = true;
      else if (t === '--force') force = true;
      else if (t === '--no-preserve-root') noPreserveRoot = true;
      continue;
    }
    if (t.startsWith('-') && t.length > 1) {
      // Short flags can be clustered: -rf, -fr, -Rf, -rfI, etc.
      const chars = t.slice(1);
      if (/r/i.test(chars) || /R/.test(chars)) recursive = true;
      if (/f/.test(chars)) force = true;
      continue;
    }
    targets.push(t);
  }

  if (!recursive && !force) return null; // plain `rm file.txt` — not our concern

  for (const target of targets) {
    const abs = expandPath(target, home);
    // Relative path traversal: rm -rf ../../ walks toward filesystem root
    // without knowing cwd we can't resolve exactly, but 2+ parent traversals
    // are almost always a destructive escape attempt
    if (/^(?:\.\.\/){2,}/.test(target) || target === '../..' || /^\.\.\/?$/.test(target)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — destructive rm with parent-traversal target: ${target} [SP-RM]`,
        ruleId: 'SP-RM',
        risk: 'high',
      };
    }
    if (isSensitiveTarget(abs, home)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — destructive rm targeting ${abs} [SP-RM]`,
        ruleId: 'SP-RM',
        risk: 'critical',
      };
    }
    // --no-preserve-root + any / target is destructive
    if (noPreserveRoot && (abs === '/' || abs.startsWith('/'))) {
      if (SENSITIVE_TARGETS.some(s => abs === s || abs.startsWith(s + '/') || s.startsWith(abs))) {
        return {
          blocked: true,
          reason: `Knox: Blocked — rm --no-preserve-root ${abs} [SP-RM]`,
          ruleId: 'SP-RM',
          risk: 'critical',
        };
      }
    }
  }

  return null;
}

/**
 * Parse a find invocation and determine if it targets a sensitive path
 * with a destructive action (-delete or -exec rm).
 */
// Secret filename patterns that find -name / -iname targets should never expose
const SECRET_FILENAME_PATTERNS = /^(?:id_[a-z0-9_]*|.*_rsa|.*_ed25519|.*_ecdsa|.*_dsa|.*\.pem|.*\.key|.*\.keystore|credentials|shadow|authorized_keys|\.env.*)$/i;
// Commands that leak secret content when fed via find -exec
const SECRET_LEAK_EXEC = /^(?:cat|less|more|head|tail|xxd|od|base64|strings|nc|ncat|curl|wget)$/;

function analyzeFind(tokens) {
  if (tokens.length === 0 || tokens[0] !== 'find') return null;

  const home = os.homedir();
  // Collect paths before any expression (`find PATH... -expr`)
  const paths = [];
  let i = 1;
  while (i < tokens.length && !tokens[i].startsWith('-') && !tokens[i].startsWith('(')) {
    paths.push(tokens[i]);
    i++;
  }
  if (paths.length === 0) return null;

  const rest = tokens.slice(i);
  const hasDelete = rest.some(t => t === '-delete');
  const hasExecRm = rest.some((t, idx) =>
    t === '-exec' && idx + 1 < rest.length && (
      rest[idx + 1] === 'rm' ||
      rest[idx + 1] === '/bin/rm' ||
      rest[idx + 1] === '/usr/bin/rm' ||
      rest[idx + 1] === 'unlink' ||
      /sh|bash/.test(rest[idx + 1])
    )
  );

  // find -name SECRET -exec READER {} \;  →  secret exfiltration without a literal path
  let secretExec = false;
  for (let idx = 0; idx < rest.length - 1; idx++) {
    if ((rest[idx] === '-name' || rest[idx] === '-iname') && SECRET_FILENAME_PATTERNS.test(rest[idx + 1])) {
      // Look for -exec <reader>
      for (let j = idx + 2; j < rest.length - 1; j++) {
        if (rest[j] === '-exec' && SECRET_LEAK_EXEC.test(rest[j + 1])) {
          secretExec = true;
          break;
        }
      }
      if (secretExec) break;
    }
  }
  if (secretExec) {
    return {
      blocked: true,
      reason: 'Knox: Blocked — find targeting secret filenames with -exec reader [SP-FIND]',
      ruleId: 'SP-FIND',
      risk: 'critical',
    };
  }

  if (!hasDelete && !hasExecRm) return null;

  for (const pathArg of paths) {
    const abs = expandPath(pathArg, home);
    if (isSensitiveTarget(abs, home)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — find destructive on ${abs} [SP-FIND]`,
        ruleId: 'SP-FIND',
        risk: 'high',
      };
    }
  }
  return null;
}

module.exports = { analyzeRm, analyzeFind, isSensitiveTarget, SENSITIVE_TARGETS };
