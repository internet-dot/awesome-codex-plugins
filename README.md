<p align="center">
  <br>
  <img width="80" src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome">
  <br>
</p>

<h1 align="center">Awesome Codex Plugins</h1>

<p align="center">A curated list of awesome OpenAI Codex plugins, skills, and resources.</p>

<p align="center">
  <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

<p align="center">
  OpenAI <a href="https://openai.com/index/codex-plugins/">launched plugins for Codex</a> on March 26, 2026, packaging skills, MCP servers, and app integrations into shareable, installable bundles across the Codex app, CLI, and IDE extensions.
</p>

<br>

## Contents

- [Official Plugins](#official-plugins)
- [Community Plugins](#community-plugins)
- [Plugin Development](#plugin-development)
- [Guides & Articles](#guides--articles)
- [Related Projects](#related-projects)

---

## Official Plugins

Curated by OpenAI and available in the built-in Codex Plugin Directory.

Official plugins available in the [built-in Codex Plugin Directory](https://developers.openai.com/codex/plugins):

- Box - Access and manage files.
- Cloudflare - Manage Workers, Pages, DNS, and infrastructure.
- Figma - Inspect designs, extract specs, and document components.
- GitHub - Review changes, manage issues, and interact with repositories.
- Gmail - Read, search, and compose emails.
- Google Drive - Edit and manage files in Google Drive.
- Hugging Face - Browse models, datasets, and spaces.
- Linear - Create and manage issues, projects, and workflows.
- Notion - Create and edit pages, databases, and content.
- Sentry - Monitor errors, triage issues, and track performance.
- Slack - Send messages, search channels, manage conversations.
- Vercel - Deploy, preview, and manage Vercel projects.

## Community Plugins

Third-party plugins built by the community. [PRs welcome](#contributing)!

- [Registry Broker](https://github.com/hashgraph-online/registry-broker-codex-plugin) - Delegate tasks to specialist AI agents via the HOL Registry, plan, find, summon, and recover sessions.
- [Obsidian Skills](https://github.com/kepano/obsidian-skills) - Agent skills for Obsidian, Markdown, Bases, JSON Canvas, and CLI.
- [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) - Office Compound Engineering plugin for Claude Code, Codex, and more.

## Plugin Development

### Getting Started

- [Official Docs: Build Plugins](https://developers.openai.com/codex/plugins/build) - Author and package plugins.
- [Official Docs: Agent Skills](https://developers.openai.com/codex/skills) - The skill authoring format.
- [Plugin Structure](https://developers.openai.com/codex/plugins/build#create-a-plugin-manually) - `.codex-plugin/plugin.json` manifest format.

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

Currently no self-serve marketplace submission. Plugins are distributed via local marketplaces (`~/.agents/plugins/marketplace.json`), repo marketplaces (`$REPO_ROOT/.agents/plugins/marketplace.json`), or GitHub repos by pointing a marketplace source at a repo. OpenAI has stated third-party marketplace submissions are [coming soon](https://community.openai.com/t/how-can-third-party-community-plugins-be-published-to-the-codex-marketplace/1377928).

## Guides & Articles

- [Codex Plugins, Visually Explained](https://adithyan.io/blog/codex-plugins-visual-explainer) - Visual walkthrough by @adithyan.
- [Codex v0.117.0 Plugin Walkthrough](https://www.reddit.com/r/codex/comments/1s517gl/codex_v01170_now_supports_plugins_heres_a_simple/) - Reddit explainer.
- [OpenAI's Codex Gets Plugins](https://thenewstack.io/openais-codex-gets-plugins/) - The New Stack ecosystem overview.
- [Codex Plugins: Slack, Figma, Google Drive](https://arstechnica.com/ai/2026/03/openai-brings-plugins-to-codex-closing-some-of-the-gap-with-claude-code/) - Ars Technica feature deep dive.

## Related Projects

- [awesome-coding-agents](https://github.com/e2b-dev/awesome-ai-agents#readme) - Curated list of AI coding agents.
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers#readme) - MCP server directory.
- [awesome-claude-code](https://github.com/anthropics/awesome-claude-code#readme) - Claude Code resources.
- [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills#readme) - Cross-agent skill library (Claude, Codex, Cursor, Gemini).
- [agentskills.io](https://agentskills.io) - Open agent skills standard.

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

## License

[![Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Licensed under the [Apache License, Version 2.0](LICENSE).
