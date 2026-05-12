# Hook Event Taxonomy

Use this reference when choosing which lifecycle event should own a hook.

## Event Choices

| Event | Best For | Blocking Posture |
|---|---|---|
| PreToolUse | Deny, ask, or allow a tool before it mutates state. | May block. |
| PostToolUse | Inspect successful tool output and suggest repair. | Feedback only. |
| UserPromptSubmit | Add context or reject prompts before work begins. | May block. |
| SessionStart | Load state and configure the session. | Should not block routine use. |
| Stop | Require more work before the agent finishes. | May block; guard recursion. |
| Notification | Emit operator alerts. | Non-blocking. |

## Output Rules

- Exit `0` for success or structured allow/deny output.
- Exit `2` only when stderr is the user-facing block reason.
- Keep JSON output within the portable subset validated by the repo gate.
- Prefer explicit denial reasons over silent failure.

## Fail Posture

Use fail-closed only when allowing the action would create clear damage:
destructive commands, secret exposure, or edits outside a declared scope.

Use fail-open when the hook is advisory, depends on optional tools, or receives
malformed input from a runtime integration. Emit a warning that helps the agent
continue safely.
