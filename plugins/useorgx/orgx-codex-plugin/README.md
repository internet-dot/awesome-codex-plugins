# OrgX Codex Plugin

Codex plugin package for OrgX:

- OrgX MCP server wiring via `https://mcp.useorgx.com/`
- Initiative-aware Codex skills for OrgX execution
- Runtime reporting guidance and passive hook templates for progress, artifacts,
  blockers, and completion
- Install-surface metadata for Codex plugin directories and local marketplaces

## Why this plugin exists

This repo packages the OrgX setup that Codex needs into the structure described
in the official Codex plugins docs:

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/**/SKILL.md`
- `assets/`

It is the Codex counterpart to the existing OrgX Claude Code and OpenClaw
plugin repos.

## Structure

```text
.codex-plugin/plugin.json   # Codex plugin manifest
.mcp.json                   # OrgX MCP configuration
skills/orgx-initiative-ops/SKILL.md
skills/orgx-runtime-reporting/SKILL.md
hooks/codex/hooks.json
hooks/scripts/orgx-session-hook.mjs
assets/icon.png
assets/logo.png
scripts/verify-plugin.mjs
```

## Included skills

### `orgx-initiative-ops`

Use OrgX MCP as the source of truth when a task is scoped to an OrgX initiative,
workstream, milestone, task, blocker, or decision.

### `orgx-runtime-reporting`

Keep OrgX updated during live Codex execution with progress, artifacts,
blockers, and completion events.

## Runtime hooks

The plugin now includes Codex hook templates, but the recommended install path is
through `orgx-wizard hooks install`. The wizard can merge global hook config,
preserve existing `notify` integrations such as Computer Use, and write a local
outbox under `~/.config/useorgx/wizard/hooks/events.jsonl`.

Hook events are a passive backstop. They record compact session metadata and
safe summaries so a later Work Graph reconciliation can answer:

- Did the session call OrgX MCP?
- Did meaningful work happen without OrgX writeback?
- Are there decisions, blockers, artifacts, people, product surfaces, or goals
  that should become an OrgX initiative kickoff?

Each reconciliation report should also emit a stable `work_graph_fingerprint`
and `signup_hydration.hydration_key`. That fingerprint is the bridge between a
pre-signup audit/share surface and the user's future OrgX workspace: after
signup, OrgX can claim the fingerprint, dedupe replays, and attach the redacted
Work Graph to a kickoff initiative.

Raw transcripts are not sent by the hook template. The reconciler should keep
transcripts local and write only redacted summaries, hashes, evidence refs,
Work Graph fingerprints, and approved OrgX activity.

## Local verification

```bash
npm run check
```

To preview the runtime wiring without editing Codex config:

```bash
orgx-wizard hooks doctor
```

To install the passive Codex/Claude Code hook backstop:

```bash
orgx-wizard hooks install --targets all
```

## Install locally in Codex

### Repo-local marketplace

This repo now includes a marketplace file at
`.agents/plugins/marketplace.json` that points directly at the plugin repo
root. To test it in Codex:

1. Open `/Users/hopeatina/Code/orgx-codex-plugin` in Codex.
2. Restart Codex.
3. Open `/plugins` and select the repo marketplace `orgx-local`.

This is the fastest way to verify the plugin during development because it
avoids copying the plugin into a separate plugins directory.

The official docs recommend using the built-in `@plugin-creator` skill to
scaffold local plugins and marketplace entries. That skill was not available in
the environment used to create this repo, so this plugin was scaffolded
manually against the current published Codex plugin spec.

### Personal marketplace

1. Copy the plugin to your personal Codex plugins directory:

```bash
mkdir -p ~/.codex/plugins
cp -R /absolute/path/to/orgx-codex-plugin ~/.codex/plugins/orgx-codex-plugin
```

2. Add or update `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "useorgx-local",
  "interface": {
    "displayName": "OrgX Local"
  },
  "plugins": [
    {
      "name": "orgx-codex-plugin",
      "source": {
        "source": "local",
        "path": "./.codex/plugins/orgx-codex-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

3. Restart Codex and open `/plugins`.

Because `~/.agents/plugins/marketplace.json` is resolved relative to your home
directory, the plugin entry must point at `./.codex/plugins/...` if the plugin
was copied under `~/.codex/plugins/`.

## MCP server behavior

The bundled `.mcp.json` config uses the hosted OrgX root URL:

```json
{
  "mcpServers": {
    "orgx": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.useorgx.com/"]
    }
  }
}
```

This follows current OrgX MCP docs, which recommend the hosted root URL for
external clients and let OAuth happen in-browser on first use.

## Sources used

- Official Codex plugin docs:
  `https://developers.openai.com/codex/plugins`
- OrgX MCP docs:
  `https://docs.useorgx.com/docs/api/overview`
- Existing OrgX references:
  - `orgx-claude-code-plugin`
  - `orgx-openclaw-plugin`
