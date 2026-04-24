---
name: pr-validate
description: 'Validate PR scope, isolation, quality, and upstream alignment.'
---
# PR Validate Skill

PR-specific validation that ensures changes are clean, focused, and ready.

## Overview

Validates a PR branch for submission readiness by checking isolation, upstream
alignment, scope containment, and quality gates.

**Input**: Branch name (default: current branch)

**When to Use**:
- Before running `$pr-prep`
- After `$pr-implement` completes
- When suspicious of scope creep

---

## Workflow

```
1.  Branch Discovery     -> Identify branch and upstream
2.  Upstream Alignment   -> FIRST: Check rebase status (BLOCKING)
3.  CONTRIBUTING.md      -> Verify compliance (BLOCKING)
4.  Isolation Check      -> Single type, thematic files
5.  Scope Check          -> Verify changes match intended scope
6.  Quality Gate         -> Tests, linting (non-blocking)
7.  Report Generation    -> Summary with pass/fail
```

---

## Phase 2: Upstream Alignment (BLOCKING - CHECK FIRST)

```bash
# Fetch latest upstream
git fetch origin main

# How many commits behind?
BEHIND=$(git rev-list --count HEAD..origin/main)
echo "Behind upstream: $BEHIND commits"
```

| Check | Pass Criteria |
|-------|---------------|
| Minimal divergence | < 20 commits behind |
| No conflicts | Merge/rebase would succeed |

---

## Phase 4: Isolation Check (BLOCKING)

```bash
# Commit type analysis
git log --oneline main..HEAD | sed 's/^[^ ]* //' | grep -oE '^[a-z]+(\([^)]+\))?:' | sort -u

# File theme analysis
git diff --name-only main..HEAD | cut -d'/' -f1-2 | sort -u
```

| Check | Pass Criteria |
|-------|---------------|
| **Single commit type** | All commits share same prefix |
| **Thematic files** | All changed files relate to PR scope |
| **Atomic scope** | Can explain in one sentence |

---

## Phase 5: Scope Check

```bash
# Infer scope from commit messages
SCOPE=$(git log --format="%s" main..HEAD | grep -oE '\([^)]+\)' | sort -u | head -1)

# All files should be within expected scope
git diff --name-only main..HEAD | grep -v "$SCOPE"
```

---

## Report Generation

### Pass Output

```
PR Validation: PASS

Branch: feature/suggest-validation (5 commits)
Upstream: main (in sync)

Checks:
  [OK] Isolation: Single type (refactor)
  [OK] Upstream: 0 commits behind
  [OK] Scope: 100% in internal/suggest/
  [OK] Quality: Tests pass

Ready for $pr-prep
```

### Fail Output

```
PR Validation: BLOCKED

Checks:
  [FAIL] Isolation: Mixed types (refactor, fix, docs)
  [WARN] Upstream: 15 commits behind

Resolutions:
1. ISOLATION: Split branch by commit type
   git checkout main && git checkout -b refactor/suggest
   git cherry-pick <refactor-commits>

Run $pr-validate again after resolution.
```

---

## Resolution Actions

### Mixed Commit Types

```bash
# Cherry-pick to clean branch
git checkout main
git checkout -b ${BRANCH}-clean
git cherry-pick <relevant-commits-only>
```

### Upstream Divergence

```bash
# Rebase on latest upstream
git fetch origin main
git rebase origin/main
```

---

## Anti-Patterns

| DON'T | DO INSTEAD |
|-------|------------|
| Analyze stale branch | Check upstream FIRST |
| Skip validation | Run before $pr-prep |
| Ignore scope creep | Extract unrelated changes |
| Mix fix and refactor | Separate PRs by type |

## Examples

### Validate PR Before Submission

**User says:** "Validate this PR branch for isolation and scope creep."

**What happens:**
1. Check upstream alignment and branch freshness.
2. Detect scope creep and unrelated file changes.
3. Output remediation steps and pass/fail status.

### Pre-Prep Gate

**User says:** "Run PR validation before I run `$pr-prep`."

**What happens:**
1. Execute isolation and scope checks.
2. Confirm quality gate readiness.
3. Return a go/no-go recommendation.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Validation reports stale branch | Upstream advanced | Rebase/merge from upstream then rerun |
| Scope creep detected | Extra files or mixed objectives | Split unrelated changes into follow-up PR |
| Alignment check fails | Branch diverged from target expectations | Reconcile base branch and acceptance criteria |
| Output unclear | Findings not prioritized | Sort findings by blocker vs non-blocker severity |

## Local Resources

### scripts/

- `scripts/validate.sh`


