# codex-multi-auth

[![npm version](https://img.shields.io/npm/v/codex-multi-auth.svg)](https://www.npmjs.com/package/codex-multi-auth)
[![npm downloads](https://img.shields.io/npm/dw/codex-multi-auth.svg)](https://www.npmjs.com/package/codex-multi-auth)

Codex CLI-first multi-account OAuth manager for the official `@openai/codex` CLI.

<img width="1270" height="729" alt="2026-02-28 12_54_58-prompt txt ‎- Notepads" src="https://github.com/user-attachments/assets/0cecb77e-a6d3-432a-ba48-3577db0c7093" />


> [!NOTE]
> Legacy scoped prerelease package `@ndycode/codex-multi-auth` is migration-only.
> Use `codex-multi-auth` for all new installs.
## What You Get

- Canonical `codex auth ...` workflow for account login, switching, checks, and diagnostics
- Multi-account OAuth pool with health-aware selection and automatic failover
- Project-scoped account storage under `~/.codex/multi-auth/projects/<project-key>/...`
- Interactive dashboard for account actions and settings
- Experimental settings tab for staged sync, backup, and refresh-guard controls
- Forecast, report, fix, and doctor commands for operational safety
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
> By using this plugin, you acknowledge:
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

`codex --version` confirms the official Codex CLI is reachable. `codex-multi-auth --version` confirms the installed wrapper package version.

```bash
codex --version
codex-multi-auth --version
codex auth status
```

</details>

<details>
<summary><b>For LLM Agents</b></summary>

### Step-by-step

1. Install global package:
   - `npm i -g codex-multi-auth`
2. Run first login flow with `codex auth login`
3. Validate state with `codex auth status` and `codex auth check`
4. Confirm routing with `codex auth forecast --live`

### Verification

```bash
codex auth status
codex auth check
```

</details>

---

## Quick Start

Install and sign in:

```bash
npm i -g @openai/codex
npm i -g codex-multi-auth
codex auth login
```

Verify the wrapper and the new account:

```bash
codex auth status
codex auth check
```

Use these next:

```bash
codex auth list
codex auth switch 2
codex auth forecast --live
```

If browser launch is blocked, use the alternate login paths in [docs/getting-started.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/getting-started.md#alternate-login-paths).

---

## Command Toolkit

### Start here

| Command | What it answers |
| --- | --- |
| `codex auth login` | How do I add or re-open the account menu? |
| `codex auth status` | Is the wrapper active right now? |
| `codex auth check` | Do my saved accounts look healthy? |

### Daily use

| Command | What it answers |
| --- | --- |
| `codex auth list` | Which accounts are saved and which one is active? |
| `codex auth switch <index>` | How do I move to a different saved account? |
| `codex auth forecast --live` | Which account looks best for the next session? |

### Repair

| Command | What it answers |
| --- | --- |
| `codex auth verify-flagged` | Can any previously flagged account be restored? |
| `codex auth fix --dry-run` | What safe storage or account repairs are available? |
| `codex auth doctor --fix` | Can the CLI diagnose and apply the safest fixes now? |

### Advanced

| Command | What it answers |
| --- | --- |
| `codex auth report --live --json` | How do I get the full machine-readable health report? |
| `codex auth fix --live --model gpt-5-codex` | How do I run live repair probes with a chosen model? |

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
| `CODEX_TUI_V2=0/1` | Disable/enable TUI v2 |
| `CODEX_TUI_COLOR_PROFILE=truecolor|ansi256|ansi16` | TUI color profile |
| `CODEX_TUI_GLYPHS=ascii|unicode|auto` | TUI glyph style |
| `CODEX_AUTH_BACKGROUND_RESPONSES=0/1` | Opt in/out of stateful Responses `background: true` compatibility |
| `CODEX_AUTH_FETCH_TIMEOUT_MS=<ms>` | Request timeout override |
| `CODEX_AUTH_STREAM_STALL_TIMEOUT_MS=<ms>` | Stream stall timeout override |

Validate config after changes:

```bash
codex auth status
codex auth check
codex auth forecast --live
```

Responses background mode stays opt-in. Enable `backgroundResponses` in settings or `CODEX_AUTH_BACKGROUND_RESPONSES=1` only for callers that intentionally send `background: true`, because those requests switch from stateless `store=false` routing to stateful `store=true`. See [docs/upgrade.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/upgrade.md) for rollout guidance.

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
codex auth doctor --fix
codex auth check
codex auth forecast --live
```

If still broken:

```bash
codex auth login
```

</details>

<details>
<summary><b>Common symptoms</b></summary>

- `codex auth` unrecognized: run `where codex`, then follow `docs/troubleshooting.md` for routing fallback commands
- Switch succeeds but wrong account appears active: run `codex auth switch <index>`, then restart session
- OAuth callback on port `1455` fails: free the port and re-run `codex auth login`
- Browser launch is blocked or you are in a headless shell: re-run `codex auth login --manual` or set `CODEX_AUTH_NO_BROWSER=1`
- `missing field id_token` / `token_expired` / `refresh_token_reused`: re-login affected account

</details>

<details>
<summary><b>Diagnostics pack</b></summary>

```bash
codex auth list
codex auth status
codex auth check
codex auth verify-flagged --json
codex auth forecast --live
codex auth fix --dry-run
codex auth report --live --json
codex auth doctor --json
```

</details>

---

## Documentation

- Docs portal: [docs/README.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/README.md)
- Getting started: [docs/getting-started.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/getting-started.md)
- Features: [docs/features.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/features.md)
- Configuration: [docs/configuration.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/configuration.md)
- Troubleshooting: [docs/troubleshooting.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/troubleshooting.md)
- Commands reference: [docs/reference/commands.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/reference/commands.md)
- Public API contract: [docs/reference/public-api.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/reference/public-api.md)
- Error contracts: [docs/reference/error-contracts.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/reference/error-contracts.md)
- Settings reference: [docs/reference/settings.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/reference/settings.md)
- Storage paths: [docs/reference/storage-paths.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/reference/storage-paths.md)
- Upgrade guide: [docs/upgrade.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/upgrade.md)
- Privacy: [docs/privacy.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/privacy.md)

---

## Release Notes

- Current stable: [docs/releases/v1.2.2.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/releases/v1.2.2.md)
- Previous stable: [docs/releases/v1.2.1.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/releases/v1.2.1.md)
- Earlier stable: [docs/releases/v1.2.0.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/releases/v1.2.0.md)
- Archived prerelease: [docs/releases/v0.1.0-beta.0.md](https://github.com/ndycode/codex-multi-auth/blob/main/docs/releases/v0.1.0-beta.0.md)

## License

MIT License. See [LICENSE](LICENSE).

<details>
<summary><b>Legal</b></summary>

- Not affiliated with OpenAI.
- "ChatGPT", "Codex", and "OpenAI" are trademarks of OpenAI.
- You assume responsibility for your own usage and compliance.

</details>
