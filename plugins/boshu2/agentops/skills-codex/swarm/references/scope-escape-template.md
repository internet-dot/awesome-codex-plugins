# Scope-Escape Report Template (for spawned agents)

Use this template when, mid-task, a worker discovers the work cannot be completed within its declared scope without violating boundaries (immutable scope edits, foreign worktree access, cross-epic mutation, missing credentials, etc.). Emit one report per spawned worker. Workers must NOT silently widen scope.

## Template

```markdown
---
type: scope-escape
worker_id: <swarm-assigned worker id>
task_id: <bead id, task list id, or work-item id>
parent_run: <epic id, plan path, or wave id>
detected_at: <ISO-8601 UTC>
status: BLOCKED | NEEDS_OPERATOR | NEEDS_DECOMPOSE
---

# Scope Escape: <one-line summary>

## What I tried
<2-4 lines: which files I read, which edits I attempted, which commands I ran>

## Where I stopped
<1-2 lines: the boundary I refused to cross — name the file, scope rule, or contract that would have been violated>

## Why
<1-2 lines: the constraint (PROGRAM.md immutable scope, foreign worktree, missing credential, cross-epic dependency, deletion-adjacent stale plan, etc.)>

## Concrete next step
<exactly one suggestion the operator can act on:
 - "decompose into a separate bead under <parent>" or
 - "approve the immutable-scope edit explicitly" or
 - "merge feat/<branch> first; this depends on <commit>" or
 - "supply <credential>; current run cannot proceed">

## Evidence
<paths, command output snippets, or grep hits backing the claim>
```

## When to emit

- **BLOCKED:** the boundary is hard. No flag/permission unblocks it.
- **NEEDS_OPERATOR:** the operator can authorize wider scope, but the worker must not assume.
- **NEEDS_DECOMPOSE:** the task is real but should be split; recommend the split.

## What NOT to do

- Silently widen scope into immutable paths.
- File a generic "I couldn't do this" comment without the structured fields.
- Continue partially — emit the report and stop the worker cleanly.

## Source

`agentops-zm8` post-mortem: workers used ad-hoc scope-escape language; the operator had to read the prose to figure out next steps. The template makes the next step machine-extractable.
