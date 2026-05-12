# Hook Test Harness

Use this reference when building or reviewing hook tests.

## Fixture Shape

Keep fixtures small and representative:

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "git status --short"
  },
  "cwd": "/repo",
  "session_id": "test-session"
}
```

Include at least one allow fixture and one block fixture for each blocking hook.

## Direct Test Loop

```bash
printf '%s\n' "$fixture_json" | hooks/<hook>.sh
status=$?
```

Assert all three outputs:

- Exit code.
- Stdout JSON, when structured output is expected.
- Stderr block reason, when exit code is `2`.

## Repo Gates

Run the narrowest gates that match the edit:

```bash
bash scripts/validate-hooks-doc-parity.sh
bash scripts/test-hooks-output.sh
find hooks -name "*.sh" -print0 | xargs -0 shellcheck --severity=error
```

When hook files or helper libraries change, also run:

```bash
cd cli && make sync-hooks
```
