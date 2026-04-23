---
name: resuming
description: Resume an interrupted workflow run with verify-first strategy — loads sidecar state, verifies the last step, and continues execution.
---

# HOTL Resume

## Overview

Resume a previously interrupted workflow run. HOTL persists execution state in a sidecar file (`.hotl/state/<run-id>.json`). On resume, it uses a verify-first strategy to determine whether the interrupted step already succeeded before continuing.

**Announce:** "Looking for interrupted HOTL runs..."

## Sidecar State

Execution state is persisted at `.hotl/state/<run-id>.json`. This is the **authoritative source of truth** — workflow checkboxes are a human-visible mirror that may drift after a crash.

### Schema

```json
{
  "run_id": "<slug>-<YYYYMMDDTHHMMSSZ>",
  "workflow_path": "/abs/path/to/execution-root/docs/plans/YYYY-MM-DD-<slug>-workflow.md",
  "source_workflow_path": "/abs/path/to/original/workflow.md",
  "workflow_slug": "<slug>",
  "intent": "<from workflow frontmatter>",
  "branch": "<branch name>",
  "repo_root": "/abs/path/to/repo",
  "execution_root": "/abs/path/to/repo-or-worktree",
  "worktree_path": null,
  "executor_mode": "loop | executing-plans | subagent",
  "started_at": "<ISO 8601>",
  "last_update": "<ISO 8601>",
  "status": "running | paused | blocked | completed | abandoned",
  "current_step": 3,
  "total_steps": 8,
  "steps": [
    {"step": 1, "name": "<step name>", "status": "completed | running | pending", "attempts": 1},
    {"step": 2, "name": "<step name>", "status": "completed", "attempts": 2}
  ],
  "last_verify_output": "<captured stdout/stderr from last verify>"
}
```

### Run ID Format

`<slug>-<YYYYMMDDTHHMMSSZ>` (e.g., `add-auth-20260320T212315Z`). Derived from the semantic workflow slug and UTC execution start time, not from the date prefix in canonical workflow filenames.

### Status Values

- `running` — execution is in progress (or was interrupted)
- `paused` — stopped at a `gate: human` or a `verify: human-review` checkpoint awaiting approval
- `blocked` — stopped due to verify failure at max_iterations
- `completed` — all steps passed, verification done
- `abandoned` — user explicitly abandoned the run

## Run Resolution

1. If the user provides a `run_id` → load that specific run
2. If the user provides a workflow filename → search `.hotl/state/*.json` for matching `workflow_path` or `source_workflow_path`
3. If **one match** → use it
4. If **multiple matches** → list all matching runs with run_id, step progress, branch, and age. Ask the user which to resume or whether to start fresh. **Never silently choose among multiple runs.**
5. If **no match** → report "No interrupted run found for this workflow."

## Stale Run Detection

`status: running` is ambiguous after a crash — the owning session may still be alive.

- If `last_update` is **older than 10 minutes** and `status: running` → treat as resumable (owning session is likely dead)
- If `last_update` is **within 10 minutes** and `status: running` → warn: "This run was updated recently. Another session may still own it. Resume anyway?" Wait for user confirmation.
- On resume, update `last_update` immediately to claim ownership.

## Resume Flow (Verify-First)

```
1. Load sidecar state for the resolved run
2. Change into `execution_root` from the sidecar before invoking runtime/helpers
3. Check for existing report at report_path from the sidecar
   - If report exists: surface its path to the user and continue appending to it
   - If report is missing: create a new report from sidecar state
4. Repair workflow checkboxes from sidecar if drift is detected
   (crash may have interrupted between sidecar write and checkbox update)
5. Find the current unfinished step (first step without status: completed)
6. Check verify type for that step:

   a. Machine-runnable verify (type: shell or type: artifact):
      → Run verify first
      → If verify PASSES: mark step complete, advance to next step
      → If verify FAILS: re-run the step body from the beginning

   b. Browser verify (type: browser):
      → If browser tooling available: run verify
      → If unavailable: downgrade to human-review with check text

   c. Human-review verify or no verify:
      → Pause and ask: "Step N was in progress when the session ended.
        Re-run the step, or skip after manual inspection?"

7. Continue normal execution from the resumed point, using the original `run_id` for every `hotl-rt step/gate/finalize` call
8. If the resumed run reaches completion, keep using that same `run_id` when invoking `hotl:finishing-a-development-branch`
8. Use the original executor mode (loop, executing-plans, or subagent)
```

## Checkpoint Drift Repair

On resume, compare sidecar step statuses with workflow checkboxes:
- If sidecar says `completed` but checkbox shows `[ ]` → update to `[x]`
- If sidecar says `pending` but checkbox shows `[x]` → update to `[ ]`
- Log any repairs: "Repaired checkbox drift: Step N marked complete from sidecar state"

## What This Skill Does NOT Do

- Does not scan for all interrupted runs automatically (that is Phase 2: `/hotl:recover`)
- Does not resume runs in a different executor mode than originally started
- Does not merge partial work from two interrupted runs of the same workflow
