# `.agents/scope.lock` — Format Reference

The scope lock file declares which repo-relative directory prefixes are currently in scope for editing. The PreToolUse hook `hooks/edit-scope-guard.sh` consults it on every edit-class tool call.

## Schema (v1)

```json
{
  "schema_version": 1,
  "frozen_dirs": ["cli/cmd/ao/", "skills/scope/"],
  "acquired_at": "2026-05-01T19:30:00Z",
  "acquired_by": "<session-id-or-pid>"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema_version` | integer | yes | Currently `1`. Hook treats unknown versions as fail-open. |
| `frozen_dirs` | array of strings | yes | Repo-relative directory prefixes. Trailing slash optional. Empty array means "no enforcement". |
| `acquired_at` | string (ISO-8601) | yes | UTC, RFC 3339. |
| `acquired_by` | string | yes | Session id, PID, or human-supplied label. |

## Atomicity guarantee

Writes go through `cli/internal/llmwiki/scope_guard.go:SafeAtomicWrite` (temp file + `rename(2)`). Readers either see the previous JSON or the new JSON, never a torn document. Concurrent writers converge to last-writer-wins.

## Hook behavior

`hooks/edit-scope-guard.sh` reads the file with these rules:

- **File missing or empty:** exit 0 (allow). The lock is opt-in.
- **JSON parse fails:** exit 0 (fail-open). Log warning to stderr.
- **`frozen_dirs` empty:** exit 0 (allow).
- **Target path under any `frozen_dirs[i]`:** exit 0 (allow).
- **Target path outside every `frozen_dirs[i]`:** exit 2 with structured stderr reason.
- **Tool input malformed:** exit 0 (nothing to check).

Path comparison uses prefix match on the repo-relative path. Trailing slashes are normalized away before comparison.

## Forward compatibility

- `schema_version` future bumps will be additive.
- New optional fields may be added without breaking the contract.
