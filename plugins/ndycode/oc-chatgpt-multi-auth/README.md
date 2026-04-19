# oc-codex-multi-auth

<!--
Badges: CI + OpenSSF Scorecard will turn green once Phase 3 Batch A (CI workflow + Scorecard workflow) lands and runs its first job. Until then they may render as "no status" / 404 — that is expected and self-resolves automatically.
-->
[![npm version](https://img.shields.io/npm/v/oc-codex-multi-auth.svg)](https://www.npmjs.com/package/oc-codex-multi-auth)
[![npm downloads](https://img.shields.io/npm/dw/oc-codex-multi-auth.svg)](https://www.npmjs.com/package/oc-codex-multi-auth)
[![Node.js Version](https://img.shields.io/node/v/oc-codex-multi-auth.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Use your ChatGPT Plus/Pro subscription inside OpenCode with OAuth login, GPT-5/Codex model presets, and multi-account failover.

`oc-codex-multi-auth` is an OpenCode plugin for developers who want Codex-first GPT-5 workflows in OpenCode without switching to separate Platform API credentials for personal use. It uses the same official OAuth flow as the Codex CLI, adds model templates for current GPT-5 families, and can rotate across multiple ChatGPT accounts when one account is rate-limited or unavailable.

## What This Project Does

- Adds an OpenCode plugin that authenticates with ChatGPT Plus/Pro through official OAuth
- Ships ready-to-use model templates for `gpt-5.4`, `gpt-5-codex`, and related GPT-5 families
- Routes requests through a stateless Codex-compatible request pipeline with automatic token refresh
- Supports multi-account rotation, per-project account storage, and guided onboarding commands

## Quick Start

```bash
# 1. Install or refresh the plugin config
npx -y oc-codex-multi-auth@latest

# 2. Sign in with ChatGPT Plus/Pro
opencode auth login

# 3. Run a prompt in OpenCode
opencode run "Explain this repository" --model=openai/gpt-5.4 --variant=medium
```

What the installer does:

- writes `~/.config/opencode/opencode.json`
- backs up an existing config before changing it
- normalizes the plugin entry to `"oc-codex-multi-auth"`
- clears the cached plugin copy so OpenCode reinstalls the latest package

By default, the installer now writes a full catalog config that includes both:
- modern base model entries such as `gpt-5.4` for `--variant` workflows
- explicit preset entries such as `gpt-5.4-high` so the shipped catalog is visible directly in model pickers

## Example Usage

```bash
# General GPT-5 workflow
opencode run "Summarize the failing test and suggest a fix" --model=openai/gpt-5.4 --variant=medium

# Codex-focused workflow
opencode run "Refactor the retry logic and update the tests" --model=openai/gpt-5-codex --variant=high
```

## Usage Notice

> [!CAUTION]
> This project is for personal development use with your own ChatGPT Plus/Pro subscription.
>
> - It is not intended for commercial resale, shared multi-user access, or production services.
> - It uses official OAuth authentication, but it is an independent open-source project and is not affiliated with OpenAI.
> - For production applications, use the [OpenAI Platform API](https://platform.openai.com/).
> - You are responsible for complying with [OpenAI's Terms of Use](https://openai.com/policies/terms-of-use/).

## Why This Exists

OpenCode users often want the same GPT-5 and Codex model experience they use in ChatGPT, but inside a local terminal workflow. This plugin exists to bridge that gap cleanly:

- official OAuth instead of scraped cookies or unofficial auth flows
- OpenCode-ready model definitions instead of hand-rolled config every time
- account rotation and recovery features for people who work across multiple ChatGPT accounts or workspaces

## Features

- Official OAuth login flow compatible with ChatGPT Plus/Pro access
- GPT-5 and Codex model templates for modern and legacy OpenCode versions
- Multi-account rotation with health-aware failover
- Per-project account storage support
- Beginner-focused commands such as `codex-setup`, `codex-help`, `codex-doctor`, and `codex-next`
- Interactive account switching, labeling, tagging, and backup/import commands
- Stateless request handling with `reasoning.encrypted_content` for multi-turn sessions
- Request logging and troubleshooting hooks for debugging OpenCode integration issues

## Common Workflows

- Personal coding sessions in OpenCode using `gpt-5.4` or `gpt-5-codex`
- Switching between personal and workspace-linked ChatGPT accounts
- Keeping separate account pools per project or monorepo
- Recovering from unsupported-model, auth, or rate-limit issues with guided commands

## How It Works

The plugin sits between OpenCode and the ChatGPT-backed Codex workflow:

1. OpenCode loads the plugin and sends model requests through the plugin fetch pipeline.
2. The plugin authenticates with ChatGPT OAuth and refreshes tokens when needed.
3. Requests are normalized for the Codex backend and sent with `store: false`.
4. The plugin chooses the best account/workspace candidate, retries intelligently, and preserves conversation continuity through encrypted reasoning state.

See [Architecture](docs/development/ARCHITECTURE.md) for implementation details.

## Installation

Use the quick-start path above for the fastest setup. For full setup, local development installs, legacy OpenCode support, and verification steps, see [Getting Started](docs/getting-started.md).

If you prefer the compact variant-only config on OpenCode `v1.0.210+`, use:

```bash
npx -y oc-codex-multi-auth@latest --modern
```

## Configuration

Detailed configuration lives outside this README:

- [Getting Started](docs/getting-started.md) for install and first-run setup
- [Configuration Reference](docs/configuration.md) for config keys, env vars, and fallback behavior
- [Config Templates](config/README.md) for modern vs legacy OpenCode examples

## Credential Storage

By default, this plugin stores OAuth refresh tokens as a V3 JSON file under the per-project path determined by `lib/storage/paths.ts`. File permissions are restricted (`0o600` on the file, `0o700` on containing directories) on platforms that honour them.

### Optional: OS-native keychain

Set `CODEX_KEYCHAIN=1` in the environment to store credentials in the OS keychain instead:

- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: libsecret (requires a running secret service such as GNOME Keyring or KWallet)

The opt-in is strict: only the literal value `"1"` enables the keychain backend. Any other value (unset, `"0"`, `"false"`, `""`, `"yes"`, ...) leaves behavior identical to earlier releases. Existing users see zero change by default.

When enabled on an existing install, the plugin auto-migrates the JSON file into the keychain on the next credential write and renames the original as `accounts.json.migrated-to-keychain.<timestamp>` for rollback. The original is never deleted automatically.

Use the `codex-keychain` tool to inspect and manage the backend:

```bash
codex-keychain status     # which backend is active, is the keychain reachable
codex-keychain migrate    # force-migrate on-disk JSON to the keychain now
codex-keychain rollback   # restore the most recent .migrated-to-keychain.<ts> backup
```

### Keychain fallback

If the OS keychain is unavailable (Linux without secret service, permission denied, locked session, missing native module), the plugin logs a clear warning and falls back to the JSON backend for that operation. Credentials are never silently lost.

See [SECURITY.md](SECURITY.md#credential-storage-backends) for the threat model that applies to each backend.

## Troubleshooting

Start here if the plugin does not load or authenticate correctly:

- [Troubleshooting](docs/troubleshooting.md)
- [Privacy & Data Handling](docs/privacy.md)
- [FAQ](docs/faq.md)
- [Security Policy](SECURITY.md)

Common first checks:

- confirm `"plugin": ["oc-codex-multi-auth"]` is present in your OpenCode config

## 6.0.0 Cutover

This release intentionally breaks the old package line and moves the runtime to package-aligned storage names.

- Rename the GitHub repository to `ndycode/oc-codex-multi-auth`
- Publish `oc-codex-multi-auth@6.0.0`
- Deprecate the legacy npm package with a pointer to the new package
- Verify docs, badges, repo links, and OpenCode config examples all resolve to `oc-codex-multi-auth`
- rerun `opencode auth login`
- inspect `~/.opencode/logs/codex-plugin/` after running one request with `ENABLE_PLUGIN_REQUEST_LOGGING=1`

## FAQ

Short answers for the most common questions live in [docs/faq.md](docs/faq.md), including:

- who this plugin is for
- which OpenCode versions it supports
- how the modern and legacy config templates differ
- when to use this plugin versus the OpenAI Platform API

## Contributing

Contributions are welcome if they keep the project accurate, maintainable, and aligned with its personal-use scope.

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

## Releases

Releases are automated via [release-please](https://github.com/googleapis/release-please). Conventional Commits landed on `main` drive version bumps and CHANGELOG entries; merging the open "Release candidate" PR cuts a tagged release. Manual `npm publish` is not required for routine releases.

## License

MIT. See [LICENSE](LICENSE).

ChatGPT, GPT-5, Codex, and OpenAI are trademarks of OpenAI, L.L.C.
