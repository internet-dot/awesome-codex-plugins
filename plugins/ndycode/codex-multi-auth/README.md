# codex-multi-auth

[![npm version](https://img.shields.io/npm/v/codex-multi-auth.svg)](https://www.npmjs.com/package/codex-multi-auth)
[![npm downloads](https://img.shields.io/npm/dw/codex-multi-auth.svg)](https://www.npmjs.com/package/codex-multi-auth)

Codex CLI-first multi-account OAuth manager for the official Codex CLI. The package installs conflict-free alongside official `codex` installs; use `codex-multi-auth ...` for account management or `codex-multi-auth-codex ...` when you explicitly want the forwarding wrapper.

<img width="1270" height="729" alt="2026-02-28 12_54_58-prompt txt ‎- Notepads" src="https://github.com/user-attachments/assets/0cecb77e-a6d3-432a-ba48-3577db0c7093" />



> [!NOTE]
> Legacy scoped prerelease package `@ndycode/codex-multi-auth` is migration-only.
> Use `codex-multi-auth` for all new installs.

## What You Get

- Conflict-free `codex-multi-auth ...` workflow for account login, switching, checks, and diagnostics
- Official Codex CLI forwarding for all non-auth commands
- Multi-account OAuth pool with health-aware selection and automatic failover
- Project-scoped account storage under `~/.codex/multi-auth/projects/<project-key>/...`
- Interactive dashboard for account actions and settings
- Experimental settings tab for staged sync, backup, and refresh-guard controls
- Forecast, report, fix, and doctor commands for operational safety
- Local usage ledger, budgets, account policy controls, routing profiles, and monitor views for local governance
- Runtime counters, budget/cooldown state, and multi-auth probe visibility in `codex-multi-auth status` / `codex-multi-auth report`
- Default-on runtime Responses proxy for live account rotation inside forwarded Codex CLI/app sessions
- Optional loopback-only local bridge for `/health`, `/v1/models`, and `/v1/responses`, protected by hashed local client tokens
- Reversible packaged Codex app bind and user-level launcher routing helpers
- Flagged account verification and restore flow
- Session affinity and live account sync controls
- Proactive refresh and preemptive quota deferral controls
- Codex-oriented request/prompt compatibility with strict runtime handling
- Stable docs set for install, config, troubleshooting, and upgrade paths

---

<details open>
<summary><b>Terms and Usage Notice</b></summary>

> [!CAUTION]
> This project uses OAuth account credentials and is intended for personal development use.
>
> By using this package, you acknowledge:
> - This is an independent open-source project, not an official OpenAI product
> - You are responsible for your own usage and policy compliance
> - For production/commercial workloads, use the OpenAI Platform API

</details>

---

## Installation

<details open>
<summary><b>For Humans</b></summary>

### Option A: Standard install

```bash
npm i -g codex-multi-auth
```

### Option B: Migrate from legacy scoped prerelease

```bash
npm uninstall -g @ndycode/codex-multi-auth
npm i -g codex-multi-auth
```

### Option C: Verify wiring

`codex --version` confirms the official Codex CLI is reachable. `codex-multi-auth --version` confirms the installed manager package version. `codex-multi-auth-codex --version` is the optional forwarding wrapper entrypoint.

```bash
codex --version
codex-multi-auth --version
codex-multi-auth status
```

Any official install path is fine as long as `codex` is on `PATH`: `npm i -g @openai/codex`, `brew install --cask codex`, or an official release binary.

</details>

<details>
<summary><b>For LLM Agents</b></summary>

### Step-by-step

1. Install global package:
   - `npm i -g codex-multi-auth`
2. Run first login flow with `codex-multi-auth login`
3. Validate state with `codex-multi-auth status` and `codex-multi-auth check`
4. Confirm routing with `codex-multi-auth forecast --live`

### Verification

```bash
codex-multi-auth status
codex-multi-auth check
```

</details>

---

## Quick Start

Install and sign in:

```bash
npm i -g @openai/codex
npm i -g codex-multi-auth
codex-multi-auth login
```

If you already installed the official native CLI via Homebrew or a release binary, you only need:

```bash
npm i -g codex-multi-auth
codex-multi-auth login
```

Verify the manager and the new account:

```bash
codex-multi-auth status
codex-multi-auth check
```

Use these next:

```bash
codex-multi-auth list
codex-multi-auth switch 2
codex-multi-auth forecast --live
```

If browser launch is blocked, use the alternate login paths in [docs/getting-started.md](docs/getting-started.md#alternate-login-paths).
For remote or headless shells, prefer `codex-multi-auth login --device-auth`.

---

## Command Toolkit

### Start here

| Command | What it answers |
| --- | --- |
| `codex-multi-auth login` | How do I add or re-open the account menu? |
| `codex-multi-auth status` | Is the wrapper active right now? |
| `codex-multi-auth check` | Do my saved accounts look healthy? |

### Daily use

| Command | What it answers |
| --- | --- |
| `codex-multi-auth list` | Which accounts are saved and which one is active? |
| `codex-multi-auth switch <index>` | How do I move to a different saved account? |
| `codex-multi-auth forecast --live` | Which account looks best for the next session? |

### Repair

| Command | What it answers |
| --- | --- |
| `codex-multi-auth verify-flagged` | Can any previously flagged account be restored? |
| `codex-multi-auth verify --paths` | Do my storage path chain and sandbox probes still pass self-test? |
| `codex-multi-auth fix --dry-run` | What safe storage or account repairs are available? |
| `codex-multi-auth doctor --fix` | Can the CLI diagnose and apply the safest fixes now? |

### Advanced

| Command | What it answers |
| --- | --- |
| `codex-multi-auth report --live --json` | How do I get the full machine-readable health report? |
| `codex-multi-auth fix --live --model gpt-5.3-codex` | How do I run live repair probes with a chosen model? |
| `codex-multi-auth why-selected --json` | Which account does the selector pick now, and why? |
| `codex-multi-auth usage --since 24h --by project` | What local usage has been recorded recently? |
| `codex-multi-auth monitor --json` | What is the combined usage, policy, quota, runtime, and project state? |
| `codex-multi-auth bridge token create --label local-client` | How do I create a local bridge bearer token? |
| `codex-multi-auth integrations --kind python` | How do I generate local bridge client snippets? |
| `codex-multi-auth rotation status` | Is live runtime account rotation enabled for forwarded Codex sessions? |

### Reliability behavior

- whole-pool replay is disabled by default when every account is rate-limited
- active requests use a bounded outbound request budget so one prompt cannot walk the full pool indefinitely
- repeated cross-account 5xx bursts trigger a short cooldown instead of continuing aggressive rotation
- proactive refresh is staggered to reduce background refresh bursts
- `codex-multi-auth status` surfaces recent runtime request metrics in text output, and `codex-multi-auth report --json` exposes the machine-readable cooldown/runtime snapshot

---

## Dashboard Hotkeys

### Main dashboard

| Key | Action |
| --- | --- |
| `Up` / `Down` | Move selection |
| `Enter` | Select/open |
| `1-9` | Quick switch |
| `/` | Search |
| `?` | Toggle help |
| `Q` | Back/cancel |

### Account details

| Key | Action |
| --- | --- |
| `S` | Set current account |
| `R` | Refresh/re-login account |
| `E` | Enable/disable account |
| `D` | Delete account |

---

## Storage Paths

| File | Default path |
| --- | --- |
| Settings | `~/.codex/multi-auth/settings.json` |
| Accounts | `~/.codex/multi-auth/openai-codex-accounts.json` |
| Flagged accounts | `~/.codex/multi-auth/openai-codex-flagged-accounts.json` |
| Quota cache | `~/.codex/multi-auth/quota-cache.json` |
| Runtime observability | `~/.codex/multi-auth/runtime-observability.json` |
| Usage ledger | `~/.codex/multi-auth/usage/usage-ledger.jsonl` |
| Account policies | `~/.codex/multi-auth/account-policies.json` |
| Routing profiles | `~/.codex/multi-auth/routing-profiles.json` |
| Budget guards | `~/.codex/multi-auth/budget-guards.json` |
| Local client tokens | `~/.codex/multi-auth/local-client-tokens.json` |
| Runtime app helper status | `~/.codex/multi-auth/runtime-rotation-app-helper.json` |
| Persistent app bind state/logs | `~/.codex/multi-auth/app-bind/` |
| Logs | `~/.codex/multi-auth/logs/codex-plugin/` |
| Per-project accounts | `~/.codex/multi-auth/projects/<project-key>/openai-codex-accounts.json` |

Override root with `CODEX_MULTI_AUTH_DIR=<path>`.

---

## Configuration

Primary config root:
- `~/.codex/multi-auth/settings.json`
- or `CODEX_MULTI_AUTH_DIR/settings.json` when custom root is set

Selected runtime/environment overrides:

| Variable | Effect |
| --- | --- |
| `CODEX_MULTI_AUTH_DIR` | Override settings/accounts root |
| `CODEX_MULTI_AUTH_CONFIG_PATH` | Alternate config file path |
| `CODEX_MODE=0/1` | Disable/enable Codex mode |
| `CODEX_MULTI_AUTH_RUNTIME_ROTATION_PROXY=0/1` | Opt out/in of live Responses proxy rotation for forwarded Codex CLI/app sessions |
| `CODEX_MULTI_AUTH_APP_ROTATION_IDLE_MS=<ms>` | Override automatic Codex app helper idle shutdown |
| `CODEX_MULTI_AUTH_APP_BIND_INSTALL=0/1` | Opt out/in of packaged Codex app bind self-heal during install/update or rotation enable |
| `CODEX_MULTI_AUTH_APP_LAUNCHER_INSTALL=0/1` | Opt out/in of routing supported app shortcuts during install/update or rotation enable |
| `CODEX_MULTI_AUTH_AUTO_UPDATE=0/1` | Opt out/in of best-effort global package auto-update checks |
| `CODEX_TUI_V2=0/1` | Disable/enable TUI v2 |
| `CODEX_TUI_COLOR_PROFILE=truecolor\|ansi256\|ansi16` | TUI color profile |
| `CODEX_TUI_GLYPHS=ascii\|unicode\|auto` | TUI glyph style |
| `CODEX_AUTH_BACKGROUND_RESPONSES=0/1` | Opt in/out of stateful Responses `background: true` compatibility |
| `CODEX_AUTH_FETCH_TIMEOUT_MS=<ms>` | Request timeout override |
| `CODEX_AUTH_STREAM_STALL_TIMEOUT_MS=<ms>` | Stream stall timeout override |

Validate config after changes:

```bash
codex-multi-auth status
codex-multi-auth check
codex-multi-auth forecast --live
```

Responses background mode stays opt-in. Enable `backgroundResponses` in settings or `CODEX_AUTH_BACKGROUND_RESPONSES=1` only for callers that intentionally send `background: true`, because those requests switch from stateless `store=false` routing to stateful `store=true`. See [docs/upgrade.md](docs/upgrade.md) for rollout guidance.

Runtime rotation is enabled by default for request-bearing wrapper-launched Codex sessions. Global install/update self-heals supported packaged Codex app binds and user-level launcher routing when possible, while `codex-multi-auth rotation enable` remains the explicit repair command. `codex-multi-auth rotation disable` turns the setting off and removes the persistent app bind. Set `CODEX_MULTI_AUTH_RUNTIME_ROTATION_PROXY=0`, `CODEX_MULTI_AUTH_APP_BIND_INSTALL=0`, `CODEX_MULTI_AUTH_APP_LAUNCHER_INSTALL=0`, or `CODEX_MULTI_AUTH_AUTO_UPDATE=0` to opt out of the matching default behavior.

---

## Experimental Settings Highlights

The Settings menu now includes an `Experimental` section for staged features:

- preview-first sync into `oc-chatgpt-multi-auth`
- named local pool backup export with filename prompt
- refresh guard toggle and interval controls moved out of Backend Controls

These flows are intentionally non-destructive by default: sync previews before apply, destination-only accounts are preserved, and backup filename collisions fail safely.

---

## Troubleshooting

<details open>
<summary><b>60-second recovery</b></summary>

```bash
codex-multi-auth doctor --fix
codex-multi-auth check
codex-multi-auth forecast --live
```

If still broken:

```bash
codex-multi-auth login
```

</details>

<details>
<summary><b>Common symptoms</b></summary>

- `codex auth` unrecognized: run `where codex` or `which codex`, then follow `docs/troubleshooting.md` for routing fallback commands
- Switch succeeds but wrong account appears active: run `codex-multi-auth switch <index>`, then restart session
- Requests fail fast with a pool cooldown message: wait for the cooldown window or inspect `codex-multi-auth status`
- Requests fail fast after repeated upstream 5xx errors: inspect `codex-multi-auth report --json` for runtime traffic and cooldown details
- Storage cleanup fails with `EBUSY` / `EPERM` (Windows): run `codex-multi-auth doctor --fix` to retry, or manually remove `~/.codex/multi-auth/<project-key>/` and re-login
- OAuth callback on port `1455` fails: free the port and re-run `codex-multi-auth login`
- Browser launch is blocked or you are in a headless shell: prefer `codex-multi-auth login --device-auth`; use `codex-multi-auth login --manual` or `CODEX_AUTH_NO_BROWSER=1` only when you need the callback-paste fallback
- `missing field id_token` / `token_expired` / `refresh_token_reused`: re-login affected account

</details>

<details>
<summary><b>Diagnostics pack</b></summary>

```bash
codex-multi-auth list
codex-multi-auth status
codex-multi-auth check
codex-multi-auth verify-flagged --json
codex-multi-auth forecast --live
codex-multi-auth fix --dry-run
codex-multi-auth report --live --json
codex-multi-auth doctor --json
```

</details>

---

## Documentation

- Docs portal: [docs/README.md](docs/README.md)
- Getting started: [docs/getting-started.md](docs/getting-started.md)
- Features: [docs/features.md](docs/features.md)
- Configuration: [docs/configuration.md](docs/configuration.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- Commands reference: [docs/reference/commands.md](docs/reference/commands.md)
- Public API contract: [docs/reference/public-api.md](docs/reference/public-api.md)
- Error contracts: [docs/reference/error-contracts.md](docs/reference/error-contracts.md)
- Settings reference: [docs/reference/settings.md](docs/reference/settings.md)
- Storage paths: [docs/reference/storage-paths.md](docs/reference/storage-paths.md)
- Upgrade guide: [docs/upgrade.md](docs/upgrade.md)
- Privacy: [docs/privacy.md](docs/privacy.md)

---

## Release Notes

- Current stable: [docs/releases/v2.1.3.md](docs/releases/v2.1.3.md)
- Previous stable: [docs/releases/v2.1.2.md](docs/releases/v2.1.2.md)
- Earlier stable: [docs/releases/v2.1.1.md](docs/releases/v2.1.1.md)
- Earlier stable: [docs/releases/v2.1.0.md](docs/releases/v2.1.0.md)
- Earlier stable: [docs/releases/v1.3.2.md](docs/releases/v1.3.2.md)
- Stable archive: [docs/releases/v1.3.1.md](docs/releases/v1.3.1.md)
- Full release archive: [docs/README.md#release-history](docs/README.md#release-history)
- Archived prerelease: [docs/releases/v0.1.0-beta.0.md](docs/releases/v0.1.0-beta.0.md)

## License

MIT License. See [LICENSE](LICENSE).

<details>
<summary><b>Legal</b></summary>

- Not affiliated with OpenAI.
- "ChatGPT", "Codex", and "OpenAI" are trademarks of OpenAI.
- You assume responsibility for your own usage and compliance.

</details>
