---
title: /import-preview-workflow
description: Run the Tandem engine's importPreview against a plan bundle JSON file, then optionally call importPlan to commit — only after explicit user approval.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/import-preview-workflow .tandem-codex/plan-bundles/<plan_id>.json
/import-preview-workflow ./path/to/bundle.json
```

If the path is missing, ask the user once. Don't guess. When the user
just ran `/apply-workflow <plan_id>`, the bundle is at
`.tandem-codex/plan-bundles/<plan_id>.json` by default — use that path
unless the user specified `--out` to apply.

## What this command does

1. Reads and parses the bundle JSON from the given path.
2. Calls `client.workflowPlans.importPreview({ bundle })` and prints
   the engine's compatibility report verbatim.
3. **Stops** unless the user has explicitly approved import in this
   turn. On a clear "yes, import it" answer, calls
   `client.workflowPlans.importPlan({ bundle: previewed.bundle ?? bundle })`
   and prints the engine's import response.

The helper is `scripts/tandem-import-plan.ts`. Run
`npm run import-plan -- ./path/to/bundle.json` for preview only. After
explicit same-turn approval, run
`npm run import-plan -- ./path/to/bundle.json --import` to commit.

## Behaviour rules

- Treat `importPlan` as a destructive write. Require an explicit
  user "yes, import it" in the same turn — "looks good" is not
  approval.
- If `import_validation.compatible !== true`, refuse to import.
  Surface the conflicts verbatim and recommend `/revise-workflow` on
  the source `plan_id`.
- Never combine `importPlan` with `runNow`; use `/run-workflow` after
  the import lands.
- Surface engine errors verbatim. On `401` / `403`, route the user to
  `/tandem-doctor`.

## Output

```
Import preview:
- compatible: <true | false>
- conflicts: <count or list, verbatim>

Decision required:
- compatible=true: ask the user "Import this plan now? (yes/no)" and
  call importPlan only on a clear yes.
- compatible=false: stop and recommend /revise-workflow on the source
  plan_id.

After importPlan (only on yes):
- imported plan id and any engine warnings, verbatim
```
