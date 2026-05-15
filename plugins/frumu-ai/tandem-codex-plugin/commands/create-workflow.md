---
title: /create-workflow
description: Design a new Tandem workflow from intent. Starts a workflow-plan chat, iterates with the user, and hands the plan_id off for /apply-workflow. Never auto-applies.
---

You are operating under the **tandem-workflow-plan-mode** skill. Run the
plan-mode loop for the **Intent → workflow** route.

## What this command does

1. Asks the user for the workflow's goal in plain language (one short
   prompt). If the user already gave the goal in their message, skip the
   ask.
2. Calls
   `client.workflowPlans.chatStart({ prompt, planSource: "intent_planner_page", workspaceRoot? })`
   via the helper script `scripts/tandem-create-workflow-draft.ts`, or
   directly via the SDK if invoked inside a Tandem-enabled session.
3. Prints the returned `plan_id` and the engine's draft summary.
4. Iterates with `client.workflowPlans.chatMessage({ planId, message })`
   (one revision per turn) until the user says they're satisfied.
5. Hands the `plan_id` off to `/apply-workflow <plan_id>`. **Do not**
   apply from this command.

## Required inputs

- `TANDEM_BASE_URL` and a resolvable engine token (see
  `shared/tandem-auth.md` and `/tandem-setup`).
- A running Tandem engine reachable at `TANDEM_BASE_URL`.
- Optional: `TANDEM_WORKSPACE_ROOT` when the workflow is scoped to a
  specific checkout.

## Behaviour rules

- Use `planSource: "intent_planner_page"`. Older plugin versions used
  `"chat"`; the SDK README documents `"intent_planner_page"` for the
  planner-page surface.
- Never call `apply`, `importPreview`, `importPlan`, or `runNow` from
  this command.
- Surface engine errors verbatim. On `401` / `403`, route the user to
  `/tandem-doctor`.
- If the user's goal involves any external write (Notion, Slack, email,
  GitHub, etc.), explicitly note the approval gates the engine's draft
  applies before suggesting `/apply-workflow`.

## Output

A short structured response:

1. `plan_id` and one-line summary of the engine's draft.
2. Any approval gates the draft already includes (verbatim).
3. Suggested next:
   - `/revise-workflow <plan_id> "<change>"` if the user wants iteration.
   - `/apply-workflow <plan_id>` once the draft looks right.
