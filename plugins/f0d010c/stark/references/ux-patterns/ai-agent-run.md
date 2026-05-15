# AI agent run pattern

Use when the product asks an AI/tool/automation to do work that may take more than a few seconds: code agents, research agents, import jobs, render/export tasks, workflow automations, or background assistants.

## Applies when

- The user starts a task and must trust work happening out of sight.
- The result may include multiple artifacts, logs, changed files, or decisions.
- The user may need to stop, retry, resume, inspect, or correct the run.

## Wrong when

- The action completes instantly and has one obvious output.
- The system is only showing chat, with no external work or artifact state.

## Shipped-product signals to look for

- A plan preview before execution.
- A live progress surface with current step, elapsed time, and next likely step.
- Human-readable activity log, not raw implementation noise.
- Clear produced artifacts: files, links, screenshots, reports, diffs.
- Stop/cancel, retry failed step, resume from checkpoint.
- Final summary that separates completed work, skipped work, and user decisions needed.

## Failure prevented

Invisible work. Users lose trust when an agent says "working" without a plan, progress, or inspectable output.

## UX decision brief fields

- Pattern: plan preview + progress + artifacts + retry
- Primary action: start/approve run
- Secondary actions: stop, inspect log, retry step, open artifact
- Required states: queued, running, waiting for user, failed recoverably, failed terminally, complete
- Handoff constraints: progress must be visible without covering artifacts; final output must preserve traceability
