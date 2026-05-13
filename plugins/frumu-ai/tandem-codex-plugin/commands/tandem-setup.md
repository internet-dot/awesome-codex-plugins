---
title: /tandem-setup
description: Discover where the local Tandem engine, token, providers, and default model are configured. Docs-driven walkthrough — does not assume a specific install path or token location.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Purpose

Help the user discover (or rediscover) how Tandem is installed on this
machine, where the engine token lives, and whether Tandem has model
providers/defaults configured. This command is **docs-driven guidance**,
not a "the token is definitely at <path>" statement.

Use this when:

- A user has just installed the plugin and isn't sure how to point it at
  an engine.
- `/tandem-doctor` reported a missing token or a connection failure.
- `/tandem-doctor` reported missing provider/model readiness.
- The user switched between the headless engine and the control panel
  and isn't sure which token is current.

## Behaviour

### Step 1 — Show the supported install paths

State both options. Do not pick one for the user unless they ask.

**A. CLI binaries / headless**

```bash
npm install -g @frumu/tandem
tandem doctor
tandem-engine status
tandem-engine serve --hostname 127.0.0.1 --port 39731
```

`@frumu/tandem` provides the `tandem` master CLI and the `tandem-engine`
runtime. Use `tandem-engine` for engine-specific commands like `serve`,
`status`, `providers`, and `token generate`. Use the `tandem` master
CLI for top-level diagnostics such as `tandem doctor` and add-ons such
as `tandem panel ...`. Best for servers, CI, or terminal-first local
use.

**B. Control panel**

```bash
npm install -g @frumu/tandem
tandem install panel               # installs @frumu/tandem-panel
tandem panel init                  # provisions panel + engine + token
tandem panel open                  # optional: open the web admin
```

Best for local dev where the user also wants the web UI.

> **Legacy compatibility.** A standalone `tandem-setup` CLI from
> `@frumu/tandem-panel` is referenced in older docs. Mention it only if
> the user reports they followed older docs.

### Step 2 — Walk token discovery (in this order)

State the resolution order without claiming a specific file path:

1. **`TANDEM_API_TOKEN`** env var. Simplest. Set in shell or `.env`.
2. **`TANDEM_API_TOKEN_FILE`** env var pointing at a file containing the
   token. Path is whatever the installer chose — check the output of
   `tandem panel init` or your engine-bring-up script.
3. **SDK `token` constructor option.** Used by the helper scripts in
   `scripts/` after they load `.env`.

If the user installed via the panel, point them at the panel's
Settings → Engine Auth view to copy or rotate the token.

### Step 3 — List the accepted request headers

For users hand-rolling fetch calls (the SDK handles this automatically):

- `X-Agent-Token: <token>`
- `X-Tandem-Token: <token>`
- `Authorization: Bearer <token>`

### Step 4 — Report what's detectable from the current env

Without echoing values, report:

- `TANDEM_BASE_URL`: value or "(using default `http://127.0.0.1:39731`)"
- `TANDEM_API_TOKEN`: "set" or "unset"
- `TANDEM_API_TOKEN_FILE`: "set: `<path>`" or "unset" (path is fine to
  show; token contents are not)
- `TANDEM_UNSAFE_NO_API_TOKEN`: "set (unsafe)" or "unset"
- Provider-key env vars such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
  and `OPENROUTER_API_KEY`: "set" or "unset" only. Never echo values.

### Step 5 — Explain provider/model setup

Make this separation explicit:

- Codex authentication lets the user run Codex.
- Tandem engine authentication lets Codex talk to the Tandem engine.
- Tandem model-provider authentication lets the Tandem engine run model
  work. Codex auth does **not** automatically configure Tandem providers.

Recommended setup path:

1. Run Tandem's first-run checks: `tandem doctor` and
   `tandem-engine status`.
2. List supported provider IDs with `tandem-engine providers`.
3. Configure provider credentials through provider-specific env vars,
   engine config, or a command-scoped `--api-key` when running
   `tandem-engine serve`, `tandem-engine run`, or
   `tandem-engine parallel`.
4. Common provider env vars include `OPENAI_API_KEY`,
   `ANTHROPIC_API_KEY`, and `OPENROUTER_API_KEY`.
5. Choose provider/model defaults through engine config or command
   options such as `--provider <id>` and `--model <id>`.
6. Re-run `/tandem-doctor`.

SDK surface available for trusted local scripts:

```ts
await client.providers.catalog();              // list providers/models
await client.providers.config();               // current defaults/status
await client.providers.setApiKey(id, apiKey);  // store provider key
await client.providers.setDefaults(id, model); // choose default model
```

Do not ask the user to paste provider API keys into Codex chat. If they
want local CLI/script setup, tell them to run it in their shell, engine
config, or provider-specific env vars.

### Step 6 — Suggest next

End with: "Run `/tandem-doctor` to verify the engine is reachable and
the token and provider/model setup work."

## Behaviour rules

- **Do not** claim the token "definitely lives at" any path. Use phrasing
  like "your installer likely wrote it to a path of its choosing — check
  its output".
- **Do not** modify files, env vars, or run setup commands. This is
  read-only guidance.
- **Never** echo the token value or provider API keys, even partially.
- Reference [`shared/tandem-auth.md`](../shared/tandem-auth.md) for the
  full recipe.

## Output

A short structured response with these sections, in order:

1. Detected env (without secrets).
2. Install paths (A and B).
3. Token discovery order.
4. Accepted headers.
5. Provider/model setup.
6. Suggested next command.
