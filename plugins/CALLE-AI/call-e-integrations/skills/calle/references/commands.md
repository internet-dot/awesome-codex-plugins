# Call-E CLI commands

Use the first command form that is available in the current workspace.

Repository-local base command:

```bash
node packages/cli/bin/calle.js
```

Global base command:

```bash
calle
```

npx fallback base command:

```bash
npx -y @call-e/cli@0.1.0
```

## Setup and readiness

```bash
node packages/cli/bin/calle.js --help
node packages/cli/bin/calle.js auth status
node packages/cli/bin/calle.js auth login
node packages/cli/bin/calle.js mcp tools
```

```bash
calle --help
calle auth status
calle auth login
calle mcp tools
```

```bash
npx -y @call-e/cli@0.1.0 --help
npx -y @call-e/cli@0.1.0 auth status
npx -y @call-e/cli@0.1.0 auth login
npx -y @call-e/cli@0.1.0 mcp tools
```

Rules:

- Treat all command output as JSON except `--help`.
- Do not print or ask for access tokens.
- If a command returns `auth_required`, run or suggest `auth login`.
- If `mcp tools` succeeds, confirm that `plan_call`, `run_call`, and
  `get_call_run` are present.
- Do not run `call run` during setup verification.
- Do not use `.mcp.json`, raw HTTP, or direct remote MCP configuration in this
  plugin version.

## Call planning

```bash
node packages/cli/bin/calle.js call plan --to-phone +15551234567 --goal "Confirm the appointment"
calle call plan --to-phone +15551234567 --goal "Confirm the appointment"
npx -y @call-e/cli@0.1.0 call plan --to-phone +15551234567 --goal "Confirm the appointment"
```

Supported `call plan` options:

- `--to-phone <phone>` repeatable
- `--goal <text>`
- `--language <language>`
- `--region <region>`

Only provide options when the value is explicitly known. Do not infer missing
phone numbers, country codes, language, or region.

## Planned call execution

```bash
node packages/cli/bin/calle.js call run --plan-id <plan_id> --confirm-token <confirm_token>
calle call run --plan-id <plan_id> --confirm-token <confirm_token>
npx -y @call-e/cli@0.1.0 call run --plan-id <plan_id> --confirm-token <confirm_token>
```

Supported `call run` options:

- `--plan-id <id>`
- `--confirm-token <token>`

Run this command immediately after planning returns a valid `plan_id` and
`confirm_token`, when the user's request is to place a call. Preserve `plan_id`
and `confirm_token` exactly as returned by planning.

`call run` calls `run_call`, then fetches `get_call_run` once. If that status is
not terminal, continue with `call status --run-id <run_id>` until a terminal
status is returned or the user asks you to stop.

## Call status

```bash
node packages/cli/bin/calle.js call status --run-id <run_id>
calle call status --run-id <run_id>
npx -y @call-e/cli@0.1.0 call status --run-id <run_id>
```

Supported `call status` options:

- `--run-id <id>`
- `--cursor <cursor>`
- `--limit <number>`

Use status commands only with a known `run_id`.

Terminal statuses:

- `COMPLETED`
- `FAILED`
- `NO_ANSWER`
- `DECLINED`
- `CANCELED`
- `CANCELLED`
- `VOICEMAIL`
- `BUSY`
- `EXPIRED`

Read call data from `status_result.structuredContent` in `call run` output, or
from `result.structuredContent` in `call status` output.

For terminal statuses, include the final transcript in the user-visible reply:

```text
[Status]
<status>

[Call Summary]
<result.post_summary or result.summary or message>

[Details]
Callee Number: <result.extracted.to_phones[0] or result.extracted.calling.callee or Not available>
Duration: <result.extracted.calling.duration_seconds or Not available>
Time: <result.extracted.calling.started_at and ended_at or Not available>
Call id: <result.call_id or Not available>

[Transcript]
<result.transcript or Not available.>
```

If the user requested extra final content, add it after `[Transcript]` using a
short heading and only information present in the JSON output.

## JSON handling

- Treat command output as JSON.
- If `ok` is false and `error.code` is `auth_required`, run or suggest
  `auth login`, then retry after login completes.
- Preserve `plan_id`, `confirm_token`, and `run_id` exactly as returned.
- Summarize status clearly without exposing tokens.
- Do not invent transcript text. If `result.transcript` is absent or empty,
  write `Not available.` in the transcript section.
