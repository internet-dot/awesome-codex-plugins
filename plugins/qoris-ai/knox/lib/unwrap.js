'use strict';

// Maximum recursion depth for unwrapping (prevents pathological nesting DoS)
const MAX_UNWRAP_DEPTH = 4;

/**
 * Extract inner command from common wrapper forms. Returns an array of strings
 * representing the inner commands to recursively check. Empty array means no
 * extractable wrapper found.
 */
function extractInner(command) {
  const inners = [];

  // bash -c "cmd" / sh -c 'cmd' / zsh -c "cmd" / dash -c 'cmd' / ksh -c
  const shRe = /\b(?:bash|sh|zsh|dash|ksh|fish)\b\s+-c\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  let m;
  while ((m = shRe.exec(command)) !== null) {
    const inner = m[1] !== undefined ? m[1] : m[2];
    if (inner) inners.push(inner);
  }

  // eval "cmd" / eval 'cmd'
  const evalRe = /\beval\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  while ((m = evalRe.exec(command)) !== null) {
    const inner = m[1] !== undefined ? m[1] : m[2];
    if (inner) inners.push(inner);
  }

  // $(cmd) — command substitution. Limit to 256 chars to avoid false positives on complex scripts.
  const cmdSubRe = /\$\(((?:[^()]|\([^)]*\))*)\)/g;
  while ((m = cmdSubRe.exec(command)) !== null) {
    if (m[1] && m[1].length < 256) inners.push(m[1]);
  }

  // `cmd` — backtick substitution
  const backtickRe = /`([^`]{1,256})`/g;
  while ((m = backtickRe.exec(command)) !== null) {
    if (m[1]) inners.push(m[1]);
  }

  // <(cmd) — process substitution (bash/zsh only)
  const procSubRe = /<\(([^)]+)\)/g;
  while ((m = procSubRe.exec(command)) !== null) {
    if (m[1]) inners.push(m[1]);
  }

  return inners;
}

/**
 * Split a command on shell delimiters (;, &&, ||) into segments.
 * Skips delimiters inside single/double quotes.
 */
function splitDelimiters(command) {
  const segments = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;
  let i = 0;
  while (i < command.length) {
    const c = command[i];
    const n = command[i + 1];
    if (!inSingle && c === '"' && command[i - 1] !== '\\') {
      inDouble = !inDouble;
      current += c;
      i++;
      continue;
    }
    if (!inDouble && c === "'" && command[i - 1] !== '\\') {
      inSingle = !inSingle;
      current += c;
      i++;
      continue;
    }
    if (!inDouble && !inSingle) {
      if (c === ';' || (c === '&' && n === '&') || (c === '|' && n === '|')) {
        if (current.trim()) segments.push(current.trim());
        current = '';
        i += (c === ';') ? 1 : 2;
        continue;
      }
    }
    current += c;
    i++;
  }
  if (current.trim()) segments.push(current.trim());
  return segments.length > 1 ? segments : []; // empty if no delimiters
}

/**
 * Recursively unwrap and return all sub-commands that should be checked.
 * Returns the set of all distinct strings (original + unwrapped + split).
 */
function unwrapAll(command, depth = 0) {
  const result = new Set([command]);
  if (depth >= MAX_UNWRAP_DEPTH) return result;

  // Split on delimiters first
  const segments = splitDelimiters(command);
  for (const seg of segments) {
    if (!result.has(seg)) {
      for (const sub of unwrapAll(seg, depth + 1)) result.add(sub);
    }
  }

  // Extract from wrappers
  const inners = extractInner(command);
  for (const inner of inners) {
    if (!result.has(inner)) {
      for (const sub of unwrapAll(inner, depth + 1)) result.add(sub);
    }
  }

  return result;
}

module.exports = { extractInner, splitDelimiters, unwrapAll, MAX_UNWRAP_DEPTH };
