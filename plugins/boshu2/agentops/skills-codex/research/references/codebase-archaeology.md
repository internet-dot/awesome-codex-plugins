
<!-- TOC: Problem | THE EXACT PROMPT | Documentation First | Quick Start | The Layers | Agent-Assisted | Critical Searches | Output Template | Anti-Patterns | Checklist | References -->

# Codebase Archaeology

> **Core Insight:** Don't read randomly. Documentation first, then follow data flow from entry points outward.

## The Problem

You land in an unfamiliar codebase. Where do you start? Random file reading wastes context. You need a systematic approach that builds understanding efficiently and produces a reusable "mental model" of the architecture.

---

## THE EXACT PROMPT

### For Deep Investigation (Spawning Explore Agent)

```
Thoroughly explore this codebase. I need to understand:

1. Overall architecture and module structure
2. How data flows through the system (input → processing → output)
3. Key data structures (the 3-5 types everything revolves around)
4. The integration points (external APIs, databases, file I/O)
5. Configuration system (env vars, config files, CLI flags)
6. Test infrastructure

Focus on src/ directory structure and main modules. Map out how the pieces fit together.
Be very thorough - I need a complete mental model of how this codebase works.
```

### For Self-Directed Exploration

```
I want you to sort of randomly explore the code files in this project, choosing
code files to deeply investigate and trace their functionality through related
files. Build a comprehensive mental model of the architecture.
```

---

## Documentation First (Critical!)

**Before touching code, ALWAYS read:**

```bash
cat AGENTS.md     # Project-specific rules and architecture notes
cat README.md     # Purpose, installation, usage
```

**Why this matters:**
- AGENTS.md often contains architecture diagrams, key decisions, gotchas
- README.md reveals the project's purpose and main workflows
- Skipping this wastes time rediscovering documented knowledge

---

## Quick Start

```bash
# Phase 1: Orientation (2 min)
cat AGENTS.md README.md | head -200    # DOCUMENTATION FIRST!
ls -la src/ lib/ cmd/ pkg/             # Directory structure
cat Cargo.toml package.json pyproject.toml  # Dependencies

# Phase 2: Entry Points (5 min)
rg "fn main|async fn main" --type rust   # Rust entry
rg "clap|structopt|argparse|commander" . # CLI frameworks
rg "Router|routes|@app\." .              # HTTP routers

# Phase 3: Core Types (5 min)
rg "^(pub )?struct |^class |^interface " --type rust --type ts --type py
rg "impl .* for" --type rust             # Trait implementations

# Phase 4: Data Flow (10 min)
# Trace from entry → handler → service → storage
```

---

## The Layers

```
┌─────────────────────────────────────┐
│ ENTRY POINTS (start here)           │
│ main(), CLI commands, HTTP routes   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ HANDLERS / CONTROLLERS              │
│ Request parsing, orchestration      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ CORE DOMAIN                         │
│ Business logic, key types           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ STORAGE / INTEGRATION               │
│ Database, files, external APIs      │
└─────────────────────────────────────┘
```

---

## Agent-Assisted Exploration

For large codebases, spawn an Explore agent:

```
spawn_agent(agent_type="explorer")
Prompt: "Analyze the [project] codebase to provide a deep technical understanding.
Focus on:
1. Architecture Overview — how components interact
2. Key Data Structures — core types and their relationships
3. Data Flow — trace from ingestion to storage to output
4. Integration Points — external dependencies, APIs, databases"
```

**Why agents help:**
- They can read many files without filling your context
- They return a synthesized summary, not raw data
- You get architecture insights without the noise

---

## Language-Specific Entry Points

| Language | Entry Point | CLI Framework | HTTP Router |
|----------|-------------|---------------|-------------|
| Rust | `fn main()` in main.rs | clap, structopt | axum, actix |
| TypeScript | index.ts, main.ts | commander, yargs | express, fastify |
| Python | `__main__.py`, main.py | argparse, click, typer | flask, fastapi |
| Go | main.go in cmd/ | cobra, flag | chi, gin, echo |

---

## Critical Searches

```bash
# Find entry points
rg "fn main|def main|function main|export default" .

# Find configuration
rg "env\.|process\.env|os\.environ|std::env" .
rg "config|settings|options" --type-add 'cfg:*.{toml,yaml,json}' -t cfg

# Find key types (the 3-5 everything revolves around)
rg "^(pub )?(struct|class|interface|type) \w+" --type rust --type ts --type py

# Find external integrations
rg "fetch\(|reqwest|aiohttp|requests\." .          # HTTP clients
rg "query|execute|SELECT|INSERT" .                  # Database
rg "open\(|File::|fs\." .                           # File I/O

# Find error handling (reveals edge cases)
rg "Error|Exception|panic|unwrap|expect" .
```

---

## Output Template

After exploration, produce a **Comprehensive Technical Summary**:

```markdown
## [Project Name] - Technical Architecture Summary

### Executive Summary
**[Project]** is a [type] that [purpose]. It implements [key patterns].

**Key Statistics:**
- ~X lines of code across Y modules
- Language: [lang] [version]
- Key dependencies: [list]

---

### Entry Points
- `src/main.rs:15` — CLI entry, parses args via clap
- `src/routes/mod.rs:1` — HTTP router (axum)

### Key Types
| Type | Location | Purpose |
|------|----------|---------|
| `Project` | src/model.rs:10 | Core domain object |
| `Config` | src/config.rs:5 | Runtime configuration |
| `Storage` | src/storage.rs:1 | Persistence layer |

### Data Flow
```
CLI args → Config::load() → Project::process() → Storage::save()
```

### External Dependencies
- SQLite via rusqlite (persistence)
- reqwest (HTTP client)
- tokio (async runtime)

### Configuration
| Source | Example |
|--------|---------|
| Env var | `CONFIG_PATH=/etc/tool.toml` |
| Config file | `~/.config/tool/config.toml` |
| CLI flag | `--verbose` |
```

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Skip AGENTS.md/README | Documentation first, always |
| Read files randomly | Follow entry point → data flow |
| Read entire files | Skim structure, dive into key functions |
| Ignore tests | Tests reveal intended behavior |
| Get lost in details | Build high-level map first |
| Fill context with raw code | Use Explore agent for synthesis |

---

## When to Use What

| Situation | Approach |
|-----------|----------|
| Brand new codebase | Full archaeology (all phases) |
| Adding a feature | Trace similar existing feature |
| Fixing a bug | Trace from symptom to root |
| Understanding one module | Start from module's public API |
| Large codebase (>10K LOC) | Spawn Explore agent first |

---

## Checklist

- [ ] **Read AGENTS.md/README.md** — Documentation first!
- [ ] **Orientation:** Directory structure, dependencies
- [ ] **Entry points:** main(), CLI commands, HTTP routes
- [ ] **Key types:** The 3-5 structs/classes everything uses
- [ ] **Data flow:** Entry → processing → storage
- [ ] **Config:** Env vars, config files, defaults
- [ ] **Integration:** External APIs, databases, file I/O
- [ ] **Tests:** What do tests reveal about intended behavior?
- [ ] **Produce summary:** Create reusable architecture doc

---

## References

| Need | File |
|------|------|
