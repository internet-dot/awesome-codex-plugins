---

<!-- TOC: Core Insight | THE EXACT PROMPT | Quick Reference | When to Use | Critical Rules | Suppression | Triage | Troubleshooting | AI Validation | References -->

# Using UBS for Code Review

> **Core Insight:** UBS catches what compiles but crashes — null derefs, missing await, resource leaks, security holes. It has many false positives; triage is essential, not optional.

## The Golden Rule

```
ubs <changed-files> before every commit.
Exit 0 = safe to proceed.
Exit 1 = triage findings.
Exit 2 = run `ubs doctor --fix`.
```

---

## THE EXACT PROMPT — Fix-Verify Loop

```
1. Scan: Run UBS on changed files
   ubs --staged                    # Staged files (<1s)
   ubs --diff                      # Unstaged changes vs HEAD
   ubs file.ts file2.py            # Specific files

2. Triage each finding:
   Real bug?        → Fix root cause (not symptom)
   False positive?  → // ubs:ignore — [why it's safe]

3. Re-run until exit 0
   ubs --staged

4. Commit when clean
```

### Why This Workflow Works

- **`--staged` is fast** — Scans only what you're committing
- **Fix root cause** — Masking symptoms creates debt
- **Exit 0 gate** — Clean scan = confidence to commit
- **Justification required** — Every `ubs:ignore` must explain why

---

## Quick Reference

```bash
# Core workflow
ubs --staged                       # Staged files only (<1s)
ubs --diff                         # Working tree changes vs HEAD
ubs .                              # Full project scan

# Language-specific (--only=js excludes TS!)
ubs --only=go,rust src/            # Go and Rust only
ubs --only=ts,tsx frontend/        # TypeScript (js≠ts)

# Noise reduction
ubs --skip=11,12 .                 # Skip TODO/debug categories
ubs --profile=loose .              # Skip minor nits

# Output formats (json=summary, jsonl=per-finding details)
ubs . --format=jsonl                          # Per-finding details
ubs . --format=sarif > results.sarif          # IDE/GitHub integration

# PR review (new issues only)
ubs . --comparison=baseline.json --fail-on-warning

# Troubleshooting
ubs doctor                         # Check environment
ubs doctor --fix                   # Auto-fix issues
```

---

## When to Use What

| You Want | Command | Why |
|----------|---------|-----|
| Quick pre-commit | `ubs --staged` | Fast, only staged files |
| Strict gate | `--fail-on-warning` | Blocks on all findings |
| Skip noise | `--skip=11,12` | TODO/debug categories |
| Language focus | `--only=go,py` | Target specific languages |
| PR review | `--comparison=baseline.json` | Shows NEW issues only |
| Security audit | `--category=security` | Focused security scan |
| Full report | `--html-report=out.html` | Shareable dashboard |
| Per-finding data | `--format=jsonl` | Detailed parsing (json=summary only) |
| Environment fix | `ubs doctor --fix` | First-line troubleshooting |

---

## Critical Rules

| Rule | Why | Consequence |
|------|-----|-------------|
| **Exit 2 → doctor** | Scanner error | Run `ubs doctor --fix` immediately |
| **Every ignore needs why** | Audit trail | `// ubs:ignore — caller validates` |
| **Fix root cause** | Prevents debt | Don't mask symptoms |
| **Don't skip triage** | Real bugs hide | Review every finding |
| **JS/TS needs AST engine** | Semantic analysis | `ubs doctor --fix` if degraded |

---

## Suppression

```javascript
// GOOD — explains why it's safe
eval(trustedConfig);  // ubs:ignore — internal config, not user input

// BAD — no justification
eval(config);  // ubs:ignore
```

### Per-Language Comment Styles

| Language | Suppression Format |
|----------|-------------------|
| JS/TS/Go/Rust/Java | `// ubs:ignore — reason` |
| Python/Ruby/Shell | `# ubs:ignore — reason` |
| SQL | `-- ubs:ignore — reason` |

**Rule:** Every `ubs:ignore` MUST explain why the code is actually safe.

---

## Is This Finding Real?

```
Finding → Code path executes? → No → FALSE POSITIVE (dead code)
                             → Yes ↓
         Guard clause exists? → Yes → FALSE POSITIVE (ubs:ignore)
                             → No ↓
         Validated elsewhere? → Yes → FALSE POSITIVE (cross-file)
                             → No → REAL BUG, fix it
```

---

## Triage by Severity

| Blocks Commit | Blocks PR | Discuss in PR |
|---------------|-----------|---------------|
| Null safety (1) | Error swallowing (8) | Debug code (11) |
| Security (2) | Division by zero (6) | TODO markers (12) |
| Missing await (3) | Promise no catch (9) | TypeScript `any` (13) |
| Resource leaks (4) | Array mutation (10) | Deep nesting (14) |

**Category numbers** map to `--skip=N` and `--category=N` flags.

**Full breakdown:** [TRIAGE.md](references/TRIAGE.md)

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Exit code 2 | Missing optional scanners | `ubs doctor --fix` |
| JS/TS degraded | AST engine missing | `ubs doctor --fix` |
| Too many findings | Legacy code | Use `--comparison` for baseline |
| Too slow | Full scan | Use `--staged` or `--only=` |
| False positive storm | Test fixtures | Add to `.ubsignore` |

---

## AI Code Validation

AI-generated code is prone to:

| Pattern | Bug | Category |
|---------|-----|----------|
| `user.profile.name` | No null check | 1 (Null safety) |
| `fetch(url)` | Missing await | 3 (Async) |
| `open(file)` | Never closed | 4 (Resource) |
| `catch (e) {}` | Swallowed error | 8 (Error handling) |

```bash
# After AI writes code:
ubs [file] --fail-on-warning
```

---

## References

| Need | Document |
|------|----------|
| Prioritize findings | [TRIAGE.md](references/TRIAGE.md) |
| Identify false positives | [FALSE-POSITIVES.md](references/FALSE-POSITIVES.md) |
| CI/CD, hooks, workflows | [WORKFLOWS.md](references/WORKFLOWS.md) |
# False Positive Patterns

## Quick Lookup

| Pattern | Why It's FP | Fix |
|---------|-------------|-----|
| Guard clause before access | UBS misses early return | `// ubs:ignore — guarded above` |
| Caller validates | Cross-file analysis limit | `// ubs:ignore — caller validates` |
| Type system guarantees | UBS doesn't understand type | Non-null assertion or runtime check |
| Test code testing errors | Intentional bad path | `--skip=2` for security in tests |
| Dead code / feature flags | Never executes | Remove dead code |

---

## Universal Patterns

### Guard Clause Before Access

```javascript
// UBS flags user.name but misses the guard
function getName(user) {
  if (!user) return 'Anonymous';
  return user.name;  // Actually safe
}
// ubs:ignore — guarded by early return above
```

### Validation in Caller

```typescript
// UBS flags user.id — can't see call site
function processUser(user: User) {
  saveToDb(user.id);  // Flagged as potentially null
}

// Caller guarantees non-null
const user = await getUser(id);
if (!user) throw new Error('Not found');
processUser(user);  // Safe
// ubs:ignore — caller validates non-null
```

### Type System Guarantees

```typescript
const value = map.get(key);  // Flagged as possibly undefined
value.process();

// If Map<string, NonNullableValue> and key was just inserted
// Add runtime check or non-null assertion with explanation
```

### Test Code

```python
# UBS flags eval() in security test
def test_eval_injection_blocked():
    with pytest.raises(SecurityError):
        process_input("__import__('os').system('rm -rf /')")
# --skip=2 for tests, or: ubs:ignore — test verifying security
```

### Dead Code / Feature Flags

```javascript
if (FEATURE_FLAGS.legacyRenderer) {
  element.innerHTML = content;  // Flagged but legacyRenderer is always false
}
// Remove dead code or document flag state
```

---

## JavaScript/TypeScript

### Optional Chaining

```typescript
// FALSE POSITIVE — ?. handles null
const name = user?.profile?.name;
// Optional chaining IS the guard
```

### Nullish Coalescing

```typescript
// FALSE POSITIVE — ?? handles undefined/null
const value = config.timeout ?? 5000;
```

### React Hooks

```tsx
const [user, setUser] = useState<User | null>(null);
useEffect(() => { fetchUser().then(setUser); }, []);
return <div>{user.name}</div>;  // Flagged

// If component only renders after loading, add loading guard
```

### Promise.all with Proper Handling

```javascript
// FALSE POSITIVE if results are properly destructured
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
// UBS may flag the array access pattern
```

### Intentional Fire-and-Forget

```javascript
// FALSE POSITIVE for analytics
analytics.track('page_view');  // No await
// ubs:ignore — fire-and-forget, failure acceptable
```

---

## Python

### Context Manager in Wrapper

```python
# FALSE POSITIVE — file closed by wrapper
f = open(path)  # Flagged
return ConfigParser(f)  # ConfigParser closes on __del__

# Better: make explicit
with open(path) as f:
    return ConfigParser(f.read())
```

### Exception Re-raised

```python
# FALSE POSITIVE — not swallowed
try:
    risky_operation()
except SpecificError as e:
    logger.error(f"Failed: {e}")
    raise  # Re-raised, not swallowed
```

### Binary Mode

```python
# FALSE POSITIVE — encoding not needed
with open('image.png', 'rb') as f:  # UBS may want encoding=
    data = f.read()  # Binary mode, no encoding needed
```

### eval() with Literal

```python
# FALSE POSITIVE — literal expression, not user input
result = eval('2 + 2')  # Flagged but safe

# Better: use literal_eval for safety
from ast import literal_eval
result = literal_eval('2 + 2')
```

---

## Go

### Interface Nil vs Concrete Nil

```go
// TRICKY — interface nil check
var p *MyError = nil
var err error = p  // err is NOT nil (concrete nil in interface)
if err != nil { }  // May be flagged but behavior is subtle
```

### Defer in Loop

```go
// SOMETIMES FP
for _, file := range files {
    f, _ := os.Open(file)
    defer f.Close()  // Defers until function exit
}
// Usually better: wrap in func() { defer f.Close(); process() }()
```

### Error Ignored with Comment

```go
// FALSE POSITIVE if intentional
_ = writer.Flush()  // Flagged

// ubs:ignore — best-effort flush, error logged elsewhere
```

### Goroutine Bounded by main()

```go
func main() {
    go backgroundTask()  // Flagged — no stop mechanism
    // For simple CLIs, program exit stops it
}
// ubs:ignore — CLI lifetime bounded
```

---

## Rust

### unwrap() in Tests

```rust
#[test]
fn test_parse() {
    let result = parse("valid").unwrap();  // Flagged
    assert_eq!(result, expected);
    // Tests SHOULD panic on unexpected None
}
```

### unwrap() in CLI Main

```rust
fn main() {
    let config = Config::load().unwrap();  // Flagged
    // For CLIs, panic with backtrace IS the error UX
}
```

### Safe Unsafe Wrappers

```rust
pub fn safe_wrapper() -> Result<()> {
    unsafe { ffi::well_tested_c_function(); }  // Flagged
    Ok(())
}
// ubs:ignore — FFI wrapper, C function validated safe
```

### spawn() for Background Tasks

```rust
tokio::spawn(async move {
    cleanup_old_files().await;  // Flagged — no join
});
// ubs:ignore — fire-and-forget cleanup, ok if dropped
```

---

## Java

### Framework-Managed Resources

```java
@Autowired
DataSource dataSource;  // Flagged as unmanaged
// Spring manages the connection pool lifecycle
```

### Wrapped and Re-thrown

```java
try {
    Files.readString(path);
} catch (IOException e) {
    throw new RuntimeException(e);  // Flagged as "swallowed"
    // Wrapped and re-thrown, not swallowed
}
```

### AutoCloseable Returned to Caller

```java
public InputStream getResource() {
    return new FileInputStream(file);  // Flagged
    // Caller responsibility — document in Javadoc
}
```

---

## The Decision Table

| Situation | Likely FP | Likely Real |
|-----------|-----------|-------------|
| Guard clause exists | FP | — |
| Caller validates | FP | — |
| Test code | FP | — |
| Type system guarantees | FP | — |
| "It works in practice" | — | **REAL** — luck isn't safety |
| "Always been this way" | — | **REAL** — tech debt |
| "Data is always valid" | — | **REAL** — data changes |
| "Users won't do that" | — | **REAL** — users do everything |

---

## The Golden Rule

> If you need to think hard about whether it's a false positive, **treat it as real and add the guard**.
>
> The cost of a redundant check is nearly zero.
> The cost of a missed bug is high.
# Triage Guide

## Quick Reference

| Severity | Action | Categories |
|----------|--------|------------|
| **Critical** | Fix before commit | 1-5 (null, security, async, leaks, coercion) |
| **High** | Fix before merge | 6-10 (division, resources, errors, promises, mutation) |
| **Medium** | Address or justify | 11-14 (debug, TODO, `any`, readability) |

```
                 HIGH CONFIDENCE          LOW CONFIDENCE
                 ─────────────────────────────────────────
HIGH SEVERITY    Fix immediately          Investigate first
                 Never suppress           then fix or justify
                 ─────────────────────────────────────────
LOW SEVERITY     Fix if easy              Document and defer
                 defer if complex         to future cleanup
```

---

## Tier 1: Fix Before Commit

### 1. Null Safety
Runtime crash on real data.

```javascript
// CRASH
user.profile.name;

// FIXED
user?.profile?.name ?? 'Anonymous';
```

**Suppress if:** Validated by caller/API/schema. Document: `// ubs:ignore — validated by [source]`

### 2. Security
XSS, injection, secrets, prototype pollution.

| Pattern | Risk | Fix |
|---------|------|-----|
| `innerHTML = data` | XSS | Use `textContent` or sanitize |
| `eval(input)` | RCE | Never eval untrusted data |
| `query + input` | SQLi | Parameterized queries |
| `password = "..."` | Leak | Environment variable |

**Suppress if:** Data from trusted internal source (not user input). Document why.

### 3. Async/Await
Silent data loss, race conditions.

```javascript
// SILENT FAILURE
saveUserData(user);  // Missing await

// FIXED
await saveUserData(user);
```

**Suppress if:** Intentional fire-and-forget (logging, analytics). Document: `// ubs:ignore — fire-and-forget, failure acceptable`

### 4. Memory Leaks
Event listeners, timers, subscriptions without cleanup.

```javascript
// LEAK
useEffect(() => {
  window.addEventListener('resize', handler);
}, []);

// FIXED
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

**Suppress if:** Global singleton that lives for app lifetime.

### 5. Type Coercion
`==` vs `===`, parseInt without radix, NaN comparisons.

```javascript
// BUG — "" == 0 is true
if (value == 0) { }

// FIXED
if (value === 0) { }
```

**Suppress if:** `== null` to catch both null and undefined (document intent).

---

## Tier 2: Fix Before Merge

### 6. Division Safety
Crash on edge case data.

```python
# CRASH
average = total / len(items)

# FIXED
average = total / len(items) if items else 0
```

### 7. Resource Lifecycle
Memory/handle exhaustion over time.

```python
# LEAK
f = open('data.txt')
data = f.read()

# FIXED
with open('data.txt') as f:
    data = f.read()
```

### 8. Error Handling
Debugging nightmare when things go wrong.

```javascript
// SILENT FAILURE
try { riskyOp(); } catch (e) { }

// FIXED
try { riskyOp(); } catch (e) {
  logger.error('Operation failed', { error: e });
  throw e;
}
```

**Suppress if:** Intentional suppression (cleanup that shouldn't fail main op). Document why.

### 9. Promise Chains
Unhandled rejections.

```javascript
// UNHANDLED
fetch('/api').then(r => r.json()).then(process);

// FIXED
fetch('/api').then(r => r.json()).then(process).catch(handleError);
```

### 10. Array Mutations
Skipped elements, corrupted state.

```javascript
// BUG — skips elements
for (let i = 0; i < arr.length; i++) {
  if (shouldRemove(arr[i])) arr.splice(i, 1);
}

// FIXED
arr = arr.filter(item => !shouldRemove(item));
```

---

## Tier 3: Address or Justify

### 11. Debug Code
`console.log`, `print()`, `debugger`

**Action:** Remove before merge. Use `--skip=11` during active development.

### 12. TODO Markers
TODO, FIXME, HACK, XXX

**Action:** Complete it, create tracking issue, or remove if obsolete.

### 13. Type Safety (`any`)
Defeats type checking.

```typescript
// DEFEATS CHECKING
function process(data: any) { }

// BETTER
function process(data: unknown) {
  if (isValidData(data)) { /* now typed */ }
}
```

**Suppress if:** External API responses, legacy migration (document timeline).

### 14. Readability
Complex ternaries, deep nesting (>4 levels).

**Action:** Refactor for clarity. Don't block merge for style alone.

---

## When to Suppress

**Use `ubs:ignore` when ALL true:**
1. You've verified the code is safe
2. UBS can't see the safety guarantee (cross-file, runtime, API contract)
3. Comment explains WHY it's safe

**Never suppress when:**
- You're not sure if it's safe
- You just want the scan to pass
- You don't understand the code

---

## Language Patterns

See [FALSE-POSITIVES.md](FALSE-POSITIVES.md) for detailed language-specific patterns:
- JS/TS: Optional chaining, React hooks, Promise.all
- Python: Context managers, exception re-raising, binary mode
- Go: Interface nil, defer in loops, goroutine lifetime
- Rust: unwrap() in tests/CLI, safe unsafe wrappers
- Java: Framework-managed resources, checked exceptions
# UBS Workflows

## Quick Reference

| Context | Command | When |
|---------|---------|------|
| Active coding | `ubs --staged` | Every 10-15 min |
| Pre-commit | `ubs --staged --fail-on-warning` | Before `git commit` |
| PR review | `ubs . --comparison baseline.json` | Before merge |
| CI pipeline | `ubs . --format=sarif` | On push |
| Security audit | `ubs --category=security .` | Periodic |
| Codebase health | `ubs . --html-report=report.html` | Weekly |

---

## 1. Active Development

```bash
# After each logical unit of work
ubs --staged

# Or specific files
ubs src/api/users.ts src/utils/auth.ts
```

**If findings:** Fix critical immediately, note others for later. Don't accumulate.

---

## 2. Pre-Commit Gate

### Manual

```bash
ubs --staged --fail-on-warning || echo "Fix before committing"
```

### Automated Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
set -e
echo "Running UBS..."
if ! ubs --staged --fail-on-warning; then
    echo "Fix issues or add ubs:ignore with justification"
    exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

### Emergency Bypass

```bash
# ONLY for verified false positives you can't address now
git commit --no-verify -m "Emergency fix (UBS FP, will address)"
```

---

## 3. PR Review

### Basic

```bash
ubs . --fail-on-warning
ubs . --html-report=pr-review.html  # Shareable
```

### Regression Detection (Recommended)

Only fail on NEW issues:

```bash
# On main: capture baseline
ubs . --report-json=.ubs/baseline.json

# On PR branch: compare
ubs . --comparison=.ubs/baseline.json --fail-on-warning
```

### PR Review Checklist

```markdown
## Code Review Checklist

- [ ] UBS scan passes: `ubs . --comparison=baseline.json --fail-on-warning`
- [ ] No new CRITICAL findings
- [ ] Any ubs:ignore additions have justification comments
- [ ] No security category findings
```

---

## 4. CI/CD

### GitHub Actions

```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  ubs-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install UBS
        run: |
          curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/ultimate_bug_scanner/master/install.sh" | bash -s -- --easy-mode
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Run UBS
        run: ubs . --fail-on-warning --format=sarif > results.sarif

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### With Baseline Comparison

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Get baseline
  run: git checkout origin/main -- .ubs/baseline.json 2>/dev/null || echo '{}' > .ubs/baseline.json

- name: Run with comparison
  run: ubs . --comparison=.ubs/baseline.json --fail-on-warning
```

### GitLab CI

```yaml
ubs-scan:
  stage: test
  script:
    - curl -fsSL "https://..." | bash -s -- --easy-mode
    - ubs . --fail-on-warning --format=json > ubs-results.json
  artifacts:
    reports:
      codequality: ubs-results.json
```

---

## 5. AI Agent Validation

### Claude Code Hook

```bash
# .claude/hooks/post-tool.sh
#!/bin/bash
FILE_PATH="$1"
if [[ "$FILE_PATH" =~ \.(js|ts|py|go|rs|java)$ ]]; then
    ubs "$FILE_PATH" --fail-on-warning 2>&1 | head -20
fi
```

### Common AI Bugs

| Pattern | Bug | Category |
|---------|-----|----------|
| `user.profile.name` | No null check | Null safety |
| `fetch(url)` | Missing await | Async |
| `open(file)` | Never closed | Resource |
| `catch (e) {}` | Swallowed | Error handling |

---

## 6. Security Audit

```bash
ubs --category=security .
ubs --category=security . --html-report=security-audit.html
```

### Checklist

- [ ] Review all innerHTML/dangerouslySetInnerHTML
- [ ] Review all eval/exec usage
- [ ] Review SQL query construction
- [ ] Check for hardcoded secrets
- [ ] Verify input validation at boundaries

---

## 7. Codebase Health Dashboard

Track quality trends over time.

### Generate Reports

```bash
# Full HTML dashboard
ubs . --html-report=reports/ubs-$(date +%Y%m%d).html

# JSON for tracking
ubs . --report-json=reports/ubs-$(date +%Y%m%d).json
```

### Track Trends

```bash
# Compare today vs last week
ubs . --comparison=reports/ubs-20250109.json --report-json=reports/ubs-20250116.json

# Summary of changes
jq '.summary' reports/ubs-20250116.json
```

### Scheduled Health Check

```yaml
# .github/workflows/health.yml
name: Weekly Health Check

on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9am

jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run health scan
        run: ubs . --html-report=health-report.html
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: health-report.html
```

---

## 8. Legacy Codebase Cleanup

### Phase 1: Baseline

```bash
ubs . --report-json=.ubs/baseline.json
git add .ubs/baseline.json && git commit -m "Add UBS baseline"
```

### Phase 2: Prevent New Issues

```bash
# CI: only fail on NEW
ubs . --comparison=.ubs/baseline.json --fail-on-warning
```

### Phase 3: Incremental Cleanup

```bash
# See breakdown by category
ubs . --format=json | jq '.findings | group_by(.category) | map({category: .[0].category, count: length})'

# Fix one category at a time
ubs --category=resource-lifecycle .

# Update baseline after cleanup
ubs . --report-json=.ubs/baseline.json
```

---

## Troubleshooting

### "Too many findings"

```bash
# Priority order:
ubs . --format=json | jq '.findings[] | select(.severity == "critical")' | head -20
ubs . --format=json | jq '.findings[] | select(.category == "security")'
ubs . --format=json | jq '.findings[] | select(.category == "async")'
```

### "Scan too slow"

```bash
ubs --staged                    # Only changed
ubs src/api/                    # Only directory
ubs --only=js,python .          # Only languages
```

### "Too many false positives"

```bash
# .ubsignore
echo "test-fixtures/" >> .ubsignore
echo "generated/" >> .ubsignore

# Or skip categories
ubs --skip=11,12 .  # TODO/debug
```

### "Need emergency bypass"

```bash
git commit --no-verify -m "Emergency: <reason>"
# Create issue immediately to address
```
