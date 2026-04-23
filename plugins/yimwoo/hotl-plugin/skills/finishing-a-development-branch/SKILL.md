---
name: finishing-a-development-branch
description: Use after execution is complete or intentionally stopped — decide whether to merge back, publish a PR branch, keep the execution checkout, or discard it, and record that disposition in HOTL state.
---

# Finishing A Development Branch

Use this after `loop-execution`, `executing-plans`, or `subagent-execution` when the run already has a `run_id` and you need to decide what happens to the execution branch/worktree next.

## Core Idea

HOTL distinguishes between:

- **Authoring checkout** — where the workflow was written (`source_branch`, `source_head`)
- **Execution checkout** — where the workflow ran (`branch`, `execution_root`, `worktree_path`)

Finishing is the stage that closes that loop intentionally. Do not silently merge, delete, or abandon the execution worktree.

## Step 1: Read Execution Provenance

Run:

```bash
hotl-rt summary <run-id> --json
```

Surface these fields before presenting options:

- `status`
- `source_branch`
- `branch`
- `execution_root`
- `worktree_path`
- `finish.disposition` (if already recorded)

If `finish.disposition` is already set, stop and tell the user the run is already finished.

## Step 2: Present The 4 Finish Options

Use these options:

1. **Merge back locally**
   - Default target: `source_branch` when present and different from the execution branch
   - Fallback target: `main` or `master`
2. **Publish branch / create PR**
   - Push the execution branch to a remote
   - If `gh` is available and the user wants a PR, create it against the chosen target branch
3. **Keep as-is**
   - Preserve the execution branch/worktree for later review or follow-up changes
4. **Discard**
   - Remove the execution branch/worktree after explicit confirmation

Explain the target branch explicitly when merge or PR target is inferred from `source_branch`.

## Step 3: Execute Via The Helper

Use the repo-owned helper:

```bash
scripts/hotl-finish-execution.sh --run-id <run-id> --mode <keep|merge|publish|discard> ...
```

Mappings:

- Keep → `--mode keep`
- Merge locally → `--mode merge [--target-branch <branch>]`
- Publish / PR → `--mode publish [--remote origin] [--target-branch <branch>] [--create-pr]`
- Discard → `--mode discard --confirm discard`

The helper records the finish disposition with `hotl-rt finish ...` and enforces safety checks around branch switching, merging, cleanup, and destructive discard.

## Step 4: Report The Outcome

After the helper succeeds, show:

- Finish disposition
- Target branch / PR URL if applicable
- Whether the execution worktree was kept or removed
- Where the durable report lives

Important behavior:

- Merge and discard preserve `.hotl/state/<run-id>.json` and `.hotl/reports/<run-id>.md` back into the repo checkout before removing an isolated execution worktree
- Publish keeps the execution worktree by default so review follow-ups can continue on the same branch
- Shared-checkout same-branch runs are intentionally conservative; discard and merge may require manual handling if automation would be ambiguous or destructive

## Guardrails

- Do not auto-merge after execution just because tests passed
- Do not auto-delete work without explicit user confirmation
- Do not create a PR unless the user chose the publish/PR path
- If merge conflicts occur, stop and leave the execution branch/worktree intact
- If `gh` is unavailable, fall back to pushing the branch and report that PR creation was skipped
