---
title: /validate-workflow
description: Run the Tandem engine's validator against a prompt or an imported bundle and surface every error, warning, and policy gap verbatim.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/validate-workflow "<one-line workflow goal>"     # prompt-based one-shot
/validate-workflow ./path/to/bundle.json          # imported-bundle preview
```

If the argument is missing, ask the user once.

## What this command does

`/validate-workflow` is a thin layer over `/preview-workflow`:

- Calls the same engine endpoint (`workflowPlans.preview` for prompts,
  `workflowPlans.importPreview` for bundles).
- Additionally inspects the engine's response for:
  - Schema validation errors.
  - Approval-gate gaps (any external write without an approval gate).
  - Schedule sanity (e.g. `interval_seconds < 60`).
  - Missing `output_contract` on any node.
- Reports a structured pass/fail summary on top of the verbatim engine
  output.

For drafts that originated from a `chatStart` session (you have a
`plan_id`), validate by sending the latest revision through
`/revise-workflow`; the engine's `chatMessage` response includes the
current plan state and any validation issues. There is no
"validate-by-plan_id" SDK call in `@frumu/tandem-client`.

## Behaviour rules

- **Do not edit** the prompt or bundle from this command. Validation is
  read-only.
- Surface engine errors verbatim. Do not paraphrase.
- For every error, propose a concrete fix the user can apply via
  `/create-workflow` (prompt path) or by editing the bundle.
- If MCP servers are referenced but not connected (the engine flags
  these), list them and remind the user to connect via `POST /mcp` or
  the Tandem control panel.

## Output

```
Validation summary:
- schema:         PASS / FAIL (n errors)
- approval gates: PASS / FAIL (n missing)
- schedule:       PASS / FAIL
- output contracts: PASS / FAIL (n missing)

Engine errors (verbatim):
<...>

Suggested fixes:
1. ...
2. ...

Next: /create-workflow            (prompt path with errors)
      /import-preview-workflow … (bundle path with errors)
```
