# Calle for Codex

Use Call-E from Codex through the `calle` CLI.

This plugin provides the `$calle` skill for setup checks, authentication
recovery, phone call planning, planned call execution, and call status checks.
It reuses the `@call-e/cli` package so authentication, token caching, JSON
output, and MCP error handling stay owned by the CLI.

## Install

The official marketplace install command requires `codex-cli >= 0.122.0`.
Check your version with `codex --version`; older Codex releases are outside the
primary support path for this command.

Add the Call-E Codex marketplace from the repository root:

```bash
codex plugin marketplace add CALLE-AI/call-e-integrations \
  --ref '@call-e/codex-plugin@0.1.6' \
  --sparse .agents/plugins \
  --sparse packages/codex-plugin/plugin
```

Open Codex, run `/plugins`, choose the `Call-E` marketplace, and install
`Calle`.

If you are pinned to a Codex CLI older than `0.122.0` and cannot use
`codex plugin marketplace add`, upgrade Codex when possible. As a manual
fallback, add the equivalent sparse payload from the same release tag to your
workspace root:

```text
.agents/plugins/marketplace.json
packages/codex-plugin/plugin/
```

Keep those paths exactly as shown so the marketplace entry can resolve
`./packages/codex-plugin/plugin`.

## Authentication

The plugin uses the repository-local CLI when available, then a global `calle`
command when available, then falls back to `npx -y @call-e/cli@0.3.1`.

To authenticate before using the plugin:

```bash
npx -y @call-e/cli@0.3.1 auth login
```

When `$calle` is invoked, the skill checks authorization first. If login is
missing or expired, it runs blocking `calle auth login`, shows the brokered
authorization link, and continues automatically after browser authorization
completes.

## Safety

Call-E can place real phone calls. The skill plans first, uses returned
credentials exactly as provided, and does not place a call unless the user
clearly intends to do so.
