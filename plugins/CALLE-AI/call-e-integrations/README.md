# Calle for Codex

Use Call-E from Codex through the `calle` CLI.

This plugin provides the `$calle` skill for setup checks, authentication
recovery, phone call planning, planned call execution, and call status checks.
It reuses the `@call-e/cli` package so authentication, token caching, JSON
output, and MCP error handling stay owned by the CLI.

## Install

Add the Call-E Codex marketplace from the repository root:

```bash
codex plugin marketplace add CALLE-AI/call-e-integrations \
  --ref '@call-e/codex-plugin@0.1.1' \
  --sparse .agents/plugins \
  --sparse packages/codex-plugin/plugin
```

Open Codex, run `/plugins`, choose the `Call-E` marketplace, and install
`Calle`.

## Authentication

The plugin uses the repository-local CLI when available, then a global `calle`
command when available, then falls back to `npx -y @call-e/cli@0.1.0`.

To authenticate before using the plugin:

```bash
npx -y @call-e/cli@0.1.0 auth login
```

## Safety

Call-E can place real phone calls. The skill plans first, uses returned
credentials exactly as provided, and does not place a call unless the user
clearly intends to do so.
