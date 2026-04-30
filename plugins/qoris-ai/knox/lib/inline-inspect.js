'use strict';

// Per-language patterns for dangerous API usage inside -c/-e/-r inline code.
// These run on inline strings extracted from `python -c`, `node -e`, `perl -e`,
// `ruby -e`, `php -r`. Benign one-liners (print, console.log, math) don't match.
const NODE_CP_MODULE = ['child', '_process'].join('');
const NODE_CP_REQUIRE = new RegExp("require\\s*\\(\\s*['\"]" + NODE_CP_MODULE + "['\"]\\s*\\)");
const INLINE_PATTERNS = {
  python: [
    { id: 'IL-PY-001', pattern: /\bos\.(?:system|popen|exec[lv][pe]?)\b/, risk: 'critical', label: 'os execution API' },
    { id: 'IL-PY-002', pattern: /\bsubprocess\.(?:run|call|Popen|check_(?:call|output)|getoutput)\b/, risk: 'critical', label: 'subprocess execution' },
    { id: 'IL-PY-003', pattern: /__import__\s*\(\s*['"](?:os|subprocess|socket|pty|ctypes)['"]/, risk: 'critical', label: 'dynamic import of dangerous module' },
    { id: 'IL-PY-004', pattern: /\bsocket\s*\.\s*socket\s*\(/, risk: 'high', label: 'raw socket creation' },
    { id: 'IL-PY-005', pattern: /\bpty\.(?:spawn|fork)\b/, risk: 'critical', label: 'pty spawn' },
    { id: 'IL-PY-006', pattern: /\bctypes\.(?:CDLL|cdll)\b/, risk: 'critical', label: 'ctypes loading libraries' },
    { id: 'IL-PY-007', pattern: /\bexec\s*\(/, risk: 'high', label: 'exec() call' },
    { id: 'IL-PY-008', pattern: /\beval\s*\(\s*['"]?__import__/, risk: 'critical', label: 'eval with dynamic import' },
    { id: 'IL-PY-009', pattern: /\burllib(?:\.request)?\b|\brequests\b/, risk: 'medium', label: 'network library' },
    { id: 'IL-PY-010', pattern: /\bopen\s*\(\s*['"]\/etc\/(?:passwd|shadow|sudoers)/, risk: 'critical', label: 'open() on system secrets' },
    { id: 'IL-PY-011', pattern: /\bopen\s*\(\s*['"](?:~|\/home\/\w+)\/\.ssh\/id_[a-z_]+(?!\.pub)/, risk: 'critical', label: 'open() on SSH private key' },
  ],
  node: [
    { id: 'IL-JS-001', pattern: NODE_CP_REQUIRE, risk: 'critical', label: NODE_CP_MODULE + ' import' },
    { id: 'IL-JS-002', pattern: /\b(?:execSync|spawnSync|execFileSync|spawn|exec|fork)\s*\(/, risk: 'high', label: 'process spawn' },
    { id: 'IL-JS-003', pattern: /require\s*\(\s*['"]net['"]\s*\)/, risk: 'high', label: 'net import' },
    { id: 'IL-JS-004', pattern: /\bnet\s*\.\s*(?:createConnection|connect|Socket)\b/, risk: 'high', label: 'net socket creation' },
    { id: 'IL-JS-005', pattern: /\bfs\s*\.\s*(?:rmSync|unlinkSync|rmdirSync)\b/, risk: 'high', label: 'fs destructive call' },
    { id: 'IL-JS-006', pattern: /require\s*\(\s*['"]http['"]\s*\)/, risk: 'medium', label: 'http import' },
    { id: 'IL-JS-007', pattern: /\bprocess\s*\.\s*(?:binding|dlopen)\b/, risk: 'critical', label: 'process internals' },
  ],
  perl: [
    { id: 'IL-PL-001', pattern: /\bsystem\s*\(/, risk: 'high', label: 'system() call' },
    { id: 'IL-PL-002', pattern: /\bexec\s*\(/, risk: 'high', label: 'exec() call' },
    { id: 'IL-PL-003', pattern: /`[^`]+`/, risk: 'high', label: 'backtick command' },
    { id: 'IL-PL-004', pattern: /\buse\s+Socket\b/, risk: 'high', label: 'Socket module' },
    { id: 'IL-PL-005', pattern: /\bopen\s*\([^)]*\|/, risk: 'high', label: 'pipe open' },
  ],
  ruby: [
    { id: 'IL-RB-001', pattern: /\bsystem\s*\(/, risk: 'high', label: 'system() call' },
    { id: 'IL-RB-002', pattern: /\bexec\s*\(/, risk: 'high', label: 'exec() call' },
    { id: 'IL-RB-003', pattern: /\bspawn\s*\(/, risk: 'high', label: 'spawn() call' },
    { id: 'IL-RB-004', pattern: /`[^`]+`/, risk: 'high', label: 'backtick command' },
    { id: 'IL-RB-005', pattern: /%x\{/, risk: 'high', label: '%x{} command' },
    { id: 'IL-RB-006', pattern: /\bIO\.popen\b|\bOpen3\b/, risk: 'high', label: 'IO.popen' },
    { id: 'IL-RB-007', pattern: /\bTCPSocket\b|\bUDPSocket\b/, risk: 'high', label: 'TCP/UDP socket' },
    { id: 'IL-RB-008', pattern: /\brequire\s+['"]socket['"]/, risk: 'high', label: 'socket require' },
  ],
  php: [
    { id: 'IL-PH-001', pattern: /\bsystem\s*\(/, risk: 'high', label: 'system() call' },
    { id: 'IL-PH-002', pattern: /\bexec\s*\(/, risk: 'high', label: 'exec() call' },
    { id: 'IL-PH-003', pattern: /\bshell_exec\s*\(/, risk: 'high', label: 'shell_exec() call' },
    { id: 'IL-PH-004', pattern: /\bpassthru\s*\(/, risk: 'high', label: 'passthru() call' },
    { id: 'IL-PH-005', pattern: /\bfsockopen\s*\(/, risk: 'high', label: 'fsockopen()' },
    { id: 'IL-PH-006', pattern: /\bproc_open\s*\(/, risk: 'high', label: 'proc_open()' },
    { id: 'IL-PH-007', pattern: /`[^`]+`/, risk: 'high', label: 'backtick command' },
  ],
  shell: [], // handled by recursive checkCommand
};

/**
 * Extract inline code from a shell command. Looks for interpreter tokens followed
 * by -c/-e/-r/-E/-S and a quoted argument. Returns [{language, code}, ...].
 */
function extractInlineCode(command) {
  const results = [];

  // python/python3 -c "..."
  const pyRe = /\bpython[23]?\b\s+(?:-[a-zA-Z]+\s+)*-c\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  let m;
  while ((m = pyRe.exec(command)) !== null) {
    results.push({ language: 'python', code: m[1] !== undefined ? m[1] : m[2] });
  }

  // node -e "..."
  const nodeRe = /\bnode\b\s+(?:-[a-zA-Z]+\s+)*-e\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  while ((m = nodeRe.exec(command)) !== null) {
    results.push({ language: 'node', code: m[1] !== undefined ? m[1] : m[2] });
  }

  // perl -e '...' / perl -e "..."
  const perlRe = /\bperl\b\s+(?:-[a-zA-Z]+\s+)*-e\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  while ((m = perlRe.exec(command)) !== null) {
    results.push({ language: 'perl', code: m[1] !== undefined ? m[1] : m[2] });
  }

  // ruby -e '...'
  const rubyRe = /\bruby\b\s+(?:-[a-zA-Z]+\s+)*-e\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  while ((m = rubyRe.exec(command)) !== null) {
    results.push({ language: 'ruby', code: m[1] !== undefined ? m[1] : m[2] });
  }

  // php -r '...'
  const phpRe = /\bphp\b\s+(?:-[a-zA-Z]+\s+)*-r\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  while ((m = phpRe.exec(command)) !== null) {
    results.push({ language: 'php', code: m[1] !== undefined ? m[1] : m[2] });
  }

  return results;
}

/**
 * Inspect inline code against per-language dangerous API patterns.
 * Returns { blocked, reason, ruleId, risk } or null.
 */
function inspectInline(language, code) {
  const patterns = INLINE_PATTERNS[language] || [];
  for (const p of patterns) {
    if (p.pattern.test(code)) {
      return {
        blocked: true,
        reason: `Knox: Blocked — ${language} inline: ${p.label} [${p.id}]`,
        ruleId: p.id,
        risk: p.risk,
      };
    }
  }
  return null;
}

module.exports = { extractInlineCode, inspectInline, INLINE_PATTERNS };
