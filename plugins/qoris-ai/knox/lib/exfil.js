'use strict';

// Paths that are NEVER legitimately debugged via `cat` + network pipe.
// .pub is explicitly excluded via negative-lookahead.
const SENSITIVE_READ_PATTERNS = [
  /~?\/?\.ssh\/id_[a-z_]+(?!\.pub)/,       // SSH private keys (excludes .pub)
  /~?\/?\.ssh\/.*_key\b(?!\.pub)/,         // any private key naming
  /~?\/?\.ssh\/\s|~?\/?\.ssh\b\s|~?\/?\.ssh\//, // ~/.ssh directory itself
  /~?\/?\.aws\/credentials\b/,             // AWS creds
  /~?\/?\.aws\b\s|~?\/?\.aws\//,           // .aws dir
  /~?\/?\.gnupg\/(?:secring|private-keys)/, // GPG private keys
  /~?\/?\.gnupg\b\s|~?\/?\.gnupg\//,       // gnupg dir
  /~?\/?\.config\/gcloud\b/,
  /~?\/?\.kube\/config\b|~?\/?\.kube\b\s/,
  /~?\/?\.netrc\b/,
  /\/etc\/shadow\b/,
  /\/etc\/sudoers\b/,
  /~?\/?\.docker\/config\.json/,
];

// Files so sensitive they should never be read from agent context, even
// without egress. Catches cases like `cat /etc/shadow` alone.
const UNCONDITIONAL_SECRET_READS = [
  /^(?:\S*\s+)*?\/etc\/shadow\b/,          // cat /etc/shadow
  /\bread\s+.*\/etc\/shadow\b/,
  /~?\/?\.gnupg\/private-keys-v1\.d/,       // GPG private keys dir
  /~?\/?\.gnupg\/secring\b/,                // GPG secret ring
];

// Find+cat exfil: `find / -name id_rsa | xargs cat` stages a private-key read
const FIND_XARGS_SECRET = /\bfind\b[^|;]*-name\b[^|;]*(?:id_[a-z_]+|\.pem|\.key|credentials|shadow)[^|]*\|\s*xargs\b[^|;]*\b(?:cat|less|more|base64|xxd|openssl)\b/;

// Extra heuristic: archiving sensitive dirs is suspicious even without explicit egress
const ARCHIVE_SENSITIVE = /\b(?:zip|tar|7z|rar)\b[^|;&]*(?:~\/?\.ssh|~\/?\.aws|~\/?\.gnupg|\/etc\/shadow|\/etc\/sudoers)/;

// Egress verbs: network out, encoded/archived out, host-to-host copy.
const EGRESS_PATTERNS = [
  /\bnc\b\s+[^|;&]*\s\d+/,                                 // nc host port
  /\bncat\b\s+[^|;&]*\s\d+/,
  /\bcurl\b[^|;]*-[dFT]\s*@/,                              // curl data upload from file
  /\bcurl\b[^|;]*(?:-X\s*(?:POST|PUT)|--upload-file)/,     // curl POST/PUT/upload
  /\bwget\b[^|;]*--(?:post-file|body-file)/,               // wget file post
  /\bscp\b[^|;]*\s\S+:/,                                   // scp remote target
  /\brsync\b[^|;]*\s\S+@\S+:/,                             // rsync remote target
  /\bsftp\b\s+\S+@\S+/,                                    // sftp
  /\bftp\b\s+\S+\.\S+/,                                    // ftp
  />\s*\/dev\/(?:tcp|udp)\//,                              // bash /dev/tcp redirect
  /\bdig\b\s+@\S+/,                                        // dig with explicit server (DNS exfil)
  /\|\s*base64\s*(?:-[de]|--decode|--encode)?\s*\|/,       // encoded pipe chain (intermediary step)
];

// Direct copy verbs: copying a sensitive file anywhere off-host or outside ~/.ssh
const COPY_VERBS = /\b(?:cp|mv)\b/;

/**
 * Check for sensitive path reads paired with egress.
 * Returns { blocked, reason } or null.
 */
function checkExfilPair(command) {
  // Unconditional blocks — these paths have zero legitimate read use.
  for (const p of UNCONDITIONAL_SECRET_READS) {
    if (p.test(command)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — read of highly sensitive path [SP-EX]`,
        ruleId: 'SP-EX',
        risk: 'critical',
      };
    }
  }

  // find ... | xargs cat/base64 against known secret filenames
  if (FIND_XARGS_SECRET.test(command)) {
    return {
      blocked: true,
      reason: `Knox: Blocked — find+xargs secret enumeration [SP-EX]`,
      ruleId: 'SP-EX',
      risk: 'critical',
    };
  }

  // Archive of a sensitive directory is independently suspicious — attacker
  // often stages the archive then exfiltrates in a separate command.
  if (ARCHIVE_SENSITIVE.test(command)) {
    return {
      blocked: true,
      reason: `Knox: Blocked — archiving sensitive directory [SP-EX]`,
      ruleId: 'SP-EX',
      risk: 'high',
    };
  }

  const sensitiveMatches = [];
  for (const p of SENSITIVE_READ_PATTERNS) {
    const m = command.match(p);
    if (m) sensitiveMatches.push(m[0]);
  }
  if (sensitiveMatches.length === 0) return null;

  const egressMatches = [];
  for (const p of EGRESS_PATTERNS) {
    if (p.test(command)) egressMatches.push(p.source);
  }
  if (egressMatches.length > 0) {
    return {
      blocked: true,
      reason: `Knox: Blocked — exfiltration pattern: sensitive read (${sensitiveMatches[0]}) + network egress [SP-EX]`,
      ruleId: 'SP-EX',
      risk: 'critical',
    };
  }

  // scp/rsync of sensitive paths is exfil even without a separate egress verb
  if (/\bscp\b|\brsync\b/.test(command)) {
    return {
      blocked: true,
      reason: `Knox: Blocked — scp/rsync of sensitive path: ${sensitiveMatches[0]} [SP-EX]`,
      ruleId: 'SP-EX',
      risk: 'critical',
    };
  }

  // cp/mv of SSH private key is exfil (copying key anywhere but ~/.ssh)
  if (COPY_VERBS.test(command) && /\/\.ssh\/id_/.test(command)) {
    // Check if destination is also ~/.ssh
    if (!/\.ssh\/.*\.ssh\//.test(command)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — SSH private key copied outside ~/.ssh [SP-EX]`,
        ruleId: 'SP-EX',
        risk: 'critical',
      };
    }
  }

  return null;
}

module.exports = { checkExfilPair, SENSITIVE_READ_PATTERNS, EGRESS_PATTERNS };
