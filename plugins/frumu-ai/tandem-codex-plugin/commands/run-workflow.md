---
title: /run-workflow
description: Trigger an immediate run of an applied Tandem V2 automation, with explicit approval and a final policy-gate audit before the API call.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/run-workflow <automation_id>
```

If `automation_id` is missing, ask once. Don't guess.

## What this command does

1. Confirms the `automation_id` and the user's intent in plain
   language ("Run automation `<id>` immediately?"). The SDK exposes
   `automationsV2.{create, runNow, listRuns, getRun, pauseRun,
   resumeRun, repair}`; there is no verified `automationsV2.get` for
   a single automation in the loaded surface, so do not pre-fetch the
   automation from this command. If the user wants a summary first,
   route them to the Tandem control panel or call `listRuns` for
   recent context.
2. **Requires explicit approval.** Do not proceed without a clear
   "yes, run it" from the user. If the user said "go" or "ok"
   earlier, ask again here — this is the final gate.
3. Calls `client.automationsV2.runNow({ id })`.
4. Returns the run id and points the user at the events / runs API.

## Behaviour rules

- If the engine rejects the run because the automation is paused, surface
  that error verbatim and recommend the user inspect/activate the
  automation in the Tandem control panel first.
- If any node has `requires_approval: true` and the user hasn't
  individually acknowledged each, list them and ask again before running.
- Never call `runNow` on multiple automations in one command.
- If the engine returns a 401/403, point the user at `shared/tandem-auth.md`.
- If the engine returns a policy/scope error, surface it verbatim and
  recommend `/validate-workflow`.

## Output

```
Run started:
  automation_id: <id>
  run_id:        <run_id>
  triggered_at:  <iso8601>

Watch:
  curl -N "$TANDEM_BASE_URL/automations/v2/<id>/events"
  or
  client.automationsV2.listRuns({ id })

Approve / deny pending steps:
  via Tandem control panel "Scheduled Bots"
```
