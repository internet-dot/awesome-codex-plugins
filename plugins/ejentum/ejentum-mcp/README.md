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

Codex will prompt for `EJENTUM_API_KEY` on install. The plugin connects to the hosted Ejentum MCP endpoint at `https://api.ejentum.com/mcp` over HTTPS with Bearer auth, so there is no local subprocess to manage. Get a key at https://ejentum.com.

## Stdio alternative (no hosted endpoint)

If you would rather run the MCP server as a local subprocess (no hosted dependency, npm package version pinned in your control), the same four harness tools ship as the `ejentum-mcp` npm package. In your Codex config:

```toml
[mcp_servers.ejentum]
command = "npx"
args = ["-y", "ejentum-mcp"]
env = { EJENTUM_API_KEY = "<your-key>" }
```

Both install paths use the same `EJENTUM_API_KEY` and expose the same four `harness_*` tools. Pick whichever fits your environment.

## Resources

- Source repo: https://github.com/ejentum/ejentum-mcp
- npm package: https://www.npmjs.com/package/ejentum-mcp
- Official MCP Registry listing: `io.github.ejentum/ejentum-mcp`
- License: MIT
