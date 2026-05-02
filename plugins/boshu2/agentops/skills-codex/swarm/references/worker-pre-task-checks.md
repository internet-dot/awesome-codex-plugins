# Worker Pre-Task Checks

Run these checks before writing any new code. Each prevents a recurring failure pattern where workers write a function or helper that already exists, leading to duplication, drift, or test surface bloat.

Inject the relevant subset into the worker's task metadata via the dispatch prompt (see SKILL.md "Platform pitfalls" injection point).

## 1. Grep for existing implementations

Before adding a new utility/helper:

```bash
# Search by name pattern
grep -rn "func <YourFunctionName>\b" cli/ --include="*.go"
grep -rn "def <your_function_name>\b" cli/ --include="*.py"

# Search by signature/intent if name is uncertain
grep -rn "ReadFile\|WriteFile\|atomicWrite" cli/internal/ --include="*.go"

# Search by docstring/comment hint
grep -rn "atomic.*write\|durable.*save" cli/ --include="*.go"
```

If the grep returns hits, **read** the existing implementation before deciding to add a new one. The right choice is usually:
- delegate to the existing function, or
- extend it with a parameter, or
- explicitly justify the duplication in the PR body.

**Source:** Phase 3 retro — D.1 created `estimateTokens` while an equivalent existed in `context.go`. Worker had not grepped first.

## 2. Check imports and package contracts

Before importing a third-party library:

```bash
# What does this module already pull in for the target capability?
grep -rn "^import\|^\s*\"github\." <target-package>/ --include="*.go" | head -20

# Is there a canonical helper package?
ls cli/internal/types/ cli/internal/shared/ cli/internal/util/ 2>/dev/null
```

If the package already imports a library that solves the problem, prefer it over a new dep.

## 3. Confirm symbol existence in deletion-adjacent regions

Before assuming a named function/type exists in the target file:

```bash
# Has the target file had recent deletions?
git log --since='30 days ago' --diff-filter=D --name-only -- <target-path>

# Does the named symbol still exist on HEAD?
grep -F '<SymbolName>' <target-file>
```

This pairs with planning rule PR-008 (`skills/plan/references/planning-rules.md`). The plan author should have already done this; the worker check is the defense-in-depth pass.

## 4. Verify file manifest matches reality

Before opening a file in the manifest:

```bash
# Does the file exist on the current branch?
ls <manifest-path>
# Or, if the manifest is paths-relative-to-repo-root:
git ls-files | grep -F '<manifest-path>'
```

If a manifest entry is missing on disk, emit a scope-escape (see `references/scope-escape-template.md`) instead of creating the file from scratch. The plan may be stale.

## 5. Quick-Reference Inject Block

Paste this into worker dispatch prompts (gc nudge, Claude team task, Codex subagent prompt):

```
PRE-TASK CHECKS (run before writing code):
1. grep for existing impls of any utility you plan to add
2. ls / git ls-files for every file in your manifest — emit scope-escape if missing
3. grep -F '<symbol>' for every named function/type the plan references against current HEAD
4. Read the existing impl before deciding to duplicate; prefer delegate/extend over new
```

## Source

Phase 3 retrospective: workers writing duplicate utilities and assuming stale plan symbols still existed. agentops-zm8 post-mortem reinforced.
