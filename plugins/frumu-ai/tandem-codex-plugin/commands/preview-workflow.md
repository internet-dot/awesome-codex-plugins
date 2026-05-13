---
title: /preview-workflow
description: One-shot Tandem workflow preview from a plain-language prompt or an imported bundle JSON file. Read-only.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/preview-workflow "<one-line workflow goal>"
/preview-workflow ./path/to/bundle.json
```

If neither is supplied, ask the user once for one.

## What this command does

The `@frumu/tandem-client` SDK exposes `workflowPlans.preview` as a
**prompt-based one-shot**, not a "preview by `plan_id`" call. The
canonical README example takes `{ prompt, planSource, workspaceRoot? }`.
For drafts that came from `chatStart` (i.e. you have a `plan_id`), the
documented flow is `apply → importPreview` on the returned bundle —
that's `/apply-workflow`'s job.

This command branches on its argument:

- **Prompt path** (no `/`, no `.json`): calls
  `client.workflowPlans.preview({ prompt, planSource: "intent_planner_page", workspaceRoot? })`
  and prints the engine's response verbatim.
- **Bundle path**: reads and parses the JSON file, then calls
  `client.workflowPlans.importPreview({ bundle })`.

## Behaviour rules

- Read-only. Never mutate the plan or bundle.
- Print the preview's full DAG, schedule, approval gates, and any
  validation errors verbatim.
- For the prompt path, return the engine's draft view *without*
  starting a chat session. To iterate, use `/create-workflow` (which
  starts a `chatStart` session).
- For the bundle path, recommend `/import-preview-workflow` next when
  the user wants to commit the bundle.

## Output

A short structured response:

- **Trigger / schedule**
- **Agents** (one line each)
- **Nodes** (one line each, with approval gates flagged)
- **Validation errors** (if any, verbatim)
- **Suggested next:**
  - prompt path with errors → `/create-workflow` (start a chat draft).
  - bundle path → `/import-preview-workflow ./path/to/bundle.json`.
