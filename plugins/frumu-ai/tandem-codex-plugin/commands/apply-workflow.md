---
title: /apply-workflow
description: Apply a Tandem workflow-plan draft. Calls workflowPlans.apply, writes the returned plan_package_bundle to disk, then runs importPreview for compatibility. Stops short of import (gated behind separate explicit approval).
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/apply-workflow <plan_id> [creator_id]
/apply-workflow <plan_id> [creator_id] --out ./path/to/bundle.json
```

If `plan_id` is missing, ask the user once. `creator_id` defaults to
`codex-plugin` when not supplied. `--out` overrides the default bundle
path.

## What this command does

1. Calls `client.workflowPlans.apply({ planId, creatorId })`.
2. If `applied.plan_package_bundle` is returned, writes the bundle to:
   - `--out <path>` if supplied, otherwise
   - `.tandem-codex/plan-bundles/<plan_id>.json` (default).
   Parent directories are created if missing. The plugin's `.gitignore`
   excludes `.tandem-codex/`, so generated bundles do not pollute git.
3. Calls
   `client.workflowPlans.importPreview({ bundle: applied.plan_package_bundle })`
   and prints the engine's compatibility report.
4. **Stops there.** Final import (`workflowPlans.importPlan`) creates
   a live plan in the user's Tandem and is gated behind a separate
   explicit approval — see `/import-preview-workflow`.

The helper is `scripts/tandem-apply-workflow.ts`
(`npm run apply -- <plan_id> [creator_id] [--out ./path]`).

## Behaviour rules

- Always write the bundle when one is returned. Never ask the user to
  copy JSON out of terminal output.
- Surface the engine's response verbatim for `apply` and
  `importPreview`.
- If `importPreview.import_validation.compatible !== true`, do **not**
  recommend import; recommend `/revise-workflow <plan_id> "<fix>"`
  instead.
- Never call `importPlan` from this command. Final import is the
  user's explicit decision, made via `/import-preview-workflow`.
- Never call `runNow` from this command. That is `/run-workflow`'s job.
- If the engine returns `401` / `403`, surface verbatim and route the
  user to `/tandem-doctor`.

## Output

```
Apply summary:
- plan_id:     <id>
- creator_id:  <id>
- bundle path: <absolute path to written bundle>

Import preview:
- compatible: <true | false>
- conflicts:  <count or list, verbatim>

Next:
- compatible=true:  /import-preview-workflow .tandem-codex/plan-bundles/<plan_id>.json
- compatible=false: /revise-workflow <plan_id> "<fix>"
```
