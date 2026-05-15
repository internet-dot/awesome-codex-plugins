<div align="center">

<img src="docs/assets/logo.png" alt="Antigravity Workspace" width="200"/>

# Antigravity

### Cross-IDE repository knowledge engine for grounded codebase Q&A.

`ag-refresh` builds the repository knowledge base. `ag-ask` routes questions to
the right module context with source evidence. Plugins, CLI commands, and MCP are
delivery channels around that core workflow.

Language: **English** | [中文](README_CN.md) | [Español](README_ES.md)

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/study8677/antigravity-workspace-template/test.yml?style=for-the-badge&label=CI)](https://github.com/study8677/antigravity-workspace-template/actions)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Docs-blue?style=for-the-badge&logo=gitbook&logoColor=white)](https://deepwiki.com/study8677/antigravity-workspace-template)
[![NLPM](https://img.shields.io/badge/NLPM-audited-7C3AED?style=for-the-badge)](https://github.com/xiaolai/nlpm-for-claude)

<br/>

<img src="https://img.shields.io/badge/Cursor-✓-000000?style=flat-square" alt="Cursor"/>
<img src="https://img.shields.io/badge/Claude_Code-✓-D97757?style=flat-square" alt="Claude Code"/>
<img src="https://img.shields.io/badge/Windsurf-✓-06B6D4?style=flat-square" alt="Windsurf"/>
<img src="https://img.shields.io/badge/Gemini_CLI-✓-4285F4?style=flat-square" alt="Gemini CLI"/>
<img src="https://img.shields.io/badge/VS_Code_+_Copilot-✓-007ACC?style=flat-square" alt="VS Code"/>
<img src="https://img.shields.io/badge/Codex-✓-412991?style=flat-square" alt="Codex"/>
<img src="https://img.shields.io/badge/Cline-✓-FF6B6B?style=flat-square" alt="Cline"/>
<img src="https://img.shields.io/badge/Aider-✓-8B5CF6?style=flat-square" alt="Aider"/>

</div>

<br/>

<div align="center">
<img src="docs/assets/before_after.png" alt="Before vs After Antigravity" width="800"/>
</div>

<br/>

## Why Antigravity?

> An AI Agent's capability ceiling = **the quality of context it can read.**

The engine is the core: `ag-refresh` deploys a multi-agent cluster that autonomously reads your code — each module gets its own Agent that generates a knowledge doc. `ag-ask` routes questions to the right Agent, grounded in real code with file paths and line numbers.

**Instead of handing Claude Code / Codex a repo-wide `grep` and making it hunt on its own, give it a ChatGPT for your repository.**

**Benchmarked head-to-head against Codex CLI and Claude Code on 36 questions across 3 real-world Python codebases (`fastapi`, `requests`, `sqlmodel`) — Antigravity 99% on factual lookups, 97% on audit/security, 2.1× faster than Codex on factual.** [See eval below.](#head-to-head-eval-antigravity-vs-codex-cli-vs-claude-code-2026-05-09)

```
Traditional approach:              Antigravity approach:
  CLAUDE.md = 5000 lines of docs     Claude Code calls ask_project("how does auth work?")
  Agent reads it all, forgets most   Router → ModuleAgent reads actual source, returns exact answer
  Hallucination rate stays high      Grounded in real code, file paths, and git history
```

| Problem | Without Antigravity | With Antigravity |
|:--------|:-------------------|:-----------------|
| Agent forgets coding style | Repeats the same corrections | Reads `.antigravity/conventions.md` — gets it right the first time |
| Onboarding a new codebase | Agent guesses at architecture | `ag-refresh` → ModuleAgents self-learn each module |
| Switching between IDEs | Different rules everywhere | One `.antigravity/` folder — every IDE reads it |
| Asking "how does X work?" | Agent reads random files | `ask_project` MCP → Router routes to the responsible ModuleAgent |

Architecture is **files + a live Q&A engine**, not plugins. Portable across any IDE, any LLM, zero vendor lock-in.

---

## Slash Commands

Same four slash commands ship to both **Claude Code** and **Codex CLI**. Claude namespaces them as `/antigravity:<name>`; Codex auto-discovers `commands/` and surfaces the bare `/<name>` form. No retraining — same flow on both hosts.

| Claude Code | Codex CLI | Purpose |
|---|---|---|
| `/antigravity:ag-setup` | `/ag-setup` | First-time setup — pick LLM provider, write `.env` |
| `/antigravity:ag-refresh [quick]` | `/ag-refresh [quick]` | Build / incrementally refresh the project knowledge base |
| `/antigravity:ag-ask <question>` | `/ag-ask <question>` | Routed Q&A on the current codebase |
| `/antigravity:ag-init <name>` | `/ag-init <name>` | Scaffold a new multi-agent repo from this template |

A typical first session is **ag-setup → ag-refresh → ag-ask**. Details below.

### `ag-setup` — first-time configuration

Run this **once per project**, right after installing the plugin. Interactive picker for the LLM provider (OpenAI / DeepSeek / Groq / 阿里灵积 / NVIDIA NIM / Ollama local / any OpenAI-compatible endpoint), then writes `.env` to the project root with `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `AG_ASK_TIMEOUT_SECONDS`. Also ensures `.env` is in `.gitignore`. Skip it if you already have a working `.env`.

```
# Claude Code
/antigravity:ag-setup

# Codex CLI
/ag-setup
```

### `ag-refresh` — build / refresh the knowledge base

Deploys the multi-agent cluster to read your code: each module gets its own Agent that produces a knowledge doc under `.antigravity/agents/*.md`, plus a `map.md` routing index. Run after install, after significant code changes, or when `ag-ask` returns stale answers. The first refresh auto-creates `.antigravity/` — no separate init step needed. Pass `quick` for an incremental update, `failed-only` to rerun only previously failed modules.

```
# Claude Code
/antigravity:ag-refresh
/antigravity:ag-refresh quick

# Codex CLI
/ag-refresh
/ag-refresh quick
```

Time: a few minutes for small repos, longer for large ones. Requires `ag-setup` to have completed.

### `ag-ask` — routed Q&A on the codebase

The **main reason this plugin exists**. Routes your question to the right ModuleAgent (and GitAgent / GitNexus when applicable), then returns an answer grounded in actual source with file paths and line numbers. Use it **before** manually grepping or reading files — it's faster and more accurate. Good question shapes: "where is X defined/handled?", "why was Y done this way?", "how does the auth flow work?", "what depends on module Z?".

```
# Claude Code
/antigravity:ag-ask "How does authentication work?"

# Codex CLI
/ag-ask "How does authentication work?"
```

Requires a knowledge base — if you see "no index" or empty answers, run `ag-refresh` first.

### `ag-init` — scaffold a new multi-agent repo

Creates a **new** project from the Antigravity template. Two modes: `quick` (fast scaffold, clean copy) and `full` (adds runtime profile, `.env`, mission file, sandbox config, optional `git init`). This is for **starting a new repo** — you do **not** need it before `ag-refresh` on an existing project.

```
# Claude Code
/antigravity:ag-init my-agent
/antigravity:ag-init my-agent full

# Codex CLI
/ag-init my-agent
/ag-init my-agent full
```

> The plugin also bundles the `agent-repo-init` skill (the same backend that `ag-init` invokes — Codex / Claude can also match it by description) and the optional `ag-mcp` MCP server (`ask_project` + `refresh_project`) for tool-style integration.

---

## Support Matrix

| Layer | Channels | Contract |
|:------|:---------|:---------|
| Native plugins | Claude Code, Codex CLI | Bundled slash commands for `ag-setup`, `ag-refresh`, `ag-ask`, and `ag-init`. |
| Compatible IDEs | Cursor, Windsurf, Gemini CLI, VS Code + Copilot, Cline, Aider | Use shared context files, the `ag`/`ag-*` CLI entrypoints, or an MCP client. |
| Advanced tool integration | `ag-mcp` | Exposes `ask_project` and `refresh_project` for hosts that can call MCP tools. |
| Workspace bootstrapping | `ag-init`, `ag init` | Starts a new repo or injects portable agent context into an existing one. |

The native plugins are the first-class install path today. Other environments are
supported through the same repository knowledge artifacts rather than separate
host-specific plugin packages.

---

## Quick Start

**Option A — Plugin install for Claude Code / Codex CLI**
```bash
# Claude Code (auto-installs the Python engine CLI on first session via SessionStart hook)
/plugin marketplace add study8677/antigravity-workspace-template
/plugin install antigravity@antigravity
/antigravity:ag-setup            # interactive: pick LLM provider, paste API key, writes .env
/antigravity:ag-refresh          # runs ag-refresh directly; first refresh auto-creates .antigravity/
/antigravity:ag-ask "How does this project work?"  # runs ag-ask directly

# Codex CLI (install the engine manually first; Codex hooks are not yet supported)
pipx install "git+https://github.com/study8677/antigravity-workspace-template.git#subdirectory=engine"
codex plugin marketplace add study8677/antigravity-workspace-template
/ag-setup                        # same flow, no antigravity: prefix in Codex
/ag-refresh
/ag-ask "How does this project work?"
```

Codex CLI auto-discovers slash commands from the plugin's `commands/` directory, so the same four commands work without the `antigravity:` namespace prefix (`/ag-setup`, `/ag-refresh`, `/ag-ask`, `/ag-init`). The raw CLI calls (`ag-refresh --workspace .`, `ag-ask "..." --workspace .`) also still work. If your Codex build supports MCP and you want tool-style integration, register `ag-mcp --workspace <project>` separately.

After install + setup you get `ag-ask <question>`, `ag-refresh`, and `ag-init <name>` slash commands in both hosts. MCP remains optional (`ask_project` + `refresh_project`) via `ag-mcp`; see [docs/examples/antigravity.mcp.json](docs/examples/antigravity.mcp.json). See [INSTALL.md](INSTALL.md) for details and troubleshooting.

**Option B — Manual install: engine + CLI via pip**
```bash
# 1. Install engine + CLI
pip install "git+https://github.com/study8677/antigravity-workspace-template.git#subdirectory=cli"
pip install "git+https://github.com/study8677/antigravity-workspace-template.git#subdirectory=engine"

# 2. Configure .env with any OpenAI-compatible API key
cd my-project
cat > .env <<EOF
OPENAI_BASE_URL=https://your-endpoint/v1
OPENAI_API_KEY=your-key
OPENAI_MODEL=your-model
AG_ASK_TIMEOUT_SECONDS=120
EOF

# 3. Build knowledge base (ModuleAgents self-learn each module)
ag-refresh --workspace .

# 4. Ask anything
ag-ask "How does auth work in this project?"

# 5. (Optional) Register as MCP server for Claude Code
claude mcp add antigravity ag-mcp -- --workspace $(pwd)
```

**Option C — Context files only (any IDE, no LLM needed)**
```bash
pip install git+https://github.com/study8677/antigravity-workspace-template.git#subdirectory=cli
ag init my-project && cd my-project
# IDE entry files bootstrap into AGENTS.md; dynamic knowledge is in .antigravity/
```

---

## Features at a Glance

```
  ag init             Inject context files into any project (--force to overwrite)
       │
       ▼
  .antigravity/       Shared knowledge base — every IDE reads from here
       │
       ├──► ag-refresh     Dynamic multi-agent self-learning → module knowledge docs + structure map
       ├──► ag-ask         Router → ModuleAgent Q&A with live code evidence
       └──► ag-mcp         Optional MCP server → IDE tool integration
```

**Dynamic Multi-Agent Cluster** — During `ag-refresh`, the engine uses **smart functional grouping**: files are grouped by import relationships, directory co-location, and filename prefixes. Source code is pre-loaded directly into agent context (no tool calls needed), and build artifacts are automatically filtered out. Each sub-agent analyzes ~30K tokens of focused, functionally related code in a single LLM call and outputs a **comprehensive Markdown knowledge document** (`agents/*.md`). For large modules, multiple sub-agents run in parallel — each produces its own agent.md (no merging, no information loss). A **Map Agent** reads all agent docs and generates `map.md` — a routing index. During `ag-ask`, Router reads `map.md` to select relevant modules, then feeds their agent docs to answer agents. For structural questions (call chains, dependencies, impact analysis), the Router automatically queries [GitNexus](https://github.com/abhigyanpatwari/GitNexus) code graph for precise relationships. **Fully language-agnostic** — module detection uses pure directory structure, code analysis is done entirely by LLMs. Works with any programming language.

**GitAgent** — A dedicated agent for analyzing git history — understands who changed what and why.

**GitNexus Graph Enrichment (optional)** — Install [GitNexus](https://github.com/abhigyanpatwari/GitNexus) to auto-unlock graph-enriched answers. The Router LLM decides when a question needs structural analysis (call chains, dependencies, impact) and queries GitNexus automatically — combining precise graph data with semantic understanding from agent docs.

**NLPM Audit Feedback** — This repository has benefited from [NLPM](https://github.com/xiaolai/nlpm-for-claude), a natural-language programming linter for Claude Code plugins, skills, and agent definitions by [xiaolai](https://github.com/xiaolai). Its audit helped identify useful improvements in skill frontmatter and dependency hygiene.

---

## CLI Commands

| Command | What it does | LLM needed? |
|:--------|:-------------|:-----------:|
| `ag init <dir>` | Inject cognitive architecture templates | No |
| `ag init <dir> --force` | Re-inject, overwriting existing files | No |
| `ag refresh --workspace <dir>` | CLI convenience wrapper around the knowledge-hub refresh pipeline | Yes |
| `ag ask "question" --workspace <dir>` | CLI convenience wrapper around the routed project Q&A flow | Yes |
| `ag-refresh` | Multi-agent self-learning of codebase, generates module knowledge docs + `conventions.md` + `structure.md` | Yes |
| `ag-ask "question"` | Router → ModuleAgent/GitAgent routed Q&A | Yes |
| `ag-mcp --workspace <dir>` | **Start MCP server** — exposes `ask_project` + `refresh_project` to Claude Code | Yes |
| `ag report "message"` | Log a finding to `.antigravity/memory/` | No |
| `ag log-decision "what" "why"` | Log an architectural decision | No |

`ag ask` / `ag refresh` are available when both `cli/` and `engine/` are installed. `ag-ask` / `ag-refresh` are the engine-only entrypoints.

---

## Two Packages, One Workflow

```
antigravity-workspace-template/
├── cli/                     # ag CLI — lightweight, pip-installable
│   └── templates/           # .cursorrules, CLAUDE.md, .antigravity/, ...
└── engine/                  # Multi-agent engine + Knowledge Hub
    └── antigravity_engine/
        ├── _cli_entry.py    # ag-ask / ag-refresh / ag-mcp + python -m dispatch
        ├── config.py        # Pydantic configuration
        ├── hub/             # ★ Core: multi-agent cluster
        │   ├── agents.py    #   Router + ModuleAgent + GitAgent
        │   ├── contracts.py #   Pydantic models: claims, evidence, refresh status
        │   ├── ask_pipeline.py    # agent.md + graph-enriched ask
        │   ├── refresh_pipeline.py # LLM-driven refresh → agents/*.md + map.md
        │   ├── ask_tools.py
        │   ├── scanner.py   #   multi-language project scanning
        │   ├── module_grouping.py # smart functional file grouping
        │   ├── structure.py
        │   ├── knowledge_graph.py
        │   ├── retrieval_graph.py
        │   └── mcp_server.py
        ├── mcp_client.py    # MCP consumer (connects external tools)
        ├── memory.py        # Persistent interaction memory
        ├── tools/           # MCP query tools + extensions
        ├── skills/          # Skill loader
        └── sandbox/         # Code execution (local / microsandbox)
```

**CLI** (`pip install .../cli`) — Zero LLM deps. Injects templates, logs reports & decisions offline.

**Engine** (`pip install .../engine`) — Multi-agent runtime. Powers `ag-ask`, `ag-refresh`, `ag-mcp`. Supports Gemini, OpenAI, Ollama, or any OpenAI-compatible API.

**New skill packaging updates:**
- `engine/antigravity_engine/skills/graph-retrieval/` — graph-oriented retrieval tools for structure and call-path reasoning.
- `engine/antigravity_engine/skills/knowledge-layer/` — project knowledge-layer tools for semantic context consolidation.

```bash
# Install both for full experience
pip install "git+https://...#subdirectory=cli"
pip install "git+https://...#subdirectory=engine"
```

For local work on this repository itself:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -e ./cli -e './engine[dev]'
pytest engine/tests cli/tests
```

---

## How It Works

### 1. `ag init` — Inject context files

```bash
ag init my-project
# Already initialized? Use --force to overwrite:
ag init my-project --force
```

Creates `AGENTS.md` (authoritative behavior rules), IDE bootstrap files (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`), and `.antigravity/` dynamic context files.

### 2. `ag-refresh` — Multi-agent self-learning

```bash
ag-refresh --workspace my-project
```

**9-step pipeline:**
1. Scan codebase (languages, frameworks, structure)
2. Multi-agent pipeline generates `conventions.md`
3. Generate `structure.md` — language-agnostic file tree with line counts
4. Build knowledge graph (`knowledge_graph.json` + mermaid)
5. Write document/data/media indexes
6. **LLM full-context analysis** — group files by import graph + directory + prefix, pre-load into context (~30K tokens per sub-agent), filter out build artifacts. Each sub-agent reads the full source code and outputs a **comprehensive Markdown knowledge document** (`agents/*.md`). Large modules get multiple agent docs (one per group, no merging). Global API concurrency control prevents rate-limiting. **Fully language-agnostic** — works with any programming language.
7. **RefreshGitAgent** analyzes git history, generates `_git_insights.md`
8. **Map Agent** reads all agent docs → generates `map.md` (module routing index with descriptions and key topics)
9. **GitNexus indexing** (optional) — runs `gitnexus analyze` to build a Tree-sitter code graph (16 languages, call chains, dependencies). Auto-skipped if GitNexus is not installed.

### 3. `ag-ask` — Router-based Q&A

```bash
ag-ask "How does auth work in this project?"
```

The ask pipeline uses a **dual-path architecture**:
- **Semantic path**: Router reads `map.md` → selects modules → reads `agents/*.md` → LLM answers with code references. Multiple agent docs are read in parallel, then a Synthesizer combines answers.
- **Graph path** (automatic): Router LLM decides if the question needs structural analysis → queries GitNexus for call chains, dependencies, or impact → injects graph data into the answer context. Silently skipped if GitNexus is not installed.

Falls back to the legacy Router → ModuleAgent/GitAgent swarm when agent docs are not yet generated.

---

## IDE Compatibility

Architecture is encoded in **files** — any agent that reads project files benefits:

| IDE | Config File |
|:----|:------------|
| Cursor | `.cursorrules` |
| Claude Code | `CLAUDE.md` |
| Windsurf | `.windsurfrules` |
| VS Code + Copilot | `.github/copilot-instructions.md` |
| Gemini CLI / Codex | `AGENTS.md` |
| Cline | `.clinerules` |
| Google Antigravity | `.antigravity/rules.md` |

All are generated by `ag init`: `AGENTS.md` is the single behavioral rulebook, IDE-specific files are thin bootstraps, and `.antigravity/` stores shared dynamic project context.

---

## Advanced Features

<details>
<summary><b>MCP Server — Give Claude Code a ChatGPT for your codebase</b></summary>

Instead of reading hundreds of documentation files, Claude Code can call `ask_project` as a live tool — backed by a dynamic multi-agent cluster: Router routes questions to the right ModuleAgent, returning grounded answers with file paths and line numbers.

**Setup:**

```bash
# Install engine
pip install "git+https://github.com/study8677/antigravity-workspace-template.git#subdirectory=engine"

# Refresh knowledge base first (ModuleAgents self-learn each module)
ag-refresh --workspace /path/to/project

# Register as MCP server in Claude Code
claude mcp add antigravity ag-mcp -- --workspace /path/to/project
```

**Tools exposed to Claude Code:**

| Tool | What it does |
|:-----|:-------------|
| `ask_project(question)` | Router → ModuleAgent/GitAgent answers codebase questions. Returns file paths + line numbers. |
| `refresh_project(quick?)` | Rebuild knowledge base after significant changes. ModuleAgents re-learn the code. |

</details>

<details>
<summary><b>Dynamic Multi-Agent Cluster</b> — Module-level self-learning + intelligent routing</summary>

The engine's core is **a dynamically created Agent cluster per code module**:

```
 ag-refresh:                                 ag-ask:

 For each module:                            Router (reads map.md)
 ┌ Group files by import graph                 ├── GRAPH: no → read agents/*.md → LLM answer
 ├ Pre-load ~30K tokens per sub-agent          └── GRAPH: yes → query GitNexus graph
 ├ Filter out build artifacts                        → graph data + agents/*.md → LLM answer
 ├ Sub-agents → Markdown agent docs
 ├ agents/{module}.md (or /group_N.md)
 ├ Map Agent → map.md
 └ GitNexus analyze (optional)
```

**Key innovations:**
- **LLM as analyzer**: No AST parsing or regex — source code is fed directly to LLMs for analysis. Works with any programming language out of the box.
- **Smart grouping**: Files grouped by import relationships, directory co-location, and filename prefixes. Build artifacts automatically filtered out. Hard character limit (800K) prevents context overflow.
- **No information loss**: Large modules produce multiple `agent.md` files (one per group) — no merging or compression. During `ag-ask`, multiple agent docs are read by parallel LLM calls, then a Synthesizer combines answers.
- **Graph-enriched answers**: Router LLM automatically decides when a question needs structural data (call chains, dependencies, impact) and queries GitNexus. Combines precise graph relationships with semantic understanding.
- **Global API concurrency control**: `AG_API_CONCURRENCY` limits total simultaneous LLM calls across all modules, preventing rate-limiting.
- **Language-agnostic module detection**: Pure directory structure — no `__init__.py` or any language-specific marker required.

```bash
# ModuleAgents self-learn your codebase
ag-refresh

# Only scan files changed since last refresh
ag-refresh --quick

# Router intelligently routes to the right ModuleAgent
ag-ask "What testing patterns does this project use?"

# Log findings and decisions (no LLM needed)
ag report "Auth module needs refactoring"
ag log-decision "Use PostgreSQL" "Team has deep expertise"
```

Works with Gemini, OpenAI, Ollama, or any OpenAI-compatible endpoint. Powered by OpenAI Agent SDK + LiteLLM.
</details>

<details>
<summary><b>MCP Integration (Consumer)</b> — Let agents call external tools</summary>

`MCPClientManager` lets your agents connect to external MCP servers (GitHub, databases, etc.), auto-discovering and registering tools.

```json
// mcp_servers.json
{
  "servers": [
    {
      "name": "github",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "enabled": true
    }
  ]
}
```

Set `MCP_ENABLED=true` in `.env`.
</details>

<details>
<summary><b>GitNexus Graph Enrichment</b> — Automatic structural intelligence for ask queries</summary>

[GitNexus](https://github.com/abhigyanpatwari/GitNexus) builds a code knowledge graph using **Tree-sitter AST parsing** (16 languages). When installed, Antigravity integrates it at two levels:

**1. Refresh-time indexing** — `ag-refresh` automatically runs `gitnexus analyze` (Step 9) to build/update the code graph. Skipped silently if GitNexus is not installed.

**2. Ask-time graph enrichment** — The Router LLM decides whether a question needs structural analysis:
- "What does the auth module do?" → `GRAPH: no` → pure agent.md answer
- "Who calls handleLogin?" → `GRAPH: yes` → queries GitNexus → graph data + agent.md → enriched answer

```
User: "What functions call the send method in gateway?"

Router: MODULES: gateway, tests_gateway | GRAPH: yes
  → GitNexus query returns call chains with confidence scores
  → Agent docs provide semantic context (what each caller does)
  → Combined answer: precise call chain + file paths + line numbers + purpose
```

| Capability | What it provides |
|:-----------|:-----------------|
| `gitnexus_query` | Hybrid search (BM25 + semantic) — execution flows, not just files |
| `gitnexus_context` | 360-degree symbol view: callers, callees, references, definition |
| `gitnexus_impact` | Blast radius analysis — what breaks if you change a symbol? |

> **Note:** GitNexus is NOT bundled with Antigravity. It requires separate installation via npm (`npm install -g gitnexus`). Antigravity works fully without it — when not installed, all graph features are silently skipped with zero overhead.

**How to enable:**

```bash
# 1. Install GitNexus (requires Node.js)
npm install -g gitnexus

# 2. Refresh (auto-indexes the code graph)
ag-refresh --workspace my-project

# 3. Ask — graph enrichment is automatic
ag-ask "Who calls the send method in gateway adapters?"
# Router decides: GRAPH: yes → queries GitNexus → enriched answer
```

</details>


<details>
<summary><b>Sandbox</b> — Configurable code execution environment</summary>

| Variable | Default | Options |
|:---------|:--------|:--------|
| `SANDBOX_TYPE` | `local` | `local` · `microsandbox` |
| `SANDBOX_TIMEOUT_SEC` | `30` | seconds |

See [Sandbox docs](docs/en/SANDBOX.md).
</details>

---

## Head-to-Head Eval: Antigravity vs Codex CLI vs Claude Code (2026-05-09)

Asymmetric benchmark on three real-world Python codebases — `fastapi/fastapi`,
`psf/requests`, `fastapi/sqlmodel` — asking each tool **the same 36 questions**
across three difficulty bands. All three tools used `gpt-5.5` with high
reasoning effort; Codex and Claude had full read access to the workspace.
Codex was the grader (4-axis 0–3 rubric, scores verified against actual source).

| Question type | Antigravity | Codex CLI | Claude Code |
|:---|:---:|:---:|:---:|
| 15 factual lookups | **179/180 (99%)** | 179/180 (99%) | 178/180 (99%) |
| 12 synthesis (project / arch tour) | 116/144 (81%) | **144/144 (100%)** | 136/144 (94%) |
| 9 audit / security | **105/108 (97%)** | 104/108 (96%) | 98/108 (91%) |

**Combined factual + audit (24 cells): Antigravity 284/288, Codex 283/288,
Claude 276/288.** Antigravity edges out both — at lower latency than Codex on
every single question.

**Latency** (mean wall-clock per question, same proxy):

| Question type | Antigravity | Codex | Claude |
|:---|:---:|:---:|:---:|
| Factual | **56s** | 119s | 42s |
| Audit | 160s | 177s | **100s** |

Antigravity is **2.1× faster than Codex on factual** and on par with Codex on
audit, while matching or beating it on correctness. Claude is fastest on
audit but loses 7 percentage points of correctness.

**What changed in this repo to get there.** Two engine fixes landed during the
benchmark, both committed in this branch:

1. `_ask_with_agent_md` now surfaces project-level docs (`conventions.md`,
   `module_registry.md`, `map.md`, `structure.md`) into its answer prompts.
   Removes the “module knowledge does not include project-wide conventions”
   refusal pattern.
2. The structured-facts answer agents now have `search_code`, `read_file`,
   `list_directory`, `read_file_metadata`, `search_by_type` bound at runtime,
   so the LLM can grep and read actual source instead of paraphrasing the KG.

Full report (data, methodology, per-cell tables, caveats):
[`artifacts/benchmark-2026-05-09/REPORT.md`](artifacts/benchmark-2026-05-09/REPORT.md).

---

## Documentation

| | |
|:--|:--|
| 🇬🇧 English | **[`docs/en/`](docs/en/)** |
| 🇨🇳 中文 | **[`docs/zh/`](docs/zh/)** |
| 🇪🇸 Español | **[`docs/es/`](docs/es/)** |

---

## Contributing

Ideas are contributions too! Open an [issue](https://github.com/study8677/antigravity-workspace-template/issues) to report bugs, suggest features, or propose architecture.

## Contributors

<table>
  <tr>
    <td align="center" width="20%">
      <a href="https://github.com/Lling0000">
        <img src="https://github.com/Lling0000.png" width="80" /><br/>
        <b>⭐ Lling0000</b>
      </a><br/>
      <sub><b>Major Contributor</b> · Creative suggestions · Project administrator · Project ideation & feedback</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/devalexanderdaza">
        <img src="https://github.com/devalexanderdaza.png" width="80" /><br/>
        <b>Alexander Daza</b>
      </a><br/>
      <sub>Sandbox MVP · OpenSpec workflows · Technical analysis docs · PHILOSOPHY</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/chenyi">
        <img src="https://github.com/chenyi.png" width="80" /><br/>
        <b>Chen Yi</b>
      </a><br/>
      <sub>First CLI prototype · 753-line refactor · DummyClient extraction · Quick-start docs</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/Subham-KRLX">
        <img src="https://github.com/Subham-KRLX.png" width="80" /><br/>
        <b>Subham Sangwan</b>
      </a><br/>
      <sub>Dynamic tool & context loading (#4) · Multi-agent swarm protocol (#3)</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/shuofengzhang">
        <img src="https://github.com/shuofengzhang.png" width="80" /><br/>
        <b>shuofengzhang</b>
      </a><br/>
      <sub>Memory context window fix · MCP shutdown graceful handling (#28)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="20%">
      <a href="https://github.com/goodmorning10">
        <img src="https://github.com/goodmorning10.png" width="80" /><br/>
        <b>goodmorning10</b>
      </a><br/>
      <sub>Enhanced <code>ag ask</code> context loading — added CONTEXT.md, AGENTS.md, and memory/*.md as context sources (#29)</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/abhigyanpatwari">
        <img src="https://github.com/abhigyanpatwari.png" width="80" /><br/>
        <b>Abhigyan Patwari</b>
      </a><br/>
      <sub><a href="https://github.com/abhigyanpatwari/GitNexus">GitNexus</a> — code knowledge graph natively integrated into <code>ag ask</code> for symbol search, call graphs, and impact analysis</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/BBear0115">
        <img src="https://github.com/BBear0115.png" width="80" /><br/>
        <b>BBear0115</b>
      </a><br/>
      <sub>Skill packaging & KG retrieval enhancements · Multi-language README sync (#30)</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/SunkenCost">
        <img src="https://github.com/SunkenCost.png" width="80" /><br/>
        <b>SunkenCost</b>
      </a><br/>
      <sub><code>ag clean</code> command · <code>__main__</code> entry-point guard (#37)</sub>
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/aravindhbalaji04">
        <img src="https://github.com/aravindhbalaji04.png" width="80" /><br/>
        <b>Aravindh Balaji</b>
      </a><br/>
      <sub>Unified instruction surface around <code>AGENTS.md</code> (#41)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="20%">
      <a href="https://github.com/xiaolai">
        <img src="https://github.com/xiaolai.png" width="80" /><br/>
        <b>xiaolai</b>
      </a><br/>
      <sub><a href="https://github.com/xiaolai/nlpm-for-claude">NLPM</a> audit feedback · Skill frontmatter fixes · Dependency hygiene review (#51, #52, #53)</sub>
    </td>
  </tr>
</table>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=study8677/antigravity-workspace-template&type=Date)](https://star-history.com/#study8677/antigravity-workspace-template&Date)

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**[📚 Full Documentation →](docs/en/)**

*Built for the AI-native development era*

Friendly Link: [LINUX DO](https://linux.do/)

</div>
