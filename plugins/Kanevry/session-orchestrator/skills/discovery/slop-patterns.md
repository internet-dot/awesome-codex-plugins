# AI Slop Detection Patterns

Reference document for the `ai-slop` probe. Contains grep-compatible regex patterns organized by category. All patterns are usable directly with the Grep tool (`-i` for case-insensitive, `--multiline true` for cross-line). Target glob: `*.{ts,tsx,js,jsx,py,go,rs,java,rb}`.

---

## 1. Filler Phrases in Comments

```
(as you can see|it's worth noting|needless to say|it should be noted|obviously|of course|basically|essentially|simply|let's go ahead|let's proceed|moving on to)
```
Case-insensitive. High false-positive for "simply"/"of course" in prose docs — verify they appear in code comments.

## 2. Over-Documentation

### 2a. Param docs repeating parameter name
```
@param\s+(\w+)\s+[-—]\s*(the\s+)?\1
```

### 2b. Returns docs that say nothing
```
@returns?\s+(the\s+)?(result|value|output|response|data|return value)\.?\s*$
```

### 2c. Comment-to-code ratio
Not regex — count comment lines vs code lines per function. Flag if comments > code (excluding file headers/licenses).

## 3. Hallucinated Imports

### 3a. Relative imports — verify file exists
```
from\s+["'](\.\.?/[^"']+)["']
```
Resolve path and check `.ts`, `.tsx`, `.js`, `/index.ts`, `/index.js` variants.

### 3b. Package imports — verify in package.json
```
from\s+["']([^./][^"']*)["']
```
Extract package name (handle `@scope/package`), cross-check against `dependencies` + `devDependencies`.

## 4. Unnecessary Complexity

### 4a. Try-catch wrapping non-throwing sync operations
```
try\s*\{[^}]*\b(const|let|var)\s+\w+\s*=\s*[^;]*;?\s*\}\s*catch
```
Multiline. High false-positive — focus on pure assignments, string/array ops that cannot throw.

### 4b. Re-implementing standard library functions
```
function\s+(isEmpty|isNull|isUndefined|isNil|isString|isNumber|isArray|isObject|isFunction|capitalize|camelCase|kebabCase|snakeCase|flatten|uniq|chunk|range|clamp|noop)\s*\(
```

### 4c. Excessive null checks on narrowed types
```
if\s*\(\s*\w+\s*(!=|!==)\s*(null|undefined)\s*\)\s*\{[^}]*\}\s*(else\s*\{[^}]*\})?
```
Requires type-awareness. Flag when variable already narrowed by previous check/guard.

## 5. Generic Error Messages

### 5a. Generic "error occurred"
```
catch.*throw new Error\(["'].*error occurred
```

### 5b. Error logging without context
```
catch.*console\.(log|error)\(["']error
```

### 5c. Empty catch blocks
```
catch\s*\(\w+\)\s*\{\s*\}
```
Multiline.

### 5d. Catch-and-rethrow without context
```
catch\s*\(\s*(\w+)\s*\)\s*\{\s*throw\s+\1\s*;?\s*\}
```
Multiline.

## 6. Redundant Code

### 6a. Redundant type assertions
```
as string(?=\s*[;,)\]])
```
Only flag when value is already typed as `string`.

### 6b. Explicit boolean comparisons
```
===?\s*true\b|===?\s*false\b|!==?\s*true\b|!==?\s*false\b
```

### 6c. Unnecessary return await
```
return\s+await\s+
```
Only flag when NOT inside try-catch (return await in try-catch is correct).

### 6d. If/else returning boolean literals
```
if\s*\([^)]+\)\s*\{?\s*return\s+true\s*;?\s*\}?\s*else\s*\{?\s*return\s+false
```
Multiline. Fix: `return <condition>`.

### 6e. Double negation
```
!!\w+
```
Sometimes intentional for boolean coercion. Flag only when value is already boolean.
