---
title: /tandem-doctor
description: Verify the plugin can reach a running Tandem engine. Checks base URL, token resolution, engine health, authenticated read access, and provider/model readiness when endpoints are confirmed.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Purpose

Run a one-shot diagnostic against the user's Tandem setup before any
workflow design, validation, preview, or apply. The skill's pre-flight
calls this when the engine appears unreachable or auth fails.

## Checks (in order; stop and report at the first connection/auth failure)

### 1. `TANDEM_BASE_URL`

- Read from env, fall back to `http://127.0.0.1:39731`.
- Confirm it is parseable as a URL with `http://` or `https://`.
- Report the value.

### 2. Token presence

Resolve in the same order the SDK does:

1. `TANDEM_API_TOKEN` env var (any non-empty value).
2. `TANDEM_API_TOKEN_FILE` env var pointing at a file:
   - File exists and is readable.
   - File contents are non-empty after trimming.
3. SDK `token` constructor option — applicable when the caller passes one.

If none of the above is set:

- If `TANDEM_UNSAFE_NO_API_TOKEN=1` is set, warn loudly and continue.
  This is dev-only and the engine logs a warning on every request.
- Otherwise stop and report token is unset; recommend `/tandem-setup`.

Report token source as:

- `env: TANDEM_API_TOKEN` (do not echo the value)
- `file: <path>` (path is fine; contents are not)
- `unsafe-no-token`
- `unset`

### 3. Engine health endpoint

Only if a health/status endpoint is confirmed in the loaded Tandem docs
or the SDK exposes a `health()` call, run it:

- Preferred: `client.health()` via `@frumu/tandem-client`.
- Alternative (if endpoint is documented): `GET ${TANDEM_BASE_URL}/<path>`.

Show the engine response verbatim. Report `ok` / `failed` / `skipped`
(`skipped` when no endpoint is confirmed in the docs you can verify).

### 4. Authenticated request

Only if step 3 succeeded **and** an authenticated read-only endpoint is
confirmed (e.g. a `workflowPlans.list` or `automationsV2.list` call):

- Call it with the resolved token.
- Report `ok` (got a 2xx response and a parseable payload) or `failed`
  with the engine's error verbatim.
- If no such endpoint is confirmed in the loaded docs, report `skipped`
  and say so.

### 5. Provider/model readiness

Only if step 3 succeeded and the SDK exposes `client.providers`:

- Call `client.providers.config()`.
- Report configured default provider/model if present.
- If no default is configured, call `client.providers.catalog()` when
  available and summarize available provider/model choices without
  inventing a recommendation.
- If provider config endpoints fail, report `failed` with the engine's
  error verbatim.
- If provider config endpoints are unavailable in this Tandem version,
  report `skipped (providers API unavailable)`.

This check answers whether Tandem can run model work. Codex
authentication does not satisfy this requirement.

## Behaviour rules

- **Never** log or echo the token value. Only report source labels.
- **Never** ask for or echo model-provider API keys. Provider keys belong
  in provider-specific env vars, engine config, or a private local
  SDK/CLI setup session.
- **Surface engine errors verbatim.** Do not paraphrase 401s, 403s, or
  network errors. They are the user's most actionable signal.
- For each failed check, print one concrete next action:
  - Missing token: `Run /tandem-setup`.
  - Engine unreachable: start the engine with `tandem-engine serve ...`;
    for panel setup run `tandem panel init`.
  - 401 / 403: `Rotate or re-export the token; see shared/tandem-auth.md`.
  - Missing provider/default model: run `tandem-engine providers`,
    configure provider credentials via env vars or engine config, choose
    a provider/model with engine config or `--provider` / `--model`, then
    re-run `/tandem-doctor`.
- This command is **read-only**. It does not write files, mutate env, or
  start processes.
- If `npm run healthcheck` is available in the workspace, you may invoke
  it as the implementation of steps 3–5 and parse its exit code + JSON
  output instead of calling the SDK directly.

## Output

A structured response in this exact shape:

```
Tandem doctor:
- TANDEM_BASE_URL: <value or default>
- Token: <env | file:<path> | unsafe-no-token | unset>
- Health endpoint: <ok | failed | skipped (reason)>
- Authenticated request: <ok | failed | skipped (reason)>
- Provider/model readiness: <ok provider=<id> model=<id> | missing default | failed | skipped (reason)>

Engine errors (verbatim):
<...if any...>

Next:
- <one concrete action; or "proceed with /create-workflow" if all green>
```

If everything passes, end with a one-line suggestion to proceed with
`/create-workflow`, `/build-complex-workflow`, or `/validate-workflow`
based on what the user said in the same session.
