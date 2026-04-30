'use strict';

/**
 * argv-style shell tokenizer. Zero dependencies. Handles:
 * - single and double quoted strings (preserves content)
 * - escaped chars
 * - multiple whitespace separators
 * - simple variable references ($HOME, ${HOME}) — preserved as literal tokens
 *
 * Not a full shell parser — ignores redirects, pipes, expansions.
 * Caller is responsible for handling those before/after tokenizing.
 */
function tokenize(command) {
  const tokens = [];
  let current = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let hasContent = false;

  while (i < command.length) {
    const c = command[i];

    if (inSingle) {
      if (c === "'") {
        inSingle = false;
      } else {
        current += c;
      }
      i++;
      continue;
    }

    if (inDouble) {
      if (c === '"') {
        inDouble = false;
      } else if (c === '\\' && i + 1 < command.length) {
        current += command[i + 1];
        i += 2;
        continue;
      } else {
        current += c;
      }
      i++;
      continue;
    }

    if (c === "'") {
      inSingle = true;
      hasContent = true;
      i++;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      hasContent = true;
      i++;
      continue;
    }
    if (c === '\\' && i + 1 < command.length) {
      current += command[i + 1];
      hasContent = true;
      i += 2;
      continue;
    }
    if (/\s/.test(c)) {
      if (hasContent) {
        tokens.push(current);
        current = '';
        hasContent = false;
      }
      i++;
      continue;
    }
    current += c;
    hasContent = true;
    i++;
  }
  if (hasContent) tokens.push(current);
  return tokens;
}

/**
 * Expand a path token: handle ~, ~/, $HOME, ${HOME}.
 * Returns an absolute path or the original if not recognized.
 */
function expandPath(token, home) {
  if (!token) return token;
  const os = require('os');
  const path = require('path');
  home = home || os.homedir();

  // Strip surrounding quotes if any survived
  let t = token.replace(/^["']|["']$/g, '');

  // $HOME, ${HOME}, "$HOME", "${HOME}"
  t = t.replace(/\$\{HOME\}|\$HOME\b/g, home);

  // ~ or ~/...
  if (t === '~') return home;
  if (t.startsWith('~/')) return path.join(home, t.slice(2));

  return t;
}

module.exports = { tokenize, expandPath };
