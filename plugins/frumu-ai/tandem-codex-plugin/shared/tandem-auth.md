# Tandem Auth Recipe

The plugin talks to a running Tandem engine over HTTP. The engine is
authenticated by a single token. This file covers all verified ways to
provide that token.

Reference: <https://docs.tandem.ac/engine-authentication-for-agents/>.

---

## 1. Get the engine running

Two supported install paths. Pick one.

### A. CLI binaries / headless

```bash
npm install -g @frumu/tandem
tandem doctor
tandem-engine status
tandem-engine serve --hostname 127.0.0.1 --port 39731
```

`@frumu/tandem` ships the `tandem` master CLI and the `tandem-engine`
runtime. Use this on servers, CI, or any machine that wants
terminal-first setup. Use `tandem-engine` for engine-specific commands
such as `serve`, `status`, `providers`, and `token generate`.

### B. Control panel

```bash
npm install -g @frumu/tandem
tandem install panel               # installs @frumu/tandem-panel
tandem panel init                  # provisions the panel + engine + token
tandem panel open                  # optional: open the web admin
```

The panel is `@frumu/tandem-panel`, a web control center for the same
engine the plugin talks to.

> **Legacy compatibility.** Older docs reference a standalone `tandem-setup`
> CLI from `@frumu/tandem-panel`. Use the `tandem install panel` flow above
> unless docs you trust say otherwise for your version.

### Verify

The default URL the plugin uses is `http://127.0.0.1:39731`. Override via
`TANDEM_BASE_URL`.

When using the bundled SDK:

```ts
const client = new TandemClient({ baseUrl, token });
await client.health();
```

In Codex, the fastest end-to-end check is `/tandem-doctor`.

---

## 2. Provide the token

The `@frumu/tandem-client` `TandemClient` constructor takes a string
`token`. It does **not** itself read env vars or files. The plugin's
helper scripts (`scripts/`) resolve the token from the environment in
this order, then pass the resulting string to the SDK constructor:

### Order 1 — `TANDEM_API_TOKEN` env var (simplest)

```bash
export TANDEM_API_TOKEN="<token>"
```

Copy from the control panel's Settings → Engine Auth view, or from
whatever onboarding command your installer ran.

### Order 2 — `TANDEM_API_TOKEN_FILE` env var

```bash
export TANDEM_API_TOKEN_FILE="/path/your/installer/chose"
```

The helper scripts read the file lazily, trim it, and pass the contents
to `new TandemClient({ token })`. The path is **whatever the installer
chose** — the plugin does not assume a fixed location. Check the output
of `tandem panel init` (panel install) or your engine-bring-up script
(headless install) for the canonical path.

### Order 3 — SDK `token` constructor option (what the scripts call)

```ts
import { TandemClient } from "@frumu/tandem-client";

const client = new TandemClient({ baseUrl, token });
```

This is the *output* of the resolution order above — the scripts pass
the resolved string here. If you're calling the SDK from your own code
outside the plugin, this is where the token enters the SDK.

### Discovery

If you're not sure where your token lives, run `/tandem-setup` in Codex.
It walks through the discovery order and points at the canonical docs —
without assuming a specific path.

---

## 3. Header forms

The engine accepts any of these on a request:

- `X-Agent-Token: <token>`
- `X-Tandem-Token: <token>`
- `Authorization: Bearer <token>`

The bundled SDK picks one automatically. If you're hand-rolling fetch
calls, prefer `Authorization: Bearer`.

```ts
fetch(`${baseUrl}/global/health`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
```

---

## 4. Engine auth is not provider auth

There are three separate credentials in play:

- **Codex authentication** lets the user run Codex.
- **Tandem engine authentication** lets Codex talk to the Tandem engine.
- **Tandem provider authentication** lets the Tandem engine call OpenAI,
  Anthropic, OpenRouter, or another model provider.

Codex login does not automatically configure model providers inside
Tandem. Before validating, applying, or running workflows that execute
model work, check provider readiness:

```ts
await client.providers.config();
await client.providers.catalog();
```

Configure provider keys and defaults through the Tandem engine:

```bash
tandem-engine providers
tandem-engine serve --provider openai --model gpt-4o-mini
tandem-engine run "Smoke test provider setup" --provider openai --model gpt-4o-mini
```

Provider-specific env vars such as `OPENAI_API_KEY`,
`ANTHROPIC_API_KEY`, and `OPENROUTER_API_KEY` are read by the selected
provider. For one process or one command, `--api-key` can override the
selected provider key.

For trusted local setup scripts, the SDK exposes:

```ts
await client.providers.setApiKey(providerId, apiKey);
await client.providers.setDefaults(providerId, modelId);
```

Never paste model-provider API keys into Codex chat. Pass them directly
from a private local shell, engine config, provider-specific env vars, or
script.

---

## 4. Healthcheck script

```bash
npm run healthcheck
```

Runs `scripts/tandem-api-healthcheck.ts`. It resolves the token via the
same order as the SDK (`TANDEM_API_TOKEN`, then `TANDEM_API_TOKEN_FILE`)
and exits 0 with `ok` printed when auth and connectivity are good.

In a Codex session the equivalent (with structured output and next-action
hints) is `/tandem-doctor`.

---

## 5. Common 401 / 403 failures

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | No token sent | Check env var or header. |
| `401` despite token | Token rotated or expired | Regenerate with `tandem-engine token generate`. |
| `403 Forbidden` | Endpoint requires a different scope (e.g. control-panel-only) | Use the control panel or escalate scope. |
| `connection refused` | Engine not running | Start with `tandem-engine serve ...`; for panel setup run `tandem panel init`. |
| Engine logs warn `unsafe-no-token` | `TANDEM_UNSAFE_NO_API_TOKEN=1` is set | Unset for any non-trusted-local-dev use. |

---

## 6. Dev-only escape hatch

```bash
export TANDEM_UNSAFE_NO_API_TOKEN=1
```

Bypasses token enforcement on the engine and the SDK. The engine logs a
warning **on every request** when this is set.

**Do not** use on:
- Anything reachable from another machine.
- Hosted, shared, or production engines.
- CI runners.
- Any machine with sensitive workspaces or MCP credentials.

The plugin's helper scripts honour this flag for parity with the engine,
but the README warns against it.

---

## 7. The plugin's contract with you

This plugin **never**:

- Logs your token.
- Writes your token to disk.
- Sends your token to anyone but the configured Tandem engine.
- Persists your token between sessions.

If you see token bytes in any plugin log or commit, treat it as a bug
and rotate the token immediately:

```bash
tandem-engine token generate
```
