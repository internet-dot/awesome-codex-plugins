# Matcher Patterns

Use this reference when editing `hooks/hooks.json` matchers.

## Pattern Selection

| Need | Matcher Shape |
|---|---|
| One tool | Exact tool name, for example `Bash`. |
| Small related set | Regex alternation, for example `Edit|Write`. |
| MCP namespace | Anchored regex for the namespace. |
| Every tool | Empty matcher or `*`, only for session-wide behavior. |

## Rules

- Prefer exact matchers over broad regular expressions.
- Anchor regexes when matching generated tool names.
- Keep deny hooks before advisory hooks when both observe the same event.
- Split unrelated concerns into separate hook entries.
- Add a fixture for every matcher branch that can block.

## Review Questions

1. Which tools are intentionally covered?
2. Which tools are intentionally excluded?
3. Does ordering affect the result?
4. What happens when an optional dependency is missing?
5. Does a Codex runtime see the same safe output shape?
