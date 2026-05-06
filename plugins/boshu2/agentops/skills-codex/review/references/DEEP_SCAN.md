
<!-- TOC: Problem | THE EXACT PROMPT | Fresh Eyes | The Cycle | Quick Start | Pass Details | Finding Categories | Documentation | Convergence | Tool Integration | Anti-Patterns | References -->

# Multi-Pass Bug Hunting

> **Core Insight:** First pass finds obvious bugs. Second pass finds bugs hidden by the obvious ones. Third pass catches what you introduced fixing the first two.

## The Problem

Single-pass reviews miss bugs. Fixing bug A exposes bug B. Fixing B introduces C. You need an iterative cycle that converges to clean.

---

## THE EXACT PROMPT

### The User's Bug Hunting Prompt (Discovered via CASS)

```
I want you to sort of randomly explore the code files in this project, choosing
code files to deeply investigate and trace their functionality through related
files. Do a super careful methodical check with fresh eyes to find any bugs,
problems, errors, issues, silly mistakes, etc. and fix them.

Comply with ALL rules in AGENTS.md. Use ultrathink.
```

### Multi-Pass Orchestration Prompt

```
Run a multi-pass bug hunt on this codebase:

Pass 1 (Surface): Run ubs, fix real bugs, ignore noise
Pass 2 (Deep): Re-read fixed files with fresh eyes, check edge cases
Pass 3 (Integration): Check how fixes interact, run tests
Pass 4 (Verify): Final ubs scan, must be clean

Between passes: Document what you found and fixed.
Stop when: Clean scan + tests pass + no new findings on re-read.
```

---

## Fresh Eyes Pattern (Critical!)

The "fresh eyes" technique is essential for catching bugs:

```
After fixing code → Step back → Re-read with fresh perspective
```

**Why it works:**
- First pass: You're focused on the obvious issue
- Fresh eyes: You notice what you missed while fixing
- Each pass reveals bugs hidden by the previous bugs

**Trigger phrases:**
- "with fresh eyes"
- "careful methodical check"
- "trace functionality through related files"
- "Use ultrathink" (enables deeper analysis)

---

## The Cycle

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│    │  AUDIT   │───▶│   FIX    │───▶│  RESCAN  │────┼──▶ Clean? ──▶ Done
│    └──────────┘    └──────────┘    └──────────┘    │       │
│         ▲                                          │       │ No
│         │                                          │       ▼
│         └──────────────────────────────────────────┼───────┘
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Pass 1: Surface scan
ubs . --format=jsonl > pass1.jsonl
# Triage, fix real bugs, suppress false positives with justification

# Pass 2: Rescan + fresh eyes review
ubs . --format=jsonl > pass2.jsonl
git diff --name-only HEAD~1  # Files you touched
# Re-read EACH fixed file with fresh eyes - what did you miss?

# Pass 3: Integration check
cargo test --all  # or npm test, pytest, etc.
git diff HEAD~1 | head -200  # Review your changes holistically

# Pass 4: Final verification
ubs . --fail-on-warning
# Must exit 0
```

---

## Pass-by-Pass Details

### Pass 1: Surface (Automated Tools)

```bash
ubs . --format=jsonl > findings.jsonl

# Triage each finding:
# - Real bug → Fix immediately
# - False positive → ubs:ignore with justification
# - Not sure → Mark for Pass 2
```

**Focus:** Null checks, missing await, resource leaks, obvious security

**Bug types caught:**
- Null safety violations (Category 1)
- Security issues (Category 2)
- Missing await (Category 3)
- Resource leaks (Category 4)

### Pass 2: Deep (Fresh Eyes Review)

Re-read every file you touched. This is the **critical pass**.

**Questions to ask:**
- Did my fix introduce new issues?
- What edge cases did I miss?
- Are there similar bugs elsewhere in this file?
- Did I trace through ALL related files?

```bash
# Find all files modified in Pass 1
git diff --name-only HEAD~1

# For each file: read it completely, trace through imports
# Look for: logic errors, edge cases, error handling, off-by-one
```

**Focus:** Logic errors, edge cases, incomplete error handling

### Pass 3: Integration

```bash
# Run full test suite
cargo test --all
npm test
pytest -v

# Check for regressions
git diff HEAD~1 | head -200  # Review your changes holistically

# Look for:
# - Tests that started failing
# - New warnings in compilation
# - Behavior changes in dependent code
```

**Focus:** Do fixes interact badly? Did tests break? New warnings?

### Pass 4: Verification

```bash
# Final clean scan
ubs . --fail-on-warning

# MUST exit 0. If not, back to Pass 1.
```

---

## Finding Categories by Pass

| Pass | What You Catch | Technique |
|------|----------------|-----------|
| 1 | Null derefs, missing await, resource leaks, injection | Automated scanners (ubs, clippy, eslint) |
| 2 | Logic errors, edge cases, incomplete error handling | Fresh eyes manual review |
| 3 | Regressions, integration issues, test failures | Test suite + diff review |
| 4 | Anything introduced in passes 1-3 | Final automated verification |

---

## Documentation Template

After each pass, record what you found:

```markdown
## Pass N Findings

**Files touched:** src/foo.rs, src/bar.rs

**Bugs fixed:**
- src/foo.rs:42 — Null deref on empty input
- src/bar.rs:100 — Missing await on async call

**False positives suppressed:**
- src/foo.rs:55 — ubs:ignore, validated by caller

**Deferred to Pass N+1:**
- Check if similar pattern exists in src/baz.rs

**Confidence:** High / Medium / Low
```

---

## Convergence Criteria

Stop when ALL of these are true:

- [ ] `ubs . --fail-on-warning` exits 0
- [ ] All tests pass
- [ ] No new findings on fresh re-read
- [ ] No deferred items remaining

---

## Reviewing Fellow Agents' Code

When reviewing code written by other agents:

```
Review the code written by your fellow agents and check for any issues, bugs,
errors, problems, inefficiencies, security problems, reliability issues, etc.
and carefully diagnose their underlying root causes using first-principle
analysis and then fix or revise them if necessary.

Do not restrict yourself to the latest commits, cast a wider net and go super deep.
```

**Why this matters:**
- AI-generated code has specific failure patterns
- Missing null checks, forgotten awaits, swallowed errors
- Fresh perspective catches what the writing agent missed

---

## Tool Integration

```bash
# UBS (primary scanner)
ubs . --format=jsonl                    # Detailed findings
ubs . --comparison=baseline.json        # New issues only
ubs --staged                            # Pre-commit check

# Clippy (Rust)
cargo clippy -- -D warnings 2>&1 | head -50

# ESLint (TypeScript)
npx eslint . --format=json

# Ruff (Python)
ruff check . --output-format=json

# ShellCheck (Bash)
shellcheck *.sh
```

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Fix everything in one pass | Iterate: scan → fix → rescan |
| Skip rescan after fixes | Always rescan — fixes introduce bugs |
| Skip fresh eyes review | Pass 2 is where you catch logic errors |
| Suppress without justification | Every ubs:ignore needs a reason |
| Trust green tests alone | Tests + static analysis + manual review |
| Stop at "good enough" | Converge to actually clean |
| Review only latest commit | Cast a wider net, go deep |

---

## When to Use

| Situation | Passes Needed |
|-----------|---------------|
| Quick pre-commit | 1 (ubs --staged) |
| Feature complete | 2-3 |
| Pre-release | 3-4 |
| Security audit | 4+ with security focus |
| Legacy code cleanup | 4+ until convergence |
| Reviewing agent code | 2-3 minimum, fresh eyes critical |

---

## Checklist

- [ ] **Pass 1:** Run ubs, triage all findings
- [ ] **Fix:** Address real bugs, suppress with justification
- [ ] **Pass 2:** Fresh eyes review of ALL touched files
- [ ] **Trace:** Follow through related files and imports
- [ ] **Pass 3:** Run tests, check for regressions
- [ ] **Pass 4:** Final clean scan, must exit 0
- [ ] **Document:** Record findings per pass
- [ ] **Verify:** All convergence criteria met

---

## References

| Need | File |
|------|------|
| Triage decision tree | [TRIAGE.md](references/TRIAGE.md) |
| Common bug patterns | [PATTERNS.md](references/PATTERNS.md) |
| Tool-specific commands | [TOOLS.md](references/TOOLS.md) |
