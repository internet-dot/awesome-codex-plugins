# Pattern - Timeline / run replay

Use for AI agents, automation jobs, deployment logs, audit trails, imports, exports, security scans, and long-running tasks.

## Structure

- Ordered event list with timestamp, actor/source, state, and artifact.
- Current or selected event has a detail panel.
- Events group into phases: plan, execute, verify, recover, complete.
- Include failures, retries, warnings, and user interventions.
- Artifacts are inspectable: diff, log, screenshot, report, file, command output.

## Interaction

- Clicking an event updates detail or scrolls to artifact.
- Filters: errors only, files touched, commands, warnings, user actions.
- Replay mode can step through events but must not hide the full log.
- Stop, retry, resume, and export actions belong near the run state.

## Responsive

- Desktop: timeline + detail split pane.
- Mobile: event list with expandable details.

## Avoid

- "Working..." with no visible progress.
- Success-only timelines.
- Unclear distinction between agent action and user action.
- Copying terminal aesthetics without useful state.
