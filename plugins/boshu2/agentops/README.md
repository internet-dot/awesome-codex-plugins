<div align="center">

# AgentOps

[![Validate](https://github.com/boshu2/agentops/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/boshu2/agentops/actions/workflows/validate.yml)
[![Nightly](https://github.com/boshu2/agentops/actions/workflows/nightly.yml/badge.svg)](https://github.com/boshu2/agentops/actions/workflows/nightly.yml)

### Every session starts where the last one left off.

Validation, memory, lifecycle gates, and briefing-first control for coding agents. AgentOps acts as a software-factory control plane: bounded context goes in, validated code and durable learning come out.

[Start Here](#start-here) · [Install](#install) · [See It Work](#see-it-work) · [Skills](#skills) · [CLI](#the-ao-cli) · [FAQ](#faq) · [Newcomer Guide](https://github.com/boshu2/agentops/blob/main/docs/newcomer-guide.md)

</div>

<p align="center">
<img src="docs/assets/swarm-6-rpi.png" alt="Agents running full development cycles in parallel with validation gates and a coordinating team leader" width="800">
</p>

---

## What AgentOps Gives You

Session 1, your agent spends 2 hours debugging a timeout bug. Session 15, a new agent finds the answer in 10 seconds — because `/retro` captured the lesson and the flywheel promoted it. Three capabilities make this work:

1. **Judgment validation** — agents get risk context that challenges the plan and the code *before* shipping.
2. **Durable learning** — solved problems stay solved. Your repo accumulates institutional knowledge across sessions, agents, and runtimes.
3. **Loop closure** — completed work produces better next work, stronger rules, and richer future context.

Every skill, hook, and CLI command exists to deliver one of these three. They form a single [lifecycle contract](https://github.com/boshu2/agentops/blob/main/docs/context-lifecycle.md), not separate features.

Operationally, that means AgentOps behaves like a software factory:

- briefings and startup context prepare the work order
- RPI runs the delivery line
- validation gates accept or reject output
- the flywheel turns completed work into future advantage

See [Software Factory Surface](https://github.com/boshu2/agentops/blob/main/docs/software-factory.md) for the explicit operator lane.

| Capability | What you get |
|-----|---------------|
| Judgment validation | `/pre-mortem` challenges your plan before build; `/vibe` + `/council` validate code before commit |
| Durable learning | Repo-native memory via `.agents/` — lessons compound across sessions, agents, and runtimes |
| Loop closure | Every cycle produces artifacts, issues, and next-work suggestions the next session acts on |

---

## Install

```bash
# Claude Code (recommended): marketplace + plugin install
claude plugin marketplace add boshu2/agentops
claude plugin install agentops@agentops-marketplace

# Codex CLI (0.110.0+ native plugin)
curl -fsSL https://raw.githubusercontent.com/boshu2/agentops/main/scripts/install-codex.sh | bash

# OpenCode
curl -fsSL https://raw.githubusercontent.com/boshu2/agentops/main/scripts/install-opencode.sh | bash

# Other Skills-compatible agents (agent-specific, install only what you need)
# Example (Cursor):
npx skills@latest add boshu2/agentops --cursor -g
```

On Linux, also install system `bubblewrap` so Codex uses it directly:

```bash
sudo apt-get install -y bubblewrap
```

### Install ao CLI (optional)

Skills work standalone. The `ao` CLI unlocks the full repo-native layer: knowledge extraction, retrieval and injection, maturity scoring, goals, and control-plane workflows.

#### Homebrew (recommended)

```bash
brew tap boshu2/agentops https://github.com/boshu2/homebrew-agentops
brew install agentops
which ao
ao version
```

Or install via [release binaries](https://github.com/boshu2/agentops/releases) or [build from source](cli/README.md).

Then type `/quickstart` in your agent chat.

In Claude Code, `CLAUDE.md` is the startup surface. Installed hooks stay
silent: `SessionStart` prepares runtime state and can stage factory goal or
briefing files, while `UserPromptSubmit` can capture first-prompt intake
without injecting additional context into the session.

---

## Start Here

Three commands, zero methodology. Pick one and go:

```bash
/council validate this PR          # Multi-model code review — immediate value
/research "how does auth work"     # Codebase exploration with memory
/implement "fix the login bug"     # Full lifecycle for one task
```

When you're ready for more:

```bash
/plan → /crank                     # Decompose into issues, parallel-execute
/rpi "add retry backoff"           # Full pipeline: research → plan → build → validate → learn
/evolve                            # Fitness-scored improvement loop — walk away, come back to better code
```

Every skill works alone. Compose them however you want. Full catalog: [Skills](#skills).

If you want the explicit operator lane instead of individual primitives:

```bash
ao factory start --goal "fix auth startup"
/rpi "fix auth startup"           # or: ao rpi phased "fix auth startup"
ao codex stop
```

That path keeps briefing, runtime startup, delivery, and loop closure on one surface. See [Software Factory Surface](https://github.com/boshu2/agentops/blob/main/docs/software-factory.md).

---

## How It Works

Each phase delivers one or more of the three capabilities — judgment, learning, loop closure:

| Phase | Primary skills | What you get |
|------|----------------|---------------------|
| Discovery | `/brainstorm` -> `/research` -> `/plan` -> `/pre-mortem` | Repo context, scoped work, known risks, execution packet |
| Implementation | `/crank` -> `/swarm` -> `/implement` | Closed issues, validated wave outputs, ratchet checkpoints |
| Validation + learning | `/validation` -> `/vibe` -> `/post-mortem` -> `/retro` -> `/forge` | Findings, learnings, next work, stronger prevention artifacts |

`/rpi` orchestrates all three phases. `/evolve` keeps running `/rpi` against `GOALS.md` so the worst fitness gap gets addressed next. The output is code + state + memory + gates.

The explicit CLI operator surface around that line is:

- `ao factory start` for briefing-first startup
- `/rpi` or `ao rpi phased` for delivery
- `ao codex stop` for explicit loop closure

| Pattern | Chain | When |
|---------|-------|------|
| **Quick fix** | `/implement` | One issue, clear scope |
| **Validated fix** | `/implement` → `/vibe` | One issue, want confidence |
| **Planned epic** | `/plan` → `/pre-mortem` → `/crank` → `/post-mortem` | Multi-issue, structured |
| **Full pipeline** | `/rpi` (chains all above) | End-to-end, autonomous |
| **Evolve loop** | `/evolve` (chains `/rpi` repeatedly) | Fitness-scored improvement |
| **PR contribution** | `/pr-research` → `/pr-plan` → `/pr-implement` → `/pr-validate` → `/pr-prep` | External repo |
| **Knowledge query** | `ao search` → `/research` (if gaps) | Understanding before building |
| **Standalone review** | `/council validate <target>` | Ad-hoc multi-judge review |

### Primitive chains underneath it

- **Mission and fitness**: `GOALS.md`, `ao goals`, `/evolve`
- **Discovery chain**: `/brainstorm` -> `ao search` / `ao lookup` -> `/research` -> `/plan` -> `/pre-mortem`
- **Execution chain**: `/crank` -> `/swarm` -> `/implement` -> `/vibe` -> ratchet checkpoints
- **Compiled prevention chain**: findings registry -> planning rules / pre-mortem checks / constraints -> later planning and validation
- **Continuity chain**: session hooks + phased manifests + `/handoff` + `/recover`

Each cycle adds new rules, learnings, and constraints — without anyone shipping new code. See [Primitive Chains](https://github.com/boshu2/agentops/blob/main/docs/architecture/primitive-chains.md) for the audited map.

### How Agent Memory Works

Session 50 starts with 50 sessions of accumulated wisdom.

`.agents/` is a directory in your repo that stores what your agents learned — as plain files. Grep replaces RAG. Plain text you can diff, review in PRs, and open in Obsidian.

```
┌──────────────────────────────────────────────────────────────────────────┐
│   Traditional Cache          .agents/ Knowledge Store                    │
│  ┌────────────────────┐    ┌──────────────────────────────────────────┐  │
│  │ Stores results     │    │ Stores extracted lessons                 │  │
│  │ Hit = skip compute │    │ Hit = skip the 2-hour debugging          │  │
│  │ Flat key-value     │    │ Hierarchical: learning → pattern → rule  │  │
│  │ Static after write │    │ Promotes through tiers over time         │  │
│  │ One consumer       │    │ Any agent, any runtime, any session      │  │
│  └────────────────────┘    └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

**How it compounds:** Session 1, your agent hits a timeout bug and spends 2 hours debugging. `/retro` captures the lesson. `/athena` promotes it to a pattern. Session 15, a new agent greps "timeout" and finds the answer in 2 operations — turning a 2-hour investigation into a 10-second lookup. Session 20, a planning rule gates plans that omit timeout checks. That's institutional knowledge that survives agent death.

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  1. WORK   │─>│  2. FORGE  │─>│  3. POOL   │─>│ 4. PROMOTE │
│  Session   │  │  Extract   │  │  Score &   │  │  Graduate  │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
     ^                                                │
     │         ┌────────────┐  ┌────────────┐         │
     └─────────│  6. INJECT │<─│5. LEARNINGS│<────────┘
               │  Surface   │  │  Permanent │
               └────────────┘  └────────────┘
```

```text
> /research "retry backoff strategies"

[lookup] 3 prior learnings found (freshness-weighted):
  - Token bucket with Redis (established, high confidence)
  - Rate limit at middleware layer, not per-handler (pattern)
  - /login endpoint was missing rate limiting (decision)
[research] Found prior art in your codebase + retrieved context
           Recommends: exponential backoff with jitter, reuse existing Redis client
```

Stale insights decay automatically. Useful ones compound.
Measure it with `ao flywheel status`.

| What it looks like | What it actually does |
|--------------------|----------------------|
| Markdown files | Knowledge scored by freshness, auto-decayed, and deduplicated |
| `grep` | Contextual retrieval with relevance scoring and phase-aware injection |
| Git commits | Provenance tracking, audit trail, diffable knowledge evolution |

Deep dive: [The Knowledge Flywheel](https://github.com/boshu2/agentops/blob/main/docs/knowledge-flywheel.md)

### Why engineers choose it

- **Your repo remembers everything.** Knowledge survives session resets, agent turnover, and runtime changes. Every session inherits every prior session's lessons.
- **Local-only** — all state lives on your disk. Grep it, diff it, review it in PRs.
- **Auditable** — plans, verdicts, learnings, and patterns are plain files. Open `.agents/` as an Obsidian vault for full browsability.
- **Multi-runtime** — Claude Code and Codex CLI (first-class), Cursor and OpenCode (experimental).
- **More stable** — tracked issues and validation gates anchor the repo across every session and every agent.

Everything is [open source](cli/) — audit it yourself.

---

## What I've Observed Using This

After five months of daily use across dozens of repos, a few things stuck:

- Agents are fast and surprisingly capable, but forgetful and inconsistent. A great prompt helps. Workflow helps more.
- The biggest gains came from giving agents the right context at the right time — targeted injection over prompt stuffing.
- Agents produce their best work on small, well-bounded tasks with clear ownership.
- Self-reported success is unreliable. Agents need tests, checks, and external validation.
- Parallel agents are powerful when each one has clear ownership and non-overlapping files.
- Raw chat history is noise. It becomes knowledge only when you distill it into rules, playbooks, and briefings.
- The real compounding effect: your environment gets smarter. The model stays the same; the context around it improves.

The git history tells its own story. Early commits are skill scaffolding — building `/research`, `/plan`, `/implement`. Later commits are meta-capabilities: session intelligence, quality signals, closure audits, prediction tracking. The system started spending more time improving itself and less time on raw features. That is the flywheel working.

Compressed into one sentence: good agent work comes from boundaries, validation, reusable lessons, and the right context.

Deep dive: [Philosophy](https://github.com/boshu2/agentops/blob/main/docs/philosophy.md)

---

<details>
<summary><b>OpenCode</b> — plugin + skills</summary>

Installs 7 hooks (tool enrichment, audit logging, compaction resilience) and symlinks all skills. Restart OpenCode after install. Details: [.opencode/INSTALL.md](.opencode/INSTALL.md)

</details>

<details>
<summary><b>Configuration</b> — environment variables</summary>

All optional. AgentOps works out of the box with no configuration. Full reference: [docs/ENV-VARS.md](https://github.com/boshu2/agentops/blob/main/docs/ENV-VARS.md)

</details>

**What AgentOps touches:**

| What | Where | Reversible? |
|------|-------|:-----------:|
| Skills | Global skill homes (`~/.agents/skills` for Codex/OpenAI-documented installs, plus compatibility caches outside your repo; for Claude Code: `~/.claude/skills/`) | `rm -rf ~/.claude/skills/ ~/.agents/skills/ ~/.codex/skills/ ~/.codex/plugins/cache/agentops-marketplace/agentops/` |
| Knowledge artifacts | `.agents/` in your repo (git-ignored by default) | `rm -rf .agents/` |
| Hook registration | `.claude/settings.json` | Delete entries from `.claude/settings.json` |

Nothing modifies your source code.

Troubleshooting: [docs/troubleshooting.md](https://github.com/boshu2/agentops/blob/main/docs/troubleshooting.md)

---

## See It Work

**1. One command** — validate a PR:

```text
> /council validate this PR

[council] 3 judges spawned (independent, no anchoring)
[judge-1] PASS — token bucket implementation correct
[judge-2] WARN — rate limiting missing on /login endpoint
[judge-3] PASS — Redis integration follows middleware pattern
Consensus: WARN — add rate limiting to /login before shipping
```

**2. Full pipeline** — research through post-mortem, one command:

```text
> /rpi "add retry backoff to rate limiter"

[research]    Found 3 prior learnings on rate limiting (injected)
[plan]        2 issues, 1 wave → epic ag-0058
[pre-mortem]  Council validates plan → PASS (knew about Redis choice)
[crank]       Parallel agents: Wave 1 ██ 2/2
[vibe]        Council validates code → PASS
[post-mortem] 2 new learnings → .agents/
[flywheel]    Next: /rpi "add circuit breaker to external API calls"
```

**3. The endgame** — `/evolve`: define goals, walk away, come back to a better codebase:

```text
> /evolve

[evolve] GOALS.md: 18 gates loaded, score 77.0% (14/18 passing)

[cycle-1]     Worst: wiring-closure (weight 6) + 3 more
              /rpi "Fix failing goals" → score 93.3% (25/28) ✓

              ── the agent naturally organizes into phases ──

[cycle-2-35]  Coverage blitz: 17 packages from ~85% → ~97% avg
              Table-driven tests, edge cases, error paths
[cycle-38-59] Benchmarks added to all 15 internal packages
[cycle-60-95] Complexity annihilation: zero functions >= 8
              (was dozens >= 20 — extracted helpers, tested independently)
[cycle-96-116] Modernization: sentinel errors, exhaustive switches,
              Go 1.26-compatible idioms (slices, cmp.Or, range-over-int)

[teardown]    203 files changed, 20K+ lines, 116 cycles
              All tests pass. Go vet clean. Avg coverage 97%.
              /post-mortem → 33 learnings extracted
              Ready for next /evolve — the floor is now the ceiling.
```

That ran overnight — ~7 hours, unattended. Regression gates auto-reverted anything that broke a passing goal. The agent naturally organized into the right order: build a safety net (tests), refactor aggressively (complexity), then polish.

<details>
<summary><b>More examples</b> — swarm, session continuity, different workflows</summary>

<br>

**Parallelize anything** with `/swarm`:

```text
> /swarm "research auth patterns, brainstorm rate limiting improvements"

[swarm] 3 agents spawned — each gets fresh context
[agent-1] /research auth — found JWT + session patterns, 2 prior learnings
[agent-2] /research rate-limiting — found token bucket, middleware pattern
[agent-3] /brainstorm improvements — 4 approaches ranked
[swarm] Complete — artifacts in .agents/
```

**Session continuity across compaction or restart:**
```text
> /handoff
[handoff] Saved: 3 open issues, current branch, next action
         Continuation prompt written to .agents/handoffs/

--- next session ---

> /recover
[recover] Found in-progress epic ag-0058 (2/5 issues closed)
          Branch: feature/rate-limiter
          Next: /implement ag-0058.3
```

**Different developers, different setups:**

| Workflow | Commands | What happens |
|----------|----------|-------------|
| **PR reviewer** | `/council validate this PR` | One command, actionable feedback |
| **Team lead** | `/research` → `/plan` → `/council validate` | Compose skills manually, stay in control |
| **Solo dev** | `/rpi "add user auth"` | Research through post-mortem, walk away |
| **Platform team** | `/swarm` + `/evolve` | Parallel pipelines + fitness-scored improvement loop |

</details>

Unsure which skill to run? See the [Skill Router](https://github.com/boshu2/agentops/blob/main/docs/SKILL-ROUTER.md).

---

## Skills

Every skill works alone. Compose them however you want.

**Core skills** — where most users spend their time:

| Skill | What it does |
|-------|-------------|
| `/council` | Independent judges (Claude + Codex) debate, surface disagreement, converge. The validation primitive everything else builds on. |
| `/research` | Deep codebase exploration — produces structured findings with memory |
| `/implement` | Full lifecycle for one task — research, plan, build, validate, learn |
| `/vibe` | Code quality review — complexity + multi-model council + domain checklists |
| `/evolve` | Measure goals, fix the worst gap, regression-gate everything, repeat overnight |

**Full catalog:**

<details>
<summary><b>Judgment</b> — the foundation everything validates against</summary>

| Skill | What it does |
|-------|-------------|
| `/council` | Independent judges (Claude + Codex) debate, surface disagreement, converge. Auto-extracts findings into flywheel. `--preset=security-audit`, `--perspectives`, `--debate` |
| `/vibe` | Code quality review — complexity + council + finding classification (CRITICAL vs INFORMATIONAL) + suppression framework + domain checklists (SQL, LLM, concurrency) |
| `/pre-mortem` | Validate plans — error/rescue mapping, scope modes (Expand/Hold/Reduce), temporal interrogation, prediction tracking with downstream correlation |
| `/post-mortem` | Wrap up work — council validates, prediction accuracy scoring (HIT/MISS/SURPRISE), session streak tracking, persistent retro history |

</details>

<details>
<summary><b>Execution</b> — research, plan, build, ship</summary>

| Skill | What it does |
|-------|-------------|
| `/research` | Deep codebase exploration — produces structured findings |
| `/plan` | Decompose a goal into trackable issues with dependency waves |
| `/implement` | Full lifecycle for one task — research, plan, build, validate, learn |
| `/crank` | Parallel agents in dependency-ordered waves, fresh context per worker |
| `/swarm` | Parallelize any skill — run research, brainstorms, implementations in parallel |
| `/rpi` | Full pipeline: discovery (research + plan + pre-mortem) → implementation (crank) → validation (vibe + post-mortem) |
| `/evolve` | The endgame: measure goals, fix the worst gap, regression-gate everything, learn, repeat overnight |

</details>

<details>
<summary><b>Knowledge</b> — the flywheel that makes sessions compound</summary>

| Skill | What it does |
|-------|-------------|
| `/retro` | Capture a decision, pattern, or lesson learned |
| `/forge` | Extract learnings from completed work into `.agents/` |
| `/flywheel` | Monitor knowledge health — velocity, staleness, pool depths |

</details>

<details>
<summary><b>Supporting skills</b> — onboarding, session, traceability, product, utility</summary>

| | |
|---|---|
| **Onboarding** | `/quickstart`, `/using-agentops` |
| **Session** | `/handoff`, `/recover`, `/status` |
| **Traceability** | `/trace`, `/provenance` |
| **Product** | `/product`, `/goals`, `/release`, `/readme`, `/doc` |
| **Utility** | `/brainstorm`, `/bug-hunt`, `/complexity` |

</details>

Full reference: [docs/SKILLS.md](https://github.com/boshu2/agentops/blob/main/docs/SKILLS.md)

<details>
<summary><b>Cross-runtime orchestration</b> — mix Claude, Codex, OpenCode</summary>

AgentOps orchestrates across runtimes. Claude can lead a team of Codex workers. Codex judges can review Claude's output.

| Spawning Backend | How it works | Best for |
|-----------------|-------------|----------|
| **Native teams** | `TeamCreate` + `SendMessage` — built into Claude Code | Tight coordination, debate |
| **Background tasks** | `Task(run_in_background=true)` — last-resort fallback | When no team APIs available |
| **Codex sub-agents** | `/codex-team` — Claude orchestrates Codex workers | Cross-vendor validation |

</details>

<details>
<summary><b>Custom agents</b> — why AgentOps ships its own</summary>

Two read-only agents fill the gap between Claude Code's `Explore` (no commands) and `general-purpose` (full write, expensive):

| Agent | Model | Can do | Best for |
|-------|-------|--------|----------|
| `agentops:researcher` | haiku | Read, search, run commands | `/research` exploration |
| `agentops:code-reviewer` | sonnet | Read, search, `git diff`, structured findings | `/vibe` code review |

Skills spawn these automatically — `/research` uses the researcher, `/vibe` uses the code-reviewer.

</details>

---

## Deep Dive

`.agents/` is an append-only ledger — every learning, verdict, pattern, and decision is a dated file. Write once, score by freshness, inject the best, prune the rest. The [formal model](https://github.com/boshu2/agentops/blob/main/docs/the-science.md) is cache eviction with freshness decay. Full lifecycle: [Context Lifecycle](https://github.com/boshu2/agentops/blob/main/docs/context-lifecycle.md).

<details>
<summary><b>Phase details</b> — what each step does</summary>

1. **`/research`** — Explores your codebase. Produces a research artifact with findings and recommendations.

2. **`/plan`** — Decomposes the goal into issues with dependency waves. Creates a [beads](https://github.com/steveyegge/beads) epic (git-native issue tracking).

3. **`/pre-mortem`** — Judges simulate failures before you write code. FAIL? Re-plan with feedback (max 3 retries).

4. **`/crank`** — Spawns parallel agents in dependency-ordered waves. Each worker gets fresh context. Lead validates and commits. `--test-first` for spec-first TDD.

5. **`/vibe`** — Judges validate the code. FAIL? Re-crank with failure context and re-vibe (max 3).

6. **`/post-mortem`** — Council validates the implementation. Retro extracts learnings. **Suggests the next `/rpi` command.**

`/rpi "goal"` runs all six end to end. Use `--interactive` for human gates at research and plan.

</details>

| Topic | Where |
|-------|-------|
| Phased RPI (fresh context per phase) | [How It Works](https://github.com/boshu2/agentops/blob/main/docs/how-it-works.md) |
| Parallel RPI (N epics in isolated worktrees) | [How It Works](https://github.com/boshu2/agentops/blob/main/docs/how-it-works.md) |
| Setting up `/evolve` (GOALS.md, fitness loop) | [Evolve Setup](https://github.com/boshu2/agentops/blob/main/docs/evolve-setup.md) |
| Science, systems theory, prior art | [The Science](https://github.com/boshu2/agentops/blob/main/docs/the-science.md) |

<details>
<summary><b>Built on</b> — Ralph Wiggum, Multiclaude, beads, CASS, MemRL</summary>

[Ralph Wiggum](https://ghuntley.com/ralph/) (fresh context per agent) · [Multiclaude](https://github.com/dlorenc/multiclaude) (validation gates) · [beads](https://github.com/steveyegge/beads) (git-native issues) · [CASS](https://github.com/Dicklesworthstone/coding_agent_session_search) (session search) · [MemRL](https://arxiv.org/abs/2601.03192) (cross-session memory)

</details>

---

## The `ao` CLI

The `ao` CLI adds the knowledge flywheel (extract, inject, decay, maturity) and terminal-based RPI that runs without an active chat session.

```bash
ao seed                                        # Plant AgentOps in any repo (auto-detects project type)
ao rpi loop --supervisor --max-cycles 1        # Canonical autonomous cycle (policy-gated landing)
ao rpi loop --supervisor "fix auth bug"        # Single explicit-goal supervised cycle
ao rpi phased --from=implementation "ag-058"   # Resume a specific phased run at build phase
ao rpi parallel --manifest epics.json          # Run N epics concurrently in isolated worktrees
ao rpi status --watch                          # Monitor active/terminal runs
```

Walk away, come back to committed code + extracted learnings.

```bash
ao search "query"              # Search session history and repo-local .agents/ knowledge
ao lookup --query "topic"      # Retrieve curated knowledge artifacts by relevance
ao notebook update             # Merge latest session insights into MEMORY.md
ao memory sync                 # Sync session history to MEMORY.md (cross-runtime: Codex, OpenCode)
ao context assemble            # Build 5-section context briefing for a task
ao feedback-loop               # Close the MemRL feedback loop (citation → utility → maturity)
ao metrics health              # Flywheel health: sigma, rho, delta, escape velocity
ao dedup                       # Detect near-duplicate learnings (--merge for auto-resolution)
ao contradict                  # Detect potentially contradictory learnings
ao demo                        # Interactive demo
```

`ao search` searches session history (via [CASS](https://github.com/Dicklesworthstone/coding_agent_session_search) if installed) and repo-local `.agents/` knowledge — learnings, patterns, findings, and research. Use `ao lookup` for curated knowledge artifacts by relevance.

<details>
<summary><b>Second Brain + Obsidian vault</b> — semantic search over all your sessions</summary>

`.agents/` is plain text — open it as an Obsidian vault for browsing and linking. For semantic search, pair with [Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) (local embeddings, MCP server for agent retrieval).

</details>

Full reference: [CLI Commands](cli/docs/COMMANDS.md)

---

## Architecture

One recursive shape at every scale:

```
/implement ── one worker, one issue, one verify cycle
    └── /crank ── waves of /implement (FIRE loop)
        └── /rpi ── research → plan → crank → validate → learn
            └── /evolve ── fitness-gated /rpi cycles
```

Each level treats the one below as a black box: spec in, validated result out. Workers get fresh context per wave, communicate through the filesystem, and never commit — the lead commits. See the [Ralph Wiggum Pattern](https://ghuntley.com/ralph/) for the rationale. Orchestrators stay in the main session; workers fork into subagents. See [`SKILL-TIERS.md`](skills/SKILL-TIERS.md) for the full classification.

| Topic | Where |
|-------|-------|
| Five pillars, operational invariants | [Architecture](https://github.com/boshu2/agentops/blob/main/docs/ARCHITECTURE.md) |
| Brownian Ratchet, Ralph Wiggum, context windowing | [How It Works](https://github.com/boshu2/agentops/blob/main/docs/how-it-works.md) |
| Orchestrator vs worker fork rules | [Skill Tiers](skills/SKILL-TIERS.md) |
| Injection philosophy, freshness decay, MemRL | [The Science](https://github.com/boshu2/agentops/blob/main/docs/the-science.md) |
| Primitive chains (audited map) | [Primitive Chains](https://github.com/boshu2/agentops/blob/main/docs/architecture/primitive-chains.md) |
| Context lifecycle, three-tier injection | [Context Lifecycle](https://github.com/boshu2/agentops/blob/main/docs/context-lifecycle.md) |

---

## How AgentOps Fits With Other Tools

| Alternative | What it does well | What AgentOps adds |
|-------------|-------------------|-------------------------------------|
| **[GSD](https://github.com/glittercowboy/get-shit-done)** | Clean subagent spawning, fights context rot | Cross-session memory — GSD keeps context fresh *within* a session; AgentOps carries knowledge *between* sessions |
| **[Compound Engineer](https://github.com/EveryInc/compound-engineering-plugin)** | Knowledge compounding, structured loop | Multi-model councils and validation gates — independent judges debating before and after code ships |

[Detailed comparisons →](https://github.com/boshu2/agentops/blob/main/docs/comparisons/)

---

## FAQ

[docs/FAQ.md](https://github.com/boshu2/agentops/blob/main/docs/FAQ.md) — comparisons, limitations, subagent nesting, PRODUCT.md, uninstall.

---

## Contributing

<details>
<summary><b>Issue tracking</b> — Beads / bd</summary>

Git-native issues in `.beads/`. `bd onboard` (setup) · `bd ready` (find work) · `bd show <id>` · `bd close <id>` · `bd vc status` (optional Dolt state check; JSONL auto-sync is automatic). More: [AGENTS.md](AGENTS.md)

</details>

See [CONTRIBUTING.md](https://github.com/boshu2/agentops/blob/main/docs/CONTRIBUTING.md). If AgentOps helped you ship something, post in [Discussions](https://github.com/boshu2/agentops?tab=discussions).

## License

Apache-2.0 · [Docs](https://github.com/boshu2/agentops/blob/main/docs/INDEX.md) · [Philosophy](https://github.com/boshu2/agentops/blob/main/docs/philosophy.md) · [How It Works](https://github.com/boshu2/agentops/blob/main/docs/how-it-works.md) · [FAQ](https://github.com/boshu2/agentops/blob/main/docs/FAQ.md) · [Glossary](https://github.com/boshu2/agentops/blob/main/docs/GLOSSARY.md) · [Architecture](https://github.com/boshu2/agentops/blob/main/docs/ARCHITECTURE.md) · [Configuration](https://github.com/boshu2/agentops/blob/main/docs/ENV-VARS.md) · [CLI Reference](cli/docs/COMMANDS.md) · [Changelog](https://github.com/boshu2/agentops/blob/main/docs/CHANGELOG.md)
