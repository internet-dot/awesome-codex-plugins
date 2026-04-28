---
name: calle
description: Use Call-E from Codex through the calle CLI. Use for Call-E setup checks, authentication recovery, phone call planning, planned call execution, and call status checks.
license: MIT
---

# Call-E

Use this skill when the user wants Codex to use Call-E through the `calle` CLI.
This plugin version intentionally calls the CLI instead of configuring Codex to
connect directly to the remote MCP server.

## When to use

Use this skill for:

- verifying Call-E setup in Codex
- checking whether the `calle` CLI is available
- recovering from missing or expired Call-E authentication
- listing available Call-E MCP tools through the CLI
- planning a phone call
- running a planned call after planning returns complete run credentials
- checking a call run status
- reporting the final call summary, details, and transcript when a call reaches
  a terminal status

Do not use this skill when the user only wants a call script, roleplay,
simulated conversation, or general contact lookup that does not require Call-E.

## Safety and consent

- Real phone calls may contact external people or businesses.
- Do not place a real call unless the user clearly intends to do so.
- Always plan first.
- If the user asked to place a call, run it immediately after planning returns
  a valid `plan_id` and `confirm_token`.
- If the user asked only to verify setup or only to plan, do not run the call.
- Do not guess phone numbers, country codes, language, region, `plan_id`,
  `confirm_token`, or `run_id`.
- Do not print, request, or expose access tokens.

## CLI selection

Use the first command form that works.

Prefer the repository-local CLI when the current workspace contains it:

```bash
node packages/cli/bin/calle.js
```

If the repository-local CLI is unavailable, use the global command:

```bash
calle
```

If neither command works, use the pinned npm package through `npx`:

```bash
npx -y @call-e/cli@0.1.0
```

Only tell the user to install the CLI globally if `npx` is unavailable,
network access is blocked, or the user explicitly wants a persistent global
command.

## Readiness flow

Use this flow before call planning when setup is uncertain, when auth fails, or
when the user asks to verify Call-E setup:

1. Check CLI availability with `--help`.
2. Run `auth status`.
3. If auth is missing or expired, run or suggest `auth login`.
4. After login completes, run `mcp tools`.
5. Confirm that `plan_call`, `run_call`, and `get_call_run` are available.

Setup verification must not place a real phone call. Use only help, auth, and
tool-listing commands until the user asks for a call workflow.

## Call flow

1. Use `call plan` first.
2. Read the returned `plan_id` and `confirm_token`.
3. If the user's request is to place a call, immediately use `call run` with
   the exact `plan_id` and `confirm_token` returned by planning.
4. Do not ask for a second confirmation between `call plan` and `call run`.
5. Read the returned `run_id`.
6. If the latest status is not terminal, keep using `call status` with that
   exact `run_id` until the call reaches a terminal status or the user asks you
   to stop.
7. Use `call status` only with a known `run_id`.

Terminal statuses include `COMPLETED`, `FAILED`, `NO_ANSWER`, `DECLINED`,
`CANCELED`, `CANCELLED`, `VOICEMAIL`, `BUSY`, and `EXPIRED`.

When the call reaches a terminal status, reply with the final call result,
including these sections in this order:

```text
[Status]
<status>

[Call Summary]
<post_summary or summary or message>

[Details]
Callee Number: <primary callee or Not available>
Duration: <duration or Not available>
Time: <start/end time or Not available>
Call id: <call_id or Not available>

[Transcript]
<transcript or Not available.>
```

If the user asked for extra final content, such as key takeaways or next steps,
add it after `[Transcript]` under a short heading. Base all final sections only
on the JSON returned by `call run` or `call status`; do not invent a transcript.

If any command returns `auth_required`, switch to the readiness flow, complete
login, and then retry the original operation after login completes.

Use `references/commands.md` for exact command examples, supported options, and
JSON handling rules.
