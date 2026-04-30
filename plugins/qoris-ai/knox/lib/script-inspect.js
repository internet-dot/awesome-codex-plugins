'use strict';
const fs = require('fs');
const path = require('path');
const { loadPatterns } = require('./patterns');

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_DEPTH = 3;
const MAX_FILES = 10;

function isBinary(buf) {
  return buf.slice(0, 1000).indexOf(0) !== -1;
}

function extractScriptPath(command) {
  // Match: bash script.sh, python3 ./script.py, sh -x ./setup.sh, ruby script.rb, perl script.pl
  const m = command.match(
    /\b(?:bash|sh|zsh|dash|python3?|node|ruby|perl)\s+(?:-[a-zA-Z]+\s+)*([^\s;&|<>]+\.[a-zA-Z]+)/i
  );
  if (m) return m[1];
  // Also match direct execution: ./script.sh
  const m2 = command.match(/(?:^|;\s*|&&\s*)(\.(\/[^\s;&|<>]+\.[a-zA-Z]+))/i);
  if (m2) return m2[1];
  return null;
}

function inspectScript(scriptPath, cwd, seen, depth) {
  if (!seen) seen = new Set();
  if (depth === undefined) depth = 0;
  if (depth > MAX_DEPTH || seen.size >= MAX_FILES) return null;

  const cwdResolved = path.resolve(cwd || process.cwd());
  const resolved = path.resolve(cwdResolved, scriptPath);

  // Path traversal check — must stay within cwd
  if (!resolved.startsWith(cwdResolved + path.sep) && resolved !== cwdResolved) {
    return { blocked: true, reason: `Path traversal: ${scriptPath} resolves outside workspace`, id: 'path-traversal' };
  }

  if (seen.has(resolved)) return null; // cycle detection
  seen.add(resolved);

  let buf;
  try {
    const stat = fs.statSync(resolved);
    if (stat.size > MAX_FILE_SIZE) {
      return { blocked: true, reason: `File too large: ${scriptPath}`, id: 'file-too-large' };
    }
    buf = fs.readFileSync(resolved);
  } catch {
    return null; // file not found / not readable — don't block
  }

  if (isBinary(buf)) {
    return { blocked: true, reason: `Binary file: ${scriptPath}`, id: 'binary-file' };
  }

  const content = buf.toString('utf8');
  const patterns = loadPatterns();

  // Check script content patterns
  for (const p of patterns.script_content_patterns) {
    if (p.re.test(content)) {
      return { blocked: true, reason: `Script contains ${p.label}: ${scriptPath}`, id: p.id, risk: p.risk };
    }
  }

  // Follow source/. includes recursively
  const sourceMatches = [...content.matchAll(/^\s*(?:source|\.) ([^\s;&|#\n]+)/mg)];
  for (const m of sourceMatches) {
    const sub = inspectScript(m[1].trim(), path.dirname(resolved), seen, depth + 1);
    if (sub && sub.blocked) return sub;
  }

  return null; // clean
}

module.exports = { extractScriptPath, inspectScript };
