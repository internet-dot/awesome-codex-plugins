# oc-codex-multi-auth

[![npm version](https://img.shields.io/npm/v/oc-codex-multi-auth.svg)](https://www.npmjs.com/package/oc-codex-multi-auth)
[![npm downloads](https://img.shields.io/npm/dw/oc-codex-multi-auth.svg)](https://www.npmjs.com/package/oc-codex-multi-auth)

OpenCode plugin for ChatGPT Plus/Pro OAuth, Codex-first GPT-5 workflows, and multi-account rotation.

<img width="1227" height="702" alt="cover" src="https://github.com/user-attachments/assets/b796eb2f-282e-468a-ba6a-acadf09d731b" />



> [!NOTE]
> This package is the supported OpenCode plugin line.
> Older package names and config entries should be replaced with `oc-codex-multi-auth`.

## What You Get

- Official ChatGPT OAuth login through OpenCode's auth flow
- Ready-to-use GPT-5.5, GPT-5.5 Fast, GPT-5.4 Mini, GPT-5.4 Nano, GPT-5.1, and Codex model templates
- Compact modern OpenCode config with model variants, plus legacy explicit selector IDs when needed
- Stateless Codex-compatible request handling with `store: false` and `reasoning.encrypted_content`
- Multi-account rotation with health-aware selection, cooldowns, and automatic token refresh
- Per-project account storage under `~/.opencode/projects/<project-key>/...`
- Guided account setup, health, dashboard, export/import, keychain, and troubleshooting tools
- Optional OS-native keychain backend for stored account pools
- Request logging, metrics, and diagnostics for OpenCode integration debugging
- Stable docs set for install, config, troubleshooting, privacy, and development architecture

---

<details open>
<summary><b>Terms and Usage Notice</b></summary>

> [!CAUTION]
> This project is for personal development use with your own ChatGPT Plus/Pro subscription.
>
> By using this plugin, you acknowledge:
> - This is an independent open-source project, not an official OpenAI product
> - It is not intended for commercial resale, shared multi-user access, or production services
> - You are responsible for your own usage and policy compliance
> - For production/commercial workloads, use the OpenAI Platform API

</details>

---

## Installation

<details open>
<summary><b>For Humans</b></summary>

### Option A: Standard install

```bash
npx -y oc-codex-multi-auth@latest
```

### Option B: Full explicit model catalog

Use this when you want direct selector IDs such as `openai/gpt-5.5-medium` in addition to OpenCode variants.

```bash
npx -y oc-codex-multi-auth@latest --full
```

### Option C: Verify wiring

```bash
opencode --version
opencode debug config
opencode auth login
```

The installer updates `~/.config/opencode/opencode.json`, backs up the previous config, normalizes the plugin entry to `"oc-codex-multi-auth"`, and clears the OpenCode cached plugin copy so OpenCode reinstalls the latest package.

</details>

<details>
<summary><b>For LLM Agents</b></summary>

### Step-by-step

1. Install or refresh config:
   - `npx -y oc-codex-multi-auth@latest`
2. Run first login flow:
   - `opencode auth login`
3. Validate config:
   - `opencode debug config`
4. Run a smoke request:
   - `opencode run "Explain this repository" --model=openai/gpt-5.5 --variant=medium`
5. Inspect plugin state with the OpenCode tool surface:
   - `codex-status`
   - `codex-doctor`
   - `codex-list`

### Verification

```bash
opencode debug config
opencode auth login
opencode run "ping" --model=openai/gpt-5.5 --variant=medium
```

</details>

---

## Quick Start

Install and sign in:

```bash
npx -y oc-codex-multi-auth@latest
opencode auth login
```

Run a prompt with the compact modern selectors:

```bash
opencode run "Summarize the failing test and suggest a fix" --model=openai/gpt-5.5 --variant=medium
opencode run "Summarize the failing test and suggest a fix" --model=openai/gpt-5.5-fast --variant=medium
```

Use Codex-focused routing:

```bash
opencode run "Refactor the retry logic and update the tests" --model=openai/gpt-5-codex --variant=high
```

If browser launch is blocked, use the alternate login paths in [docs/getting-started.md](docs/getting-started.md#alternate-login-paths).

---

## Command Toolkit

### Start here

| Tool | What it answers |
| --- | --- |
| `codex-setup` | How do I finish first-run setup safely? |
| `codex-help` | Which plugin commands exist and what do they do? |
| `codex-doctor` | What is wrong with auth, config, storage, or routing? |
| `codex-next` | What should I do next to get unstuck? |

### Daily use

| Tool | What it answers |
| --- | --- |
| `codex-list` | Which accounts are saved and which one is active? |
| `codex-switch` | How do I move to a different saved account? |
| `codex-status` | Which account, model family, and routing state are active? |
| `codex-limits` | What quota or rate-limit state is visible now? |
| `codex-dashboard` | Can I manage accounts from one interactive surface? |

### Account management

| Tool | What it answers |
| --- | --- |
| `codex-label` | How do I name an account? |
| `codex-tag` | How do I group accounts with tags? |
| `codex-note` | How do I attach a private note to an account? |
| `codex-remove` | How do I remove a saved account safely? |
| `codex-refresh` | How do I refresh or re-login an account? |

### Diagnostics and backup

| Tool | What it answers |
| --- | --- |
| `codex-health` | Which accounts look healthy, limited, or disabled? |
| `codex-metrics` | What runtime counters and request metrics are visible? |
| `codex-diag` | Can I export a diagnostic snapshot? |
| `codex-diff` | What changed between account/config snapshots? |
| `codex-export` | How do I back up account storage? |
| `codex-import` | How do I restore accounts with a dry-run first? |
| `codex-keychain` | Which credential backend is active and can I migrate it? |

### Reliability behavior

- stateless request handling forces `store: false`
- `reasoning.encrypted_content` is preserved for multi-turn continuity
- account rotation is health-aware and avoids repeatedly selecting cooling accounts
- 5xx bursts, network failures, and quota responses penalize account health
- token refresh is queued to avoid refresh races
- unsupported-model fallback is strict by default, with opt-in fallback controls

---

## Storage Paths

| File | Default path |
| --- | --- |
| OpenCode config | `~/.config/opencode/opencode.json` |
| OpenCode auth tokens | `~/.opencode/auth/openai.json` |
| Plugin config | `~/.opencode/openai-codex-auth-config.json` |
| Global account storage | `~/.opencode/oc-codex-multi-auth-accounts.json` |
| Per-project accounts | `~/.opencode/projects/<project-key>/oc-codex-multi-auth-accounts.json` |
| Flagged accounts | `~/.opencode/oc-codex-multi-auth-flagged-accounts.json` |
| Backups | `~/.opencode/backups/` or `~/.opencode/projects/<project-key>/backups/` |
| Logs | `~/.opencode/logs/codex-plugin/` |

Per-project storage is enabled by default. The plugin walks up from the current directory to find a project root, then stores account pools under the project-specific key. If no project root is found, it falls back to global storage.

---

## Configuration

Primary config files:
- `~/.config/opencode/opencode.json`
- `~/.opencode/openai-codex-auth-config.json`

Selected runtime/environment overrides:

| Variable | Effect |
| --- | --- |
| `CODEX_AUTH_REQUEST_TRANSFORM_MODE=legacy` | Re-enable legacy Codex request rewriting |
| `CODEX_MODE=0/1` | Disable/enable bridge prompt behavior |
| `CODEX_TUI_V2=0/1` | Disable/enable codex-style tool output |
| `CODEX_TUI_COLOR_PROFILE=truecolor|ansi256|ansi16` | Force terminal color profile |
| `CODEX_TUI_GLYPHS=ascii|unicode|auto` | Force terminal glyph style |
| `CODEX_AUTH_PER_PROJECT_ACCOUNTS=0/1` | Disable/enable per-project account pools |
| `CODEX_AUTH_AUTO_UPDATE=0/1` | Disable/enable daily npm update check and cache refresh |
| `CODEX_AUTH_UNSUPPORTED_MODEL_POLICY=strict|fallback` | Control unsupported-model retry behavior |
| `CODEX_AUTH_ACCOUNT_ID=<id>` | Force a specific workspace/account id |
| `CODEX_AUTH_FETCH_TIMEOUT_MS=<ms>` | Request timeout override |
| `CODEX_AUTH_STREAM_STALL_TIMEOUT_MS=<ms>` | SSE stream stall timeout override |
| `ENABLE_PLUGIN_REQUEST_LOGGING=1` | Enable request metadata logs |
| `CODEX_PLUGIN_LOG_BODIES=1` | Include raw request/response bodies in logs; sensitive |
| `CODEX_KEYCHAIN=1` | Opt in to OS-native keychain account storage |

Validate config after changes:

```bash
opencode debug config
opencode run "test" --model=openai/gpt-5.5 --variant=medium
```

Modern OpenCode versions use [config/opencode-modern.json](config/opencode-modern.json). Older versions can use [config/opencode-legacy.json](config/opencode-legacy.json). See [config/README.md](config/README.md) for the full model template matrix.

---

## Credential Storage

<details open>
<summary><b>Default JSON backend</b></summary>

By default, account pools are stored locally as V3 JSON files. File permissions are restricted where the platform supports them.

Use JSON storage when you want predictable, inspectable local files and easy backup/export behavior.

</details>

<details>
<summary><b>Optional OS keychain backend</b></summary>

Set `CODEX_KEYCHAIN=1` to store account pools in the OS keychain instead:

- macOS: Keychain
- Windows: Credential Manager
- Linux: libsecret, with a running secret service such as GNOME Keyring or KWallet

Manage the backend from OpenCode:

```text
codex-keychain status
codex-keychain migrate
codex-keychain rollback
```

If the keychain is unavailable, the plugin logs a warning and falls back to JSON storage for that operation. Credentials are never silently deleted.

</details>

---

## Troubleshooting

<details open>
<summary><b>60-second recovery</b></summary>

```text
codex-doctor --fix
codex-next
codex-status format="json"
```

If still broken:

```bash
opencode auth login
```

</details>

<details>
<summary><b>Common symptoms</b></summary>

- Plugin does not load: rerun `npx -y oc-codex-multi-auth@latest`, then restart OpenCode
- Config looks wrong: run `opencode debug config` and confirm `"plugin": ["oc-codex-multi-auth"]`
- OAuth callback fails: free port `1455`, then rerun `opencode auth login`
- Browser launch is blocked: use the device-code/manual login path from [docs/getting-started.md](docs/getting-started.md#alternate-login-paths)
- Wrong account is selected: run `codex-list`, then `codex-switch`
- Account pool looks unhealthy: run `codex-health format="json"` and `codex-doctor deep=true format="json"`
- Import/export feels risky: run `codex-import path="..." dryRun=true` before applying
- Debugging model fallback: enable `ENABLE_PLUGIN_REQUEST_LOGGING=1` and inspect `~/.opencode/logs/codex-plugin/`

</details>

<details>
<summary><b>Diagnostics pack</b></summary>

```text
codex-status format="json"
codex-limits format="json"
codex-health format="json"
codex-next format="json"
codex-list format="json"
codex-dashboard format="json"
codex-metrics format="json"
codex-doctor deep=true format="json"
```

</details>

---

## Documentation

- Docs portal: [docs/README.md](docs/README.md)
- Documentation map: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
- Getting started: [docs/getting-started.md](docs/getting-started.md)
- Configuration: [docs/configuration.md](docs/configuration.md)
- Config templates: [config/README.md](config/README.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- FAQ: [docs/faq.md](docs/faq.md)
- Privacy: [docs/privacy.md](docs/privacy.md)
- Architecture: [docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)
- Testing: [docs/development/TESTING.md](docs/development/TESTING.md)
- Audit index: [docs/audits/INDEX.md](docs/audits/INDEX.md)

---

## Release Notes

- Current package version: `6.1.7`
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Releases are automated with [release-please](https://github.com/googleapis/release-please)

Merging the release-please PR cuts the tagged release and publishes the package through the configured release workflow. Manual `npm publish` is not required for routine releases.

## License

MIT License. See [LICENSE](LICENSE).

<details>
<summary><b>Legal</b></summary>

- Not affiliated with OpenAI.
- "ChatGPT", "GPT-5", "Codex", and "OpenAI" are trademarks of OpenAI.
- You assume responsibility for your own usage and compliance.

</details>
