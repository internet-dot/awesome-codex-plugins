# Session Orchestrator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.3.0-blue.svg)](CHANGELOG.md)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blueviolet.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Codex](https://img.shields.io/badge/Codex-Compatible-green.svg)](https://developers.openai.com/codex/)
[![Cursor IDE](https://img.shields.io/badge/Cursor_IDE-Compatible-blue.svg)](https://cursor.com)

Session orchestration plugin for Claude Code, Codex, and Cursor IDE. Covers project planning, wave execution, VCS integration, and quality gates.

> [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex](https://developers.openai.com/codex/), and [Cursor IDE](https://cursor.com) are agentic coding tools. This plugin adds structured session management on top, turning ad-hoc agent interactions into repeatable, quality-gated engineering workflows. No runtime code. Pure Markdown.

> **Project-instruction file:** the per-repo config host is `CLAUDE.md (or AGENTS.md on Codex CLI)`. Both files are transparent aliases — pick one, never both. Resolution rule: [skills/_shared/instruction-file-resolution.md](skills/_shared/instruction-file-resolution.md).

## Install

> **Prerequisite:** Node.js 20 or later. Check with `node --version`. v3.x runs as ES modules and requires a real Node runtime (no Bash shim). [Install Node.js](https://nodejs.org/).

### Claude Code

Run these two slash commands **inside** Claude Code (they are not shell commands; there is no `claude plugin` CLI):

```text
/plugin marketplace add Kanevry/session-orchestrator
/plugin install session-orchestrator@kanevry
```

Then install Node dependencies **once** (hooks import `zx`):

```bash
cd "$(claude plugin dir session-orchestrator 2>/dev/null || echo ~/.claude/plugins/session-orchestrator)"
npm install
```

Restart Claude Code so the slash commands (`/session`, `/go`, `/close`, …) become available.

Prefer installing from a local clone? Use an absolute path instead of the `owner/repo` shorthand:

```text
/plugin marketplace add /absolute/path/to/session-orchestrator
/plugin install session-orchestrator@kanevry
```

### Codex

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
cd ~/Projects/session-orchestrator
npm install
node scripts/codex-install.mjs
```

### Cursor IDE

```bash
# 1. Clone the session-orchestrator repo
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
cd ~/Projects/session-orchestrator
npm install

# 2. Install Cursor rules into your project
node scripts/cursor-install.mjs /path/to/your/project

# Session Config goes in CLAUDE.md (or AGENTS.md on Codex CLI; Cursor reads CLAUDE.md natively)
```

## Quick Start

### Claude Code

After installing the plugin (see [Install](#install)), add a `## Session Config` section to your project's `CLAUDE.md (or AGENTS.md on Codex CLI)`, then run:

```text
/session feature
/go
/close
```

### Codex

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
node ~/Projects/session-orchestrator/scripts/codex-install.mjs
```

Add Session Config to `AGENTS.md` (the Codex CLI alias for `CLAUDE.md` — see [skills/_shared/instruction-file-resolution.md](skills/_shared/instruction-file-resolution.md)), restart Codex, then run:

```text
/session feature
/go
/close
```

See [Usage](#usage) for all 10 commands and [User Guide](docs/USER-GUIDE.md) for the full walkthrough.

## Prerequisites

- **Node.js 20 or later** — plugin runs as ES modules; no Bash runtime needed.
- **Claude Code**, **Codex**, or **Cursor IDE**: [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | [Codex](https://developers.openai.com/codex/) | [Cursor IDE](https://cursor.com)
- **jq** (optional): convenience for editing the `.orchestrator/policy/*.json` files. Not invoked by hooks at runtime in v3.
- **git** — any recent version.

### Platform Support

| Feature | Claude Code | Codex | Cursor IDE |
|---------|------------|-----------|------------|
| OS | macOS, Linux, **Windows (native)** | macOS, Linux, **Windows (native)** | macOS, Linux, **Windows (native)** |
| All 10 commands | Native slash commands | Native plugin commands | Rules-based (.mdc) |
| Parallel agents | Agent tool | Multi-agent roles | Sequential only |
| Session persistence | .claude/STATE.md | .codex/STATE.md | .cursor/STATE.md |
| Shared knowledge | .orchestrator/metrics/ | .orchestrator/metrics/ | .orchestrator/metrics/ |
| Scope enforcement | PreToolUse hooks | Hooks (experimental) | afterFileEdit (post-hoc) |
| AskUserQuestion | Native tool | Numbered list fallback | Numbered list fallback |
| Quality gates | Full | Full | Full |
| Design alignment | Pencil integration | Pencil integration | Pencil integration |

Windows support is **native** as of v3.0.0 — no WSL, no Git-Bash, no msys. All file paths use `path.join`, all tmp paths use `os.tmpdir()`, and CI verifies on `windows-latest` alongside `ubuntu-latest` and `macos-latest`.

All platforms share the same skills, commands, hooks, and scripts. Platform-specific adaptations are handled automatically via `scripts/lib/platform.mjs`. See setup guides: [Codex](docs/codex-setup.md) | [Cursor IDE](docs/cursor-setup.md).

## Troubleshooting

### Hooks silently no-op after install

Most common cause on any OS: `npm install` was not run in the plugin directory, so `zx` is missing. Run it and restart your editor. Verify with `ls node_modules/zx` in the plugin root.

### Windows: `Cannot use import statement outside a module` or `node` not found

`node` must be on the editor's `PATH`. If you installed Node via nvm-windows or fnm, relaunch the editor from a shell where `node --version` prints `v20.x` or later. In Claude Code you can sanity-check with `!node --version`.

### Windows: CRLF breaks shell scripts / hooks after upgrade

v3 ships `.gitattributes` with explicit LF rules for `.sh`, `.mjs`, `.md`, `.json`, and `.yaml`. Clones from before v3 may still have CRLF endings in tracked files. Normalize once:

```bash
git config core.autocrlf false
git rm --cached -r .
git reset --hard
```

Back up any uncommitted work first.

### macOS / Linux: `Permission denied` on a hook

v3 hooks are `.mjs` files invoked via `node <path>` — the executable bit is not required. If your editor reports `Permission denied`, it is still pointing at a stale `.sh` path. Re-run the platform install script (`scripts/codex-install.mjs`, `scripts/cursor-install.mjs`) or re-add the plugin in Claude Code.

### `SyntaxError` in hooks

Confirm Node version (`node --version` must be `v20.x+`) and that `package.json` has `"type": "module"`. Both are required for ESM imports.

### `npm install` fails with `ERESOLVE`

Use Node 20 or 22 LTS. If the error persists: `npm install --legacy-peer-deps`. Open an issue if it still fails.

For a longer walkthrough including rollback, see [docs/migration-v3.md](docs/migration-v3.md).

## Why Session Orchestrator

Session Orchestrator covers the full development session lifecycle: project state analysis, structured wave execution, and verified close-out. Each step is gated on quality, not just speed.

### Soul Personality System

A `soul.md` file defines the orchestrator's identity: communication principles, a decision-making hierarchy (safety > productivity > quality > ecosystem health > speed), and values (pragmatism, evidence, ownership). This shapes every interaction, not just tone.

### 5-Wave Execution Pattern

Five typed waves: Discovery (read-only), Core Implementation, Polish & Integration, Quality & Testing, Finalization. The Quality wave includes a simplification pass that cleans AI-generated code patterns before tests are written. Each wave has a defined purpose and agent count that scales by session type.

### Inter-Wave Quality Gates

A session-reviewer agent runs 8 review sections between waves (implementation correctness, test coverage, TypeScript health, OWASP security, issue tracking, silent failures, test depth, type design). Findings are confidence-scored (0-100) -- only >=80 make the report. Verification escalates progressively across waves.

### Design-Code Alignment

When a Pencil design file is configured, the wave executor screenshots design frames after Impl-Core and Impl-Polish waves and compares them with the actual implementation, checking layout structure, component hierarchy, and visual elements. Results are classified as ALIGNED / MINOR DRIFT / MAJOR MISMATCH with automatic plan adaptation.

### VCS Dual Support

Auto-detects GitLab or GitHub from your git remote. Full lifecycle support for both: issue management, MR/PR tracking, pipeline/workflow status, label taxonomy, and milestone queries. No lock-in.

### Ecosystem Health Monitoring

Checks configured service endpoints and scans cross-repo critical issues at session start. Know your ecosystem state before you start working.

### Session Persistence & Safety

Sessions persist across interruptions via `STATE.md` -- crash recovery, resume, and handover. PreToolUse hooks enforce agent scope and block dangerous commands. A circuit breaker detects execution spirals and recovers automatically.

### Metrics & Cross-Session Learning

Every session writes metrics (duration, agents, files per wave) and effectiveness stats (completion rate, carryover). After 5+ sessions, the system surfaces trends. Use `/evolve analyze` to extract cross-session patterns, `/evolve review` to curate learnings, or `/evolve list` to inspect them.

### Adaptive Wave Sizing

A complexity scoring formula (files x modules x issues) determines agent counts per role and session type. Dynamic scaling adjusts between waves based on actual performance.

### Verified Session Close-Out

`/close` verifies every planned item, runs a full quality gate, creates carryover issues for unfinished work, and commits with individually staged files. `/discovery` runs 23 modular probes across code, infra, UI, architecture, and session categories -- each finding confidence-scored.

### Comparison

| Feature | Session Orchestrator | Manual CLAUDE.md | Other Orchestrators | <!-- consistency:exempt: column label, not a per-platform file reference -->
|---------|---------------------|------------------|-------------------|
| Session lifecycle (start → plan → execute → close) | Full, automated | Manual | Partial |
| Typed waves with quality gates | 5 roles, progressive verification | None | Batch execution |
| Session persistence & crash recovery | STATE.md + memory files | None | Partial |
| Scope & command enforcement hooks | PreToolUse with strict/warn/off | None | None |
| Circuit breaker & spiral detection | Per-agent, with recovery | None | Partial |
| Cross-session learning | Confidence-scored learnings | None | None |
| Adaptive wave sizing | Complexity-scored, dynamic | Fixed | Fixed |
| VCS integration (GitLab + GitHub) | Dual, auto-detected | Manual CLI | Usually GitHub only |
| Design-code alignment | Pencil integration | None | None |
| Session close with carryover | Verified, with issue creation | Manual | Partial |

The design goal is engineering quality: every wave exits verified, every unfinished issue gets a carryover ticket, and every session closes with a clean commit.

## Usage

| Command | Purpose |
|---------|---------|
| `/session [type]` | Start session (housekeeping, feature, deep) |
| `/go` | Approve plan, begin wave execution |
| `/close` | End session with verification |
| `/discovery [scope]` | Systematic quality discovery and issue detection |
| `/plan [mode]` | Plan a project, feature, or retrospective |
| `/evolve [mode]` | Extract, review, or list cross-session learnings |
| `/bootstrap` | Scaffold required repo structure for session-orchestrator |
| `/harness-audit` | Score the harness against the deterministic 7-category rubric |
| `/autopilot` | Headless walk-away CLI driver for chained sessions |
| `/repo-audit` | One-shot repo-level audit |

## Workflow

Session Orchestrator has two complementary workflows: **planning** (what to build) and **execution** (how to build it).

```
/plan [mode]  →  /session [type]  →  /go  →  /close  →  /plan retro
    WHAT              HOW            DO      VERIFY       REFLECT
```

### Planning (`/plan`)

Run `/plan` **before** starting a session to define requirements and create issues:

- **`/plan new`**: Full project kickoff. 3-wave requirement gathering, 8-section PRD, repo scaffolding, Epic + prioritized issues. Use when starting from scratch.
- **`/plan feature`**: Compact feature PRD. 1-2 wave discovery, acceptance criteria, feature issues. Use when adding a feature to an existing project.
- **`/plan retro`**: Data-driven retrospective. Analyzes session metrics, surfaces trends, creates improvement issues. Use after completing significant work.

`/plan` is optional. You can create issues manually and jump straight to `/session`.

### Execution (`/session` → `/go` → `/close`)

Run `/session` to **implement** existing issues across structured waves:

```
/session feature     # Analyze project, pick issues, agree on scope
/go                  # Execute across 5 parallel waves
/close               # Verify, commit, push, create carryover issues
```

### Example: Feature from idea to delivery

```bash
/plan feature        # 10 min: define requirements → PRD + 3 issues
/session feature     # Pick those 3 issues → wave plan
/go                  # Execute: Discovery → Impl-Core → Polish → Quality → Finalize
/close               # Verify + commit + push
```

### Learning (`/evolve`)

`/evolve` is a standalone command for deliberate reflection. It is **not** called automatically during sessions.

**Why it exists:** `/close` extracts learnings from the *current* session only. `/evolve` analyzes *all* session history to find cross-session patterns that only emerge over time.

- **`/evolve analyze`** (default): Reads `sessions.jsonl`, extracts patterns across all sessions (fragile files, effective sizing, recurring issues, scope guidance, deviation patterns). Presents findings for confirmation before writing.
- **`/evolve review`**: Interactive management. Boost or reduce confidence, delete stale learnings, extend expiry.
- **`/evolve list`**: Read-only display of active learnings grouped by type.

**When to use:**
- After 5+ sessions, so there is enough data for meaningful patterns
- When Project Intelligence is empty despite running sessions
- Before a big feature, to check if the system has useful sizing/scope recommendations
- Periodically for housekeeping, to prune outdated or incorrect learnings

**How it fits in the flow:**
```
/session → /go → /close       ← automatic learning (per-session)
         ...repeat 5+ times...
/evolve analyze                ← deliberate learning (cross-session)
/session → /go → /close       ← now session-start shows richer Project Intelligence
```

## Session Types

- **housekeeping**: Git cleanup, SSOT refresh, CI checks, branch merges (1-2 agents, serial)
- **feature**: Frontend/backend feature work (4-6 agents per wave x 5 waves)
- **deep**: Complex backend, security, DB, refactoring (up to 10-18 agents per wave x 5 waves)

## Repo Session Config

Add a `## Session Config` section to each repo's `CLAUDE.md (or AGENTS.md on Codex CLI)`. The smallest valid config:

```yaml
## Session Config

test-command: npm test
typecheck-command: npm run typecheck
lint-command: npm run lint
agents-per-wave: 6
waves: 5
persistence: true
enforcement: warn
```

Those seven mandatory fields are schema-validated by `scripts/lib/config-schema.mjs`. Everything else is opt-in (env-aware sizing, vault sync, drift checks, docs orchestrator, webhooks, agent mapping, …).

For the full template — minimal baseline, opt-in baseline, and per-section walk-through of every field — see [`docs/session-config-template.md`](docs/session-config-template.md). For the canonical type/default/edge-case reference, see [`docs/session-config-reference.md`](docs/session-config-reference.md).

### Intelligent Agent Dispatch

When dispatching agents, Session Orchestrator uses a three-tier resolution:

1. **Project agents** (`.claude/agents/`): highest priority, domain-specific
2. **Plugin agents** (`session-orchestrator:*`): generic base agents, work in any project
3. **`general-purpose`**: fallback when no specialized agent matches

The `agent-mapping` config lets you explicitly bind roles to agents. Without it, session-plan auto-matches tasks to agents based on their descriptions.

For the full field reference with types, defaults, and descriptions, see the [User Guide: Session Config Reference](docs/USER-GUIDE.md#4-session-config-reference).

## VCS Auto-Detection

Session Orchestrator auto-detects your VCS from the git remote URL:
- Remote contains `github.com` → uses `gh` CLI
- All other remotes → uses `glab` CLI

Override with `vcs: github` or `vcs: gitlab` in Session Config.

## Architecture

Session Orchestrator handles the **session layer** (orchestration, VCS integration, waves, close-out).
Superpowers handles the **task layer** (TDD, debugging, brainstorming per feature).

```
/plan → PRD + Issues    (optional: define WHAT to build)
  ↓
/session → Research → Q&A → Plan    (define HOW to build it)
  ↓
/go → 5 Waves → Inter-Wave Reviews    (execute)
  ↓
/close → Verify → Commit → Mirror    (verify + ship)
```

## Components

- **28 Skills**: bootstrap, session-start, session-plan, wave-executor, session-end, claude-md-drift-check, ecosystem-health, gitlab-ops, quality-gates, discovery, plan, evolve, vault-sync, vault-mirror, daily, docs-orchestrator, skill-creator, mcp-builder, hook-development, **architecture**, **domain-model**, **ubiquitous-language**, autopilot, mode-selector, repo-audit, convergence-monitoring, using-orchestrator, frontmatter-guard
- **10 Commands**: /session, /go, /close, /discovery, /plan, /evolve, /bootstrap, /harness-audit, /autopilot, /repo-audit
- **10 Agents**: code-implementer, test-writer, ui-developer, db-specialist, security-reviewer, session-reviewer, docs-writer, architect-reviewer, qa-strategist, analyst
- **Hooks**: 10 event matchers covering 10 hook handlers — SessionStart (banner + init), PreToolUse/Edit\|Write (scope enforcement), PreToolUse/Bash (destructive-command guard + enforce-commands), PostToolUse (edit validation), Stop (session events), SubagentStop (agent events + telemetry), PostToolUseFailure (corrective-context note), PostToolBatch (batch-resolved signal), SubagentStart (telemetry), CwdChanged (cwd-change record). Plus the Clank Event Bus integration (`hooks/_lib/events.mjs`).
- **Output Styles**: 3 styles (session-report, wave-summary, finding-report) for consistent reporting
- `.orchestrator/policy/` — runtime policy files (e.g. `blocked-commands.json`, 13 rules consumed by the destructive-command guard)
- `.claude/rules/` — always-on contributor rules (e.g. `parallel-sessions.md`)
- `.codex-plugin/`: Codex plugin manifest (`plugin.json`) + compatibility config + 3 agent role definitions
- `scripts/codex-install.mjs`: installs into the active Codex desktop plugin catalog or falls back to a local marketplace
- `scripts/`: deterministic scripts (parse-config, run-quality-gate, validate-wave-scope, validate-plugin, token-audit, autopilot) + shared lib (`scripts/lib/*.mjs`) + vitest suite (2623+ tests)

## Destructive-Command Guard

`hooks/pre-bash-destructive-guard.mjs` blocks destructive shell commands in the main session (alongside subagent waves). Policy lives in `.orchestrator/policy/blocked-commands.json` (13 rules covering `git reset --hard`, `rm -rf`, `git push --force`, etc.).

Bypass per-session by adding to your Session Config:

```yaml
allow-destructive-ops: true
```

Set this for intentional maintenance sessions only. The rule source of truth is [`.claude/rules/parallel-sessions.md`](.claude/rules/parallel-sessions.md) (PSA-003), which is vendored to all consumer repos via `/bootstrap`. See issue #155 for the codification narrative.

## Agent Authoring Rules

Custom agents live in `agents/` (plugin) or `.claude/agents/` (project) as Markdown with YAML frontmatter. The frontmatter contract is strict — Claude Code emits `agents: Invalid input` and silently drops the agent on any deviation. Required fields:

```yaml
---
name: kebab-case-name          # 3-50 chars, lowercase + hyphens only
description: Use this agent when [conditions]. <example>Context: ... user: "..." assistant: "..." <commentary>Why this agent is appropriate</commentary></example>
model: inherit                 # inherit | sonnet | opus | haiku
color: blue                    # blue | cyan | green | yellow | magenta | red
tools: Read, Grep, Glob, Bash  # COMMA-SEPARATED STRING, not JSON array!
---
```

**Critical pitfalls** (cause `agents: Invalid input` validation failure):

- `tools` MUST be a comma-separated string (`Read, Edit, Write`), NOT a JSON array (`["Read", "Edit"]`).
- `description` MUST be a single-line inline string, NOT a YAML block scalar (`>` or `|`). Put `<example>` blocks inline.
- All four fields (`name`, `description`, `model`, `color`) are required. `tools` is optional.

Reference: [Anthropic agent-development SKILL.md](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/agent-development/SKILL.md).

## Development

Clone, install, and verify in three commands:

```bash
git clone https://github.com/Kanevry/session-orchestrator.git && cd session-orchestrator
npm install
npm test        # vitest — primary test flow
```

Additional scripts:

- `npm run test:watch` — vitest in watch mode
- `npm run lint` / `npm run lint:fix` — ESLint v9 + Prettier
- `npm run typecheck` — `node --check` on every `.mjs` file (syntactic-only; no TypeScript yet)

The legacy `bats` shell suite (`scripts/test/run-all.sh`) is retained for historical reference but is **deprecated** and will be removed in a future release. Do not add new tests there — use `tests/**/*.test.mjs` under vitest.

For contributor-facing architecture, hook authoring, and the `zx`-vs-stdlib heuristic, see [docs/plugin-architecture-v3.md](docs/plugin-architecture-v3.md).

## Documentation

- [User Guide](docs/USER-GUIDE.md): installation, config reference, workflow walkthrough, FAQ
- [Migration to v3](docs/migration-v3.md): upgrade path from v2.x to v3.0.0, known issues, rollback
- [Plugin Architecture (v3)](docs/plugin-architecture-v3.md): contributor guide — layering, hook anatomy, lib catalog, testing
- [CONTRIBUTING.md](CONTRIBUTING.md): plugin architecture, skill anatomy, development setup
- [CHANGELOG.md](CHANGELOG.md): version history
- [Example Configs](docs/examples/): Session Config examples for Next.js, Express, Swift

## Links

- [Homepage](https://gotzendorfer.at/en/session-orchestrator)
- [Privacy Policy](https://gotzendorfer.at/en/session-orchestrator/privacy)

## Weiterführend

- **Project state & runtime SSOT:** Siehe [`CLAUDE.md`](./CLAUDE.md) für den `## Current State`-Block (was läuft gerade, welche Tests, welcher Backlog) und den live `## Session Config`-Block, den `skills/_shared/config-reading.md` zur Laufzeit liest.
- **Codex CLI:** Auf Codex CLI heißt die gleiche Datei `AGENTS.md`. Auflösungs-Regel: [skills/_shared/instruction-file-resolution.md](skills/_shared/instruction-file-resolution.md).

## License

[MIT](LICENSE)
