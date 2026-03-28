# Awesome Codex Plugins 🧩

> A curated list of awesome OpenAI Codex plugins, skills, and resources.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

OpenAI [launched plugins for Codex](https://openai.com/index/codex-plugins/) on March 26, 2026 — packaging skills, MCP servers, and app integrations into shareable, installable bundles across the Codex app, CLI, and IDE extensions.

## Contents

- [Official Plugins](#official-plugins)
- [Community Plugins](#community-plugins)
- [Plugin Development](#plugin-development)
- [Guides & Articles](#guides--articles)
- [Related Projects](#related-projects)

---

## Official Plugins

Curated by OpenAI and available in the built-in Codex Plugin Directory.

| Plugin | Description | Source |
|--------|-------------|--------|
| [GitHub](https://github.com/openai/codex) | Review changes, manage issues, and interact with repositories | OpenAI |
| [Gmail](https://developers.openai.com/codex/plugins) | Read, search, and compose emails | OpenAI |
| [Google Drive](https://developers.openai.com/codex/plugins) | Edit and manage files in Google Drive | OpenAI |
| [Slack](https://developers.openai.com/codex/plugins) | Send messages, search channels, manage conversations | OpenAI |
| [Notion](https://developers.openai.com/codex/plugins) | Create and edit pages, databases, and content | OpenAI |
| [Figma](https://developers.openai.com/codex/plugins) | Inspect designs, extract specs, and document components | OpenAI |
| [Vercel](https://developers.openai.com/codex/plugins) | Deploy, preview, and manage Vercel projects | OpenAI |
| [Cloudflare](https://developers.openai.com/codex/plugins) | Manage Workers, Pages, DNS, and infrastructure | OpenAI |
| [Box](https://developers.openai.com/codex/plugins) | Access and manage files in Box | OpenAI |
| [Linear](https://developers.openai.com/codex/plugins) | Create and manage issues, projects, and workflows | OpenAI |
| [Sentry](https://developers.openai.com/codex/plugins) | Monitor errors, triage issues, and track performance | OpenAI |
| [Hugging Face](https://developers.openai.com/codex/plugins) | Browse models, datasets, and spaces | OpenAI |

---

## Community Plugins

Third-party plugins built by the community. [PRs welcome](#contributing)!

| Plugin | Description | Author |
|--------|-------------|--------|
| [Registry Broker](https://github.com/hashgraph-online/registry-broker-codex-plugin) | Delegate tasks to specialist AI agents via the HOL Registry Broker — plan delegation, find agents, summon, and recover sessions | [HOL](https://hol.org) |
| [Obsidian Skills](https://github.com/iamseeley/obsidian-codex-skills) | Manage Obsidian vaults — create notes, search, link, and organize | [@iamseeley](https://github.com/iamseeley) |

---

## Plugin Development

### Getting Started

- [Official Docs: Build Plugins](https://developers.openai.com/codex/plugins/build) — Author and package plugins
- [Official Docs: Agent Skills](https://developers.openai.com/codex/skills) — The skill authoring format
- [Plugin Structure](https://developers.openai.com/codex/plugins/build#create-a-plugin-manually) — `.codex-plugin/plugin.json` manifest format

### Plugin Anatomy

```
my-plugin/
├── .codex-plugin/
│   └── plugin.json          # Required: name, version, description, skills path
├── skills/
│   └── my-skill/
│       ├── SKILL.md          # Required: skill instructions + metadata
│       ├── scripts/          # Optional: executable scripts
│       └── references/       # Optional: docs and templates
├── apps/                     # Optional: app integrations
└── mcp.json                  # Optional: MCP server configuration
```

### Plugin Creator

Use the built-in skill to scaffold a new plugin:

```
$plugin-creator
```

### Publishing

Currently no self-serve marketplace submission. Plugins are distributed via:
- **Local marketplaces** — `~/.agents/plugins/marketplace.json`
- **Repo marketplaces** — `$REPO_ROOT/.agents/plugins/marketplace.json`
- **GitHub repos** — install by pointing marketplace source to a repo

OpenAI has stated third-party marketplace submissions are [coming soon](https://community.openai.com/t/how-can-third-party-community-plugins-be-published-to-the-codex-marketplace/1377928).

---

## Guides & Articles

- [Codex Plugins, Visually Explained](https://adithyan.io/blog/codex-plugins-visual-explainer) — @adithyan
- [Codex v0.117.0 Plugin Walkthrough (Reddit)](https://www.reddit.com/r/codex/comments/1s517gl/codex_v01170_now_supports_plugins_heres_a_simple/) — Visual explainer
- [OpenAI's Codex Gets Plugins — The New Stack](https://thenewstack.io/openais-codex-gets-plugins/) — Ecosystem overview
- [Codex Plugins: Slack, Figma, Google Drive — Ars Technica](https://arstechnica.com/ai/2026/03/openai-brings-plugins-to-codex-closing-some-of-the-gap-with-claude-code/) — Feature deep dive

---

## Related Projects

- [awesome-coding-agents](https://github.com/e2b-dev/awesome-ai-agents) — Curated list of AI coding agents
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) — MCP server directory
- [awesome-claude-code](https://github.com/anthropics/awesome-claude-code) — Claude Code resources
- [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) — Cross-agent skill library (Claude, Codex, Cursor, Gemini)
- [agentskills.io](https://agentskills.io) — Open agent skills standard

---

## Contributing

Contributions welcome! Please read the [contribution guidelines](CONTRIBUTING.md) first.

To add a plugin:
1. Fork this repo
2. Add your entry to the appropriate section following the existing format
3. Submit a PR

**Requirements:**
- Plugin must have a public GitHub repository
- Must include `.codex-plugin/plugin.json`
- Must be functional and well-documented

---

## License

[![CC0](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

To the extent possible under law, the authors have waived all copyright and related or neighboring rights to this work.
