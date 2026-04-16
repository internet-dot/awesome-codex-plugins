# Session Orchestrator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0--beta.5-green.svg)](CHANGELOG.md)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blueviolet.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Codex](https://img.shields.io/badge/Codex-Compatible-green.svg)](https://developers.openai.com/codex/)
[![Cursor IDE](https://img.shields.io/badge/Cursor_IDE-Compatible-blue.svg)](https://cursor.com)

Session orchestration plugin for Claude Code, Codex, and Cursor IDE — project planning, wave execution, VCS integration, quality gates.

> [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex](https://developers.openai.com/codex/), and [Cursor IDE](https://cursor.com) are agentic coding tools. This plugin adds structured session management on top — turning ad-hoc agent interactions into repeatable, quality-gated engineering workflows. No runtime code. Pure Markdown.

## Install

### Claude Code

Run these two slash commands **inside** Claude Code (they are not shell commands — there is no `claude plugin` CLI):

```text
/plugin marketplace add Kanevry/session-orchestrator
/plugin install session-orchestrator@kanevry
```

The first command registers this repository as a marketplace (named `kanevry`), the second installs the plugin from it. Reload Claude Code so the slash commands (`/session`, `/go`, `/close`, …) become available.

Prefer installing from a local clone? Use an absolute path instead of the `owner/repo` shorthand:

```text
/plugin marketplace add /absolute/path/to/session-orchestrator
/plugin install session-orchestrator@kanevry
```

### Codex

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
bash ~/Projects/session-orchestrator/scripts/codex-install.sh
```

### Cursor IDE

```bash
# 1. Clone the session-orchestrator repo
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator

# 2. Install Cursor rules into your project
bash ~/Projects/session-orchestrator/scripts/cursor-install.sh /path/to/your/project

# Session Config goes in CLAUDE.md (Cursor reads it natively)
```

## Quick Start

### Claude Code

After installing the plugin (see [Install](#install)), add a `## Session Config` section to your project's `CLAUDE.md`, then run:

```text
/session feature
/go
/close
```

### Codex

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
bash ~/Projects/session-orchestrator/scripts/codex-install.sh
```

Add Session Config to `AGENTS.md`, restart Codex, then run:

```text
/session feature
/go
/close
```

See [Usage](#usage) for all 6 commands and [User Guide](docs/USER-GUIDE.md) for the full walkthrough.

## Prerequisites

- **Claude Code**, **Codex**, or **Cursor IDE** — [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | [Codex](https://developers.openai.com/codex/) | [Cursor IDE](https://cursor.com)
- **jq** (recommended) — required for scope and command enforcement hooks

### Platform Support

| Feature | Claude Code | Codex | Cursor IDE |
|---------|------------|-----------|------------|
| All 6 commands | Native slash commands | Native plugin commands | Rules-based (.mdc) |
| Parallel agents | Agent tool | Multi-agent roles | Sequential only |
| Session persistence | .claude/STATE.md | .codex/STATE.md | .cursor/STATE.md |
| Shared knowledge | .orchestrator/metrics/ | .orchestrator/metrics/ | .orchestrator/metrics/ |
| Scope enforcement | PreToolUse hooks | Hooks (experimental) | afterFileEdit (post-hoc) |
| AskUserQuestion | Native tool | Numbered list fallback | Numbered list fallback |
| Quality gates | Full | Full | Full |
| Design alignment | Pencil integration | Pencil integration | Pencil integration |

All platforms share the same skills, commands, hooks, and scripts. Platform-specific adaptations are handled automatically via `scripts/lib/platform.sh`. See setup guides: [Codex](docs/codex-setup.md) | [Cursor IDE](docs/cursor-setup.md).

## Why Session Orchestrator

Session Orchestrator provides a complete development session lifecycle — from project state analysis through structured wave execution to verified close-out. While other tools optimize for speed or cost, Session Orchestrator optimizes for session quality and engineering discipline.

### Soul Personality System

A `soul.md` file defines the orchestrator's identity — communication principles, a decision-making hierarchy (safety > productivity > quality > ecosystem health > speed), and values (pragmatism, evidence, ownership). This shapes every interaction, not just tone.

### 5-Wave Execution Pattern

Five typed waves: Discovery (read-only), Core Implementation, Polish & Integration, Quality & Testing, Finalization. The Quality wave includes a simplification pass that cleans AI-generated code patterns before tests are written. Each wave has a defined purpose and agent count that scales by session type.

### Inter-Wave Quality Gates

A session-reviewer agent runs 8 review sections between waves (implementation correctness, test coverage, TypeScript health, OWASP security, issue tracking, silent failures, test depth, type design). Findings are confidence-scored (0-100) -- only >=80 make the report. Verification escalates progressively across waves.

### Design-Code Alignment

When configured with a Pencil design file, the wave executor screenshots design frames after Impl-Core and Impl-Polish waves and compares them with the actual implementation — checking layout structure, component hierarchy, and visual elements. Results are classified as ALIGNED / MINOR DRIFT / MAJOR MISMATCH with automatic plan adaptation.

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

| Feature | Session Orchestrator | Manual CLAUDE.md | Other Orchestrators |
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

Session Orchestrator optimizes for engineering quality -- every wave verified, every issue tracked, every session closed cleanly.

## Usage

| Command | Purpose |
|---------|---------|
| `/session [type]` | Start session (housekeeping, feature, deep) |
| `/go` | Approve plan, begin wave execution |
| `/close` | End session with verification |
| `/discovery [scope]` | Systematic quality discovery and issue detection |
| `/plan [mode]` | Plan a project, feature, or retrospective |
| `/evolve [mode]` | Extract, review, or list cross-session learnings |

## Workflow

Session Orchestrator has two complementary workflows: **planning** (what to build) and **execution** (how to build it).

```
/plan [mode]  →  /session [type]  →  /go  →  /close  →  /plan retro
    WHAT              HOW            DO      VERIFY       REFLECT
```

### Planning (`/plan`)

Run `/plan` **before** starting a session to define requirements and create issues:

- **`/plan new`** — Full project kickoff: 3-wave requirement gathering, 8-section PRD, repo scaffolding, Epic + prioritized issues. Use when starting from scratch.
- **`/plan feature`** — Compact feature PRD: 1-2 wave discovery, acceptance criteria, feature issues. Use when adding a feature to an existing project.
- **`/plan retro`** — Data-driven retrospective: analyzes session metrics, surfaces trends, creates improvement issues. Use after completing significant work.

`/plan` is optional — you can create issues manually and jump straight to `/session`.

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

`/evolve` is a standalone command for deliberate reflection — it is **not** called automatically during sessions.

**Why it exists:** `/close` extracts learnings from the *current* session only. `/evolve` analyzes *all* session history to find cross-session patterns that only emerge over time.

- **`/evolve analyze`** (default) — Reads `sessions.jsonl`, extracts patterns across all sessions (fragile files, effective sizing, recurring issues, scope guidance, deviation patterns). Presents findings for confirmation before writing.
- **`/evolve review`** — Interactive management: boost or reduce confidence, delete stale learnings, extend expiry.
- **`/evolve list`** — Read-only display of active learnings grouped by type.

**When to use:**
- After 5+ sessions — enough data for meaningful patterns
- When Project Intelligence is empty despite running sessions
- Before a big feature — check if the system has useful sizing/scope recommendations
- Periodically for housekeeping — prune outdated or incorrect learnings

**How it fits in the flow:**
```
/session → /go → /close       ← automatic learning (per-session)
         ...repeat 5+ times...
/evolve analyze                ← deliberate learning (cross-session)
/session → /go → /close       ← now session-start shows richer Project Intelligence
```

## Session Types

- **housekeeping** — Git cleanup, SSOT refresh, CI checks, branch merges (1-2 agents, serial)
- **feature** — Frontend/backend feature work (4-6 agents per wave x 5 waves)
- **deep** — Complex backend, security, DB, refactoring (up to 10-18 agents per wave x 5 waves)

## Repo Session Config

Add to each repo's `CLAUDE.md`:

```markdown
## Session Config

- **agents-per-wave:** 6
- **waves:** 5
- **pencil:** path/to/design.pen
- **cross-repos:** [related-repo-1, related-repo-2]
- **ssot-files:** [.claude/STATUS.md]
- **mirror:** github
- **ecosystem-health:** true
- **vcs:** github|gitlab (default: auto-detect)
- **gitlab-host:** custom-gitlab.example.com
- **health-endpoints:** [{name: "API", url: "https://api.example.com/health"}]
- **special:** "any repo-specific instructions"
- **persistence:** true
- **enforcement:** warn (strict|warn|off)
- **isolation:** worktree (worktree|none|auto)
- **max-turns:** auto (housekeeping=8, feature=15, deep=25)
- **learning-expiry-days:** 30
- **discovery-on-close:** true
- **agent-mapping:** { impl: code-editor, test: test-specialist, db: database-architect }
```

### Intelligent Agent Dispatch

When dispatching agents, Session Orchestrator uses a three-tier resolution:

1. **Project agents** (`.claude/agents/`) — highest priority, domain-specific
2. **Plugin agents** (`session-orchestrator:*`) — generic base agents, work in any project
3. **`general-purpose`** — fallback when no specialized agent matches

The `agent-mapping` config lets you explicitly bind roles to agents. Without it, session-plan auto-matches tasks to agents based on their descriptions.

For the complete field reference with types, defaults, and descriptions, see the [User Guide — Session Config Reference](docs/USER-GUIDE.md#4-session-config-reference).

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

- **11 Skills** (10 implemented + 1 design brief): session-start, session-plan, wave-executor, session-end, ecosystem-health, gitlab-ops, quality-gates, discovery, plan, evolve, vault-sync
- **6 Commands**: /session, /go, /close, /discovery, /plan, /evolve
- **6 Agents**: code-implementer, test-writer, ui-developer, db-specialist, security-reviewer (generic base agents) + session-reviewer (inter-wave quality gate)
- **Hooks**: SessionStart notification + Clank Event Bus integration + PreToolUse enforcement (scope + commands)
- **Output Styles**: 3 styles (session-report, wave-summary, finding-report) for consistent reporting
- `.codex-plugin/` — Codex plugin manifest (`plugin.json`) + compatibility config + 3 agent role definitions
- `scripts/codex-install.sh` — installs into the active Codex desktop plugin catalog or falls back to a local marketplace
- `scripts/` — 5 deterministic scripts (parse-config, run-quality-gate, validate-wave-scope, validate-plugin, token-audit) + shared lib + 328 tests

## Documentation

- [User Guide](docs/USER-GUIDE.md) — installation, config reference, workflow walkthrough, FAQ
- [CONTRIBUTING.md](CONTRIBUTING.md) — plugin architecture, skill anatomy, development setup
- [CHANGELOG.md](CHANGELOG.md) — version history
- [Example Configs](docs/examples/) — Session Config examples for Next.js, Express, Swift

## Links

- [Homepage](https://gotzendorfer.at/en/session-orchestrator)
- [Privacy Policy](https://gotzendorfer.at/en/session-orchestrator/privacy)

## License

[MIT](LICENSE)
