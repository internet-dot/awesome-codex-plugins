# Session Orchestrator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.6.0-blue.svg)](CHANGELOG.md)
[![Tests](https://img.shields.io/badge/tests-5001%20passing-brightgreen.svg)](#development)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blueviolet.svg)](https://docs.anthropic.com/en/docs/claude-code)
[![Codex](https://img.shields.io/badge/Codex-Compatible-green.svg)](https://developers.openai.com/codex/)
[![Cursor IDE](https://img.shields.io/badge/Cursor_IDE-Compatible-blue.svg)](https://cursor.com)

Session orchestration for Claude Code, Codex CLI, and Cursor IDE. It turns ad-hoc agent sessions into a repeatable loop: research the project, agree on scope, execute in waves with quality gates, close out cleanly.

> No runtime code, just markdown. The plugin layers on top of the existing harness. If you remove it, your editor still works.

> **Project-instruction file:** the per-repo config host is `CLAUDE.md` (or `AGENTS.md` on Codex CLI). Both files are transparent aliases. Pick one, never both. Resolution rule: [skills/_shared/instruction-file-resolution.md](skills/_shared/instruction-file-resolution.md).

## What's new in v3.6.0

Five deep sessions plus three intermediate fix-clusters since v3.5.0. The headline is **`/test`** — an agentic end-to-end test orchestrator with a 4-check UX rubric, two drivers (Playwright + Peekaboo), a `ux-evaluator` reviewer agent, and issue-tracker reconciliation. Tests grew from 4430 to **5001** (+571), validate-plugin 27 → **43** (+16 R5 grep-canaries). Zero CI regressions, zero breaking changes.

- **`/test` command** (#378–#407). Drives web flows (Playwright) and macOS native UI (Peekaboo); evaluates artifacts against [`skills/test-runner/rubric-v1.md`](skills/test-runner/rubric-v1.md) (onboarding step-count ≤7, axe critical/serious, console-errors, Apple-Liquid-Glass `.glassEffect()` conformance on SwiftUI 26+); reconciles findings with the open issue tracker via `scripts/lib/test-runner/issue-reconcile.mjs`. Wraps upstream tools — no forks. Hard-gates Playwright MCP for browser drive (4× token cost vs CLI per Microsoft's own benchmark).
- **`scripts/lib/path-utils.mjs`** with `validatePathInsideProject(p, root)` (#402). Two-phase lexical + realpath guard returning a tagged-union `{ ok, realPath, lexicalPath, reason }`. Adopted at three callsites with 3-line adapters that preserve each callsite's original semantics (silent-skip vs throw vs hard-error). DEEP module per LANGUAGE.md.
- **`@lib/*` vitest alias rollout** (#401, #407). 33 test files migrated from `'../../../../scripts/lib/…'` to `'@lib/…'`. Eliminates the import-depth churn that surfaces every time a source file is renamed. Remainder (~25 files + 2 dynamic-import files) tracked in #407.
- **Autopilot `--multi-story`** (#341, ADR-364 thin-slice). `scripts/autopilot-multi.mjs` runs N parallel issue pipelines in isolated git worktrees with per-loop kill-switches. Built on the ADR-364 substrate (sessions.jsonl optional fields, `STALL_TIMEOUT` kill-switch, `gc-stale-worktrees` realpathSync symlink-escape defence, `validateWorkspacePath`).
- **CI restoration** (#367–#369). The 8-pipeline silent regression introduced 2026-05-09 (deep-3) was fixed in 2026-05-10 (deep-2). Root cause: `skills/vault-sync/pnpm-lock.yaml` tracked despite `.gitignore:63` forbidding it — lockfile conflict + `engine-strict=true` → silent `npm install` exit-1. Also: `.github/workflows/test.yml` `fetch-depth: 1 → 0` for gitleaks revision-range.

For the full version history see [CHANGELOG.md](CHANGELOG.md).

### Multi-Story Autopilot

`scripts/autopilot-multi.mjs` adds a `--multi-story` orchestration mode that runs N parallel issue pipelines in isolated git worktrees with per-loop kill-switches. Built on the ADR-364 substrate (sessions.jsonl optional fields, autopilot.jsonl extensions, `STALL_TIMEOUT` kill-switch, `gc-stale-worktrees` realpathSync defence, `validateWorkspacePath`).

**Status:** v1 shipped in v3.6.0. Production: dry-run plan and basic apply mode. Follow-ups: cross-loop commit-wait, real SIGTERM cohort enforcement, on-green MR-draft trigger.

```bash
# Dry-run plan (default, safe)
node scripts/autopilot-multi.mjs --dry-run --json

# Apply mode (real glab issue fetch + worktree spawn)
node scripts/autopilot-multi.mjs --apply --max-stories 3 --max-hours 4

# With draft-MR creation
node scripts/autopilot-multi.mjs --apply --draft-mr on-loop-start
```

See [`commands/autopilot-multi.md`](commands/autopilot-multi.md) or `node scripts/autopilot-multi.mjs --help` for the full flag reference.

## Install

> **Prerequisite:** Node.js 20 or later. Check with `node --version`. v3.x runs as ES modules and requires a real Node runtime, no Bash shim. [Install Node.js](https://nodejs.org/).

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

Restart Claude Code so the slash commands (`/session`, `/go`, `/close`, ...) become available.

Prefer installing from a local clone? Use an absolute path instead of the `owner/repo` shorthand:

```text
/plugin marketplace add /absolute/path/to/session-orchestrator
/plugin install session-orchestrator@kanevry
```

### Codex CLI

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
cd ~/Projects/session-orchestrator
npm install
node scripts/codex-install.mjs
```

### Cursor IDE

```bash
git clone https://github.com/Kanevry/session-orchestrator.git ~/Projects/session-orchestrator
cd ~/Projects/session-orchestrator
npm install

# Install Cursor rules into your project
node scripts/cursor-install.mjs /path/to/your/project

# Session Config goes in CLAUDE.md (Cursor reads CLAUDE.md natively)
```

## Quick Start

Add a `## Session Config` section to your project's `CLAUDE.md` (or `AGENTS.md` on Codex CLI), then run three commands:

```text
/session feature
/go
/close
```

The smallest valid Session Config is seven fields:

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

Everything else is opt-in. See [`docs/session-config-template.md`](docs/session-config-template.md) for the full template and [`docs/session-config-reference.md`](docs/session-config-reference.md) for the canonical type and default reference.

## How it works

Most agentic-coding tools jump straight into writing code. Session Orchestrator adds a structured loop on top: research first, agree on scope, then execute in waves with verification gates between them.

Here is what happens when you type `/session feature`:

1. **Phase analysis runs in parallel.** Git state, open issues, recent commits, SSOT freshness, plugin freshness, resource health, prior-session memory, and project-intelligence learnings all get inspected. The result is a structured Session Overview with a recommendation, not a wall of raw data.
2. **You agree on scope.** Through a tool-rendered picker (Claude Code) or a numbered list (Codex CLI / Cursor), you pick which issues to tackle. The orchestrator has an opinion and tells you what it would do.
3. **The plan is decomposed into five waves.** Discovery (read-only), Impl-Core, Impl-Polish, Quality, and Finalize. Agent counts per role scale by session type. Each wave has a defined purpose and a deliverable.
4. **`/go` executes.** Agents work in parallel within a wave. A session-reviewer audits the output between waves on eight dimensions: implementation correctness, test coverage, TypeScript health, OWASP, issue tracking, silent failures, test depth, type design. Only findings with confidence at or above 80 reach you.
5. **`/close` ships it.** Every planned item is verified. Quality gates run full. Unfinished work becomes carryover issues so nothing falls through the cracks. Files are staged individually, not via `git add .`, so parallel sessions cannot stomp each other.

Two complementary commands round out the loop:

- **`/plan`** runs *before* a session, when you need a PRD, requirements, or a retrospective.
- **`/evolve`** runs occasionally, deliberately. It analyses session history across runs, surfaces patterns that only emerge over time, and feeds them back as Project Intelligence at the next session-start.

The whole system is markdown. There is no runtime, no daemon, no DB. Skills are read by the editor, hooks fire on events, scripts run on demand. If something goes wrong, you can read every file and see what happened.

## Why this design

**Five typed waves, not one big batch.** Discovery first, so the implementer agents start with shared context. Impl-Core before Impl-Polish, so the architectural decisions land before the integrations. Quality runs a *simplification pass* on AI-generated code before tests are written, otherwise tests pin the AI patterns into place.

**Inter-wave reviews, not just end-of-session.** A session-reviewer agent runs between every wave with explicit confidence scoring. The eight review dimensions are not advisory; only findings at or above confidence 80 are surfaced. This filters speculative criticism and keeps your attention on what actually matters.

**State persists across crashes.** `STATE.md` records wave progress, mission status, and deviations. If the session is interrupted, the next `/session` invocation offers to resume from the last completed wave. Coordinator snapshots (git refs under `refs/so-snapshots/*`) capture the working tree on demand.

**Hooks enforce, not just warn.** Pre-Bash destructive-command guard blocks `git reset --hard`, `rm -rf`, force-pushes, and ten more rules from `.orchestrator/policy/blocked-commands.json`. Pre-Edit scope enforcement blocks writes outside an agent's `allowedPaths`. The guard runs in main sessions and subagent waves equally.

**Cross-session learning is opt-in and inspectable.** Every session writes a record to `.orchestrator/metrics/sessions.jsonl`. After five-plus sessions, `/evolve analyze` extracts confidence-scored patterns into `learnings.jsonl`. You can read every line. You can prune via `/evolve review`. Nothing is hidden.

**VCS dual support, no lock-in.** Auto-detects GitLab or GitHub from your git remote. Full lifecycle for both: issue management, MR/PR tracking, pipeline status, label taxonomy, milestone queries.

## Commands

| Command | Purpose |
|---------|---------|
| `/session [type]` | Start a session (housekeeping, feature, deep) |
| `/go` | Approve plan, begin wave execution |
| `/close` | End session with verification, commit, push |
| `/discovery [scope]` | Run modular probes, surface findings, create issues |
| `/plan [mode]` | Plan a project, feature, or retrospective |
| `/evolve [mode]` | Extract, review, or list cross-session learnings |
| `/bootstrap` | Scaffold required repo structure |
| `/harness-audit` | Score the harness against the 7-category rubric |
| `/autopilot` | Headless walk-away CLI driver for chained sessions |
| `/repo-audit` | One-shot repo-level baseline audit |
| `/test` | Orchestrate agentic E2E test runs via playwright-driver |

## Session Types

- **`housekeeping`**: git cleanup, SSOT refresh, CI checks, branch merges. Often runs coordinator-direct (Express Path) when scope is at most three sequential issues. 1 to 2 agents, serial.
- **`feature`**: frontend or backend feature work. 4 to 6 agents per wave times 5 waves.
- **`deep`**: complex backend, security, DB, refactoring. Up to 10 to 18 agents per wave times 5 waves.

## Workflow

The two complementary loops:

```
/plan [mode]  →  /session [type]  →  /go  →  /close  →  /plan retro
    WHAT              HOW            DO      VERIFY       REFLECT
```

`/plan` is optional. You can create issues manually and jump straight to `/session`.

For a feature from idea to delivery:

```bash
/plan feature        # 10 min: requirements → PRD + 3 issues
/session feature     # pick those 3 issues → wave plan
/go                  # execute 5 waves
/close               # verify, commit, push
```

For learning across sessions, see [`/evolve`](commands/evolve.md). It is *not* called automatically. Run it deliberately after five-plus sessions, when Project Intelligence stops surfacing useful guidance, or before a big feature.

## Platform Support

| Feature | Claude Code | Codex CLI | Cursor IDE |
|---------|------------|-----------|------------|
| OS | macOS, Linux, **Windows (native)** | macOS, Linux, **Windows (native)** | macOS, Linux, **Windows (native)** |
| All 11 commands | Native slash commands | Native plugin commands | Rules-based (.mdc) |
| Parallel agents | Agent tool | Multi-agent roles | Sequential only |
| Session persistence | `.claude/STATE.md` | `.codex/STATE.md` | `.cursor/STATE.md` |
| Shared knowledge | `.orchestrator/metrics/` | `.orchestrator/metrics/` | `.orchestrator/metrics/` |
| Scope enforcement | PreToolUse hooks | Hooks (experimental) | `afterFileEdit` (post-hoc) |
| AskUserQuestion | Native tool | Numbered-list fallback | Numbered-list fallback |
| Quality gates | Full | Full | Full |
| Design alignment | Pencil integration | Pencil integration | Pencil integration |

Windows support is **native** since v3.0.0. No WSL, no Git-Bash, no msys. All file paths use `path.join`, all tmp paths use `os.tmpdir()`, CI verifies on `windows-latest` alongside `ubuntu-latest` and `macos-latest`.

All platforms share the same skills, commands, hooks, and scripts. Platform-specific adaptations are handled in `scripts/lib/platform.mjs`. Setup guides: [Codex](docs/codex-setup.md) and [Cursor IDE](docs/cursor-setup.md).

### Cursor IDE caveats

Cursor has two event-coverage limitations vs. Claude Code and Codex CLI:

1. **No SessionStart equivalent.** Cursor lacks a conversation-start lifecycle event. Session initialisation must be triggered manually via `/session`.
2. **Post-hoc scope enforcement.** The Cursor-equivalent `afterFileEdit` hook fires *after* the edit. The destructive-command guard (`beforeShellExecution`) is fully equivalent to Claude Code's PreToolUse Bash gate. Scope enforcement is best-effort warn-only on Cursor.

Active Cursor hooks: 2 events (`afterFileEdit`, `beforeShellExecution`) routed to 2 handlers (`enforce-scope.mjs`, `enforce-commands.mjs`).

## Components

- **32 Skills**: bootstrap, session-start, session-plan, wave-executor, session-end, claude-md-drift-check, ecosystem-health, gitlab-ops, quality-gates, discovery, plan, evolve, vault-sync, vault-mirror, daily, docs-orchestrator, skill-creator, mcp-builder, hook-development, architecture, domain-model, ubiquitous-language, autopilot, mode-selector, repo-audit, convergence-monitoring, using-orchestrator, frontmatter-guard, test-runner, playwright-driver, peekaboo-driver (session-start sub-files: `phase-2-5-docs-planning.md`, `phase-4-5-resource-health.md`, `phase-7-5-mode-selector.md`, `phase-8-5-express-path.md`)
- **12 Commands**: `/session`, `/go`, `/close`, `/discovery`, `/plan`, `/evolve`, `/bootstrap`, `/harness-audit`, `/autopilot`, `/repo-audit`, `/test`
- **11 Agents**: code-implementer, test-writer, ui-developer, db-specialist, security-reviewer, session-reviewer, docs-writer, architect-reviewer, qa-strategist, analyst, ux-evaluator
- **10 hook event matchers / 10 handlers**: SessionStart (banner + init), PreToolUse/Edit\|Write (scope enforcement), PreToolUse/Bash (destructive-command guard + enforce-commands), PostToolUse (edit validation), Stop (session events), SubagentStop (telemetry), PostToolUseFailure (corrective context), PostToolBatch (wave signal), SubagentStart (telemetry), CwdChanged (cwd-change record). Plus the Clank Event Bus integration in `hooks/_lib/events.mjs`.
- **Output Styles**: 3 (session-report, wave-summary, finding-report) for consistent reporting
- **`.orchestrator/policy/`**: runtime policy files, e.g. `blocked-commands.json` with 13 rules consumed by the destructive-command guard
- **`.claude/rules/`**: always-on contributor rules, e.g. `parallel-sessions.md` (PSA-001 through PSA-004)
- **`.codex-plugin/`**: Codex plugin manifest (`plugin.json`), compatibility config, 3 agent role definitions
- **`scripts/`**: deterministic scripts (parse-config, run-quality-gate, validate-wave-scope, validate-plugin, token-audit, autopilot) plus shared lib (`scripts/lib/*.mjs`) plus a vitest suite of 5001 tests

## Comparison

| Capability | Session Orchestrator | Manual `CLAUDE.md` | Other orchestrators |
|---|---|---|---|
| Session lifecycle (start → plan → execute → close) | Full, automated | Manual | Partial |
| Typed waves with quality gates | 5 roles, progressive verification | None | Batch execution |
| Session persistence and crash recovery | `STATE.md` plus memory files | None | Partial |
| Scope and command enforcement hooks | PreToolUse with strict / warn / off | None | None |
| Circuit breaker and spiral detection | Per-agent, with recovery | None | Partial |
| Cross-session learning | Confidence-scored learnings | None | None |
| Adaptive wave sizing | Complexity-scored, dynamic | Fixed | Fixed |
| VCS integration (GitLab + GitHub) | Dual, auto-detected | Manual CLI | Usually GitHub only |
| Design-code alignment | Pencil integration | None | None |
| Session close with carryover | Verified, with issue creation | Manual | Partial |

The design goal is engineering quality. Every wave exits verified, every unfinished issue gets a carryover ticket, every session closes with a clean commit.

## VCS auto-detection

Session Orchestrator detects your VCS from the git remote URL:

- Remote contains `github.com` → uses `gh` CLI
- All other remotes → uses `glab` CLI

Override with `vcs: github` or `vcs: gitlab` in Session Config.

## Architecture

Session Orchestrator handles the **session layer**: orchestration, VCS integration, waves, close-out. Skills like [obra/superpowers](https://github.com/obra/superpowers) handle the **task layer**: TDD, debugging, brainstorming per feature. They compose well.

```
/plan → PRD + Issues          (optional: define WHAT to build)
  ↓
/session → Research → Q&A     (define HOW to build it)
  ↓
/go → 5 Waves + Reviews       (execute)
  ↓
/close → Verify → Commit      (verify and ship)
```

## Destructive-command guard

`hooks/pre-bash-destructive-guard.mjs` blocks destructive shell commands in the main session and in subagent waves. Policy lives in `.orchestrator/policy/blocked-commands.json` (13 rules covering `git reset --hard`, `rm -rf`, `git push --force`, and more).

Bypass per-session by adding to your Session Config:

```yaml
allow-destructive-ops: true
```

Set this for intentional maintenance sessions only. The rule source of truth is [`.claude/rules/parallel-sessions.md`](.claude/rules/parallel-sessions.md) (PSA-003), vendored to all consumer repos via `/bootstrap`.

## Agent authoring

Custom agents live in `agents/` (plugin) or `.claude/agents/` (project) as Markdown with YAML frontmatter. The frontmatter contract follows the canonical [code.claude.com/sub-agents](https://code.claude.com/docs/en/sub-agents) spec. Required fields:

```yaml
---
name: kebab-case-name           # 3-50 chars, lowercase + hyphens only
description: Use this agent when [conditions]. <example>...</example>
model: inherit                  # inherit | sonnet | opus | haiku, OR full ID like claude-opus-4-7
color: blue                     # blue | cyan | green | yellow | purple | orange | pink | red | magenta
tools: Read, Grep, Glob, Bash   # comma-separated string OR JSON array; both accepted
---
```

**Critical:** `description` must be a single-line inline string, not a YAML block scalar (`>` or `|`). Put `<example>` blocks inline. Reference: [Anthropic agent-development SKILL.md](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/agent-development/SKILL.md). Body conventions: 500 to 3000 words, sections in the order Core Responsibilities → Process → Quality Standards → Output Format → Edge Cases.

## Development

Clone, install, verify in three commands:

```bash
git clone https://github.com/Kanevry/session-orchestrator.git && cd session-orchestrator
npm install
npm test        # vitest, 5001 tests
```

Additional scripts:

- `npm run test:watch`: vitest in watch mode
- `npm run lint` / `npm run lint:fix`: ESLint v9 + Prettier
- `npm run typecheck`: `node --check` on every `.mjs` file (syntactic only; no TypeScript yet)
- `npm run format` / `npm run format:check`: Prettier write or check

### Pre-commit hooks (Husky + commitlint + lint-staged)

`.npmrc` ships with `ignore-scripts=true` (SEC-020 supply-chain defence), so the `prepare` script does **not** auto-run on `npm install`. After cloning, run husky once manually:

```bash
npm install
npx husky                  # one-time setup, wires git hooks via .husky/_/
```

After that, `git commit` will:

- **pre-commit**: run `lint-staged` (ESLint `--fix` on staged `*.mjs` files) and (after #350 polish) gitleaks scan on staged files.
- **commit-msg**: validate Conventional Commits format via commitlint.

To bypass (rare, emergencies only): `git commit --no-verify`. CI re-runs everything pre-commit ran, plus more.

The legacy `bats` shell suite (`scripts/test/run-all.sh`) is retained for historical reference but is **deprecated** and will be removed in a future release. Do not add new tests there. Use `tests/**/*.test.mjs` under vitest.

For contributor-facing architecture, hook authoring, and the `zx`-vs-stdlib heuristic, see [docs/plugin-architecture-v3.md](docs/plugin-architecture-v3.md).

## Documentation

- [User Guide](docs/USER-GUIDE.md): installation, config reference, workflow walkthrough, FAQ
- [Migration to v3](docs/migration-v3.md): upgrade path from v2.x to v3.0.0, known issues, rollback
- [Plugin Architecture (v3)](docs/plugin-architecture-v3.md): contributor guide, layering, hook anatomy, lib catalog, testing
- [CONTRIBUTING.md](CONTRIBUTING.md): plugin architecture, skill anatomy, development setup
- [CHANGELOG.md](CHANGELOG.md): version history
- [Example Configs](docs/examples/): Session Config examples for Next.js, Express, Swift

## Links

- [Homepage](https://gotzendorfer.at/en/session-orchestrator)
- [Privacy Policy](https://gotzendorfer.at/en/session-orchestrator/privacy)

## Project state

For the live runtime SSOT, see [`CLAUDE.md`](./CLAUDE.md):

- `## Current State` block (active epic, test count, backlog snapshot, recent sessions)
- `## Session Config` block (read at runtime by `skills/_shared/config-reading.md`)

On Codex CLI the same file is `AGENTS.md`. Resolution rule: [skills/_shared/instruction-file-resolution.md](skills/_shared/instruction-file-resolution.md).

## License

[MIT](LICENSE)
