# Ejentum

MCP server with reasoning, code, anti-deception, and memory harness tools for Codex.

## What this plugin does

Exposes four MCP tools Codex can call before generating:

- `harness_reasoning` — analytical, diagnostic, planning, multi-step tasks
- `harness_code` — code generation, review, refactoring
- `harness_anti_deception` — honesty-pressured tasks (sycophancy, authority appeals, manufactured urgency)
- `harness_memory` — cross-turn perception sharpening

Each tool returns a structured prompt (named failure pattern, executable procedure, suppression vectors, falsification test) that Codex ingests before its first token. The tool descriptions themselves carry rich routing context so Codex can pick the right harness autonomously.

## Install via the awesome-codex-plugins marketplace

If you have added this repo as a Codex marketplace source:

```bash
codex plugin install ejentum-mcp --source awesome-codex-plugins
```

Codex will prompt for `EJENTUM_API_KEY` on install. Get a key at https://ejentum.com.

## Direct install (no marketplace)

The underlying MCP server is published to npm:

```bash
npx -y ejentum-mcp
```

With `EJENTUM_API_KEY` set in your environment. Same behavior either way.

## Resources

- Source repo: https://github.com/ejentum/ejentum-mcp
- npm package: https://www.npmjs.com/package/ejentum-mcp
- Official MCP Registry listing: `io.github.ejentum/ejentum-mcp`
- License: MIT
