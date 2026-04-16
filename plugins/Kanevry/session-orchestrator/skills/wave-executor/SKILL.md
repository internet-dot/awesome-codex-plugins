---
name: wave-executor
user-invocable: false
tags: [orchestration, execution, agents, waves]
model-preference: sonnet
model-preference-codex: gpt-5.4-mini
model-preference-cursor: claude-sonnet-4-6
description: >
  Executes the agreed session plan in waves with role-based execution and parallel subagents. Handles inter-wave
  quality checks, plan adaptation, and progress tracking. Core orchestration engine for
  feature and deep sessions. Triggered by /go command.
---

# Wave Executor Skill

## Execution Model

You are the **coordinator**. You do NOT implement — you orchestrate. Your job:
1. Dispatch subagents for each wave
2. Wait for ALL agents in a wave to complete
3. Review their outputs
4. Adapt the plan if needed
5. Dispatch the next wave
6. Repeat until all waves complete

## Design Philosophy

This harness exists to enable multi-agent coordination at scale — not by removing friction, but by making it visible, classifiable, and recoverable.

The wave-executor is process scaffolding around LLM agents. It handles task breakdown, scope enforcement, circuit breaker guards, and recovery patterns. Unlike direct chat with an agent, it trades flexibility for safety and repeatability across a bounded execution envelope.

Every harness creates friction. The goal is not minimum friction — it is useful friction that prevents higher-cost problems downstream.

**Friction we accept:**
- Wave planning overhead and `wave-scope.json` pre-dispatch setup
- Per-wave quality gates before proceeding
- Worktree isolation costs for parallel agents
- Turn-limit constraints that stop runaway agents early

**Friction we prevent:**
- Agent scope violations (PreToolUse hooks block out-of-scope file edits)
- Cascading failures (circuit breaker + spiral detection halt broken agents before they propagate damage)
- Silent partial completion (STATUS line requirement forces explicit reporting)
- Untracked carryover work (session-end plan verification catches unresolved tasks)

The harness does not hope agents self-correct. It detects stagnation patterns — pagination-spiral, turn-key-repetition, error-echo — classifies them into the Error-Class Taxonomy defined in `circuit-breaker.md`, and re-scopes mechanically. Review logic lives in `wave-loop.md` § "Review Agent Outputs".

## Platform Note

> State files live in the platform's native directory: `.claude/` for Claude Code, `.codex/` for Codex CLI, `.cursor/` for Cursor IDE. All references to `.claude/` below should use the platform's state directory. Shared metrics (sessions.jsonl, learnings.jsonl) live in `.orchestrator/metrics/` — both platforms read and write there. See `skills/_shared/platform-tools.md` for tool mappings.

## Phase 0: Bootstrap Gate

Read `skills/_shared/bootstrap-gate.md` and execute the gate check. If the gate is CLOSED, invoke `skills/bootstrap/SKILL.md` and wait for completion before proceeding. If the gate is OPEN, continue to the Pre-Execution Check.

> **Session-start only:** This gate check runs ONCE at the start of `/go` execution — before the first wave. It does NOT run before each wave step. Repeating the check per wave would add latency with no safety benefit, since `bootstrap.lock` is immutable within a session.

<HARD-GATE>
Do NOT proceed past Phase 0 if GATE_CLOSED. There is no bypass. Refer to `skills/_shared/bootstrap-gate.md` for the full HARD-GATE constraints.
</HARD-GATE>

## Pre-Execution Check

Before starting the first wave (Discovery role):
1. `git status --short` — ensure clean working directory (commit or stash if needed)
2. Verify no parallel session conflicts (unexpected modified files)
3. Confirm the agreed plan is still valid (no new critical issues since planning)
4. **Verify `jq` is installed** — run `command -v jq`. If not found, warn the user: "⚠ jq is not installed. Scope and command enforcement hooks will be DISABLED. Install jq (`brew install jq` / `apt install jq`) to enable security enforcement." Do NOT proceed with waves until user acknowledges.
5. **Read Session Config**: Parse Session Config per `skills/_shared/config-reading.md`. Store result as `$CONFIG`. Extract these fields:
   - `persistence` (default: true), `enforcement` (default: warn), `isolation` (default: auto)
   - `agents-per-wave` (default: 6), `max-turns` (default: auto), `pencil` (default: null)
   
   **Execution Config shortcut:** If the session-plan output contains an `### Execution Config` section, its execution-level fields (waves, agents-per-wave, isolation, enforcement, max-turns) take precedence over `$CONFIG`. Session-level fields (persistence, pencil) always come from `$CONFIG`. If the Execution Config section is missing, use `$CONFIG` alone.
6. **Initialize session metrics** (if `persistence` enabled): Prepare a metrics tracking object for this session:
   - `session_id`: `<branch>-<YYYY-MM-DD>-<HHmm>` (HHmm from `started_at` — ensures uniqueness across multiple sessions per day)
   - `session_type`: from Session Config
   - `started_at`: ISO 8601 timestamp
   - `waves`: empty array (populated after each wave)
   This object lives in memory during execution — it is written to disk by session-end.

## Pre-Execution: User Instructions

If the user provided additional instructions with `/go` (e.g., `/go focus on API endpoints`), apply them as a priority modifier:

1. **Incorporate into agent prompts**: Add a "**Priority Focus:**" section to each agent's prompt that includes the user's instructions verbatim
2. **Do NOT override the plan**: User instructions adjust emphasis within the existing plan, they do not replace it. If the instructions conflict with the plan, note the conflict and follow the plan.

Example: If user said `/go focus on API endpoints`, each agent prompt includes:
```
**Priority Focus (from user):** focus on API endpoints
```

## Pre-Wave 1a: Capture Session Start Ref

Before dispatching Wave 1, capture the current commit as the session baseline:

```bash
SESSION_START_REF=$(git rev-parse HEAD)
```

Store this value for use throughout the session — it is needed by the simplification pass (Quality wave) and session-reviewer dispatch to determine which files changed during this session. Include it in the coordinator's context, NOT in individual agent prompts.

## Pre-Wave 1b: Initialize STATE.md

> Skip this section entirely if `persistence: false`.

Before dispatching Wave 1, write `<state-dir>/STATE.md` with YAML frontmatter and Markdown body:

```yaml
---
schema-version: 1
session-type: feature|deep|housekeeping
branch: <current branch>
issues: [<issue numbers from plan>]
started_at: <ISO 8601 timestamp with timezone>
status: active
current-wave: 0
total-waves: <from session plan>
---
```

```markdown
## Current Wave

Wave 0 — Initializing

## Wave History

(none yet)

## Deviations

(none yet)
```

Create the `<state-dir>` directory if needed (`mkdir -p <state-dir>`) before writing. This file is the persistent state record — other skills and resumed sessions read it.

> **Ownership:** STATE.md is owned by the wave-executor. Only the wave-executor writes to it (initialization + post-wave updates). session-end reads it for metrics extraction and sets `status: completed`. session-start reads it only for continuity checks (Phase 0.5). No other skill should write to STATE.md.

## Wave Execution Loop

Read and follow `wave-loop.md` in this skill directory for the complete wave execution loop, including agent dispatch, output review, plan adaptation, progress updates, and scope manifest creation.

## Circuit Breaker & Worktree Isolation

> **Reference:** See `circuit-breaker.md` in this skill directory for MaxTurns enforcement, spiral detection, recovery protocol, and worktree isolation configuration. Apply those rules during every wave dispatch and post-wave review.

## Agent Prompt Best Practices

Each agent prompt MUST include:

1. **Clear scope boundary**: "You are working on [X]. Do NOT modify files outside [paths]."
2. **Full context**: file paths, current code structure, issue description
3. **Acceptance criteria**: measurable definition of done
4. **Rule references**: "Follow patterns in <state-dir>/rules/[relevant].md"
5. **Testing expectation**: "Write tests for your changes" or "Run existing tests"
6. **Commit instruction**: "Do NOT commit. The coordinator handles commits."
7. **Turn limit**: Include the maxTurns instruction from `circuit-breaker.md`

Each agent prompt MUST NOT include:
- References to other agents' tasks (isolation)
- Vague instructions like "improve" or "optimize" without specifics
- Assumptions about code state — provide the actual state

## Session Type Behavior

### Housekeeping Sessions

Housekeeping sessions use a simplified single-wave execution model instead of the multi-wave role-based dispatch:

1. Initialize STATE.md as normal (`session-type: housekeeping`, `total-waves: 1`)
2. Do NOT create `wave-scope.json` — scope enforcement is not needed for low-risk housekeeping tasks
3. Dispatch tasks serially with 1-2 agents per task
4. Run Baseline quality checks after all tasks complete (not between tasks)
5. Skip session-reviewer dispatch — housekeeping changes are low-risk
6. Update STATE.md to `status: completed` when done
7. Proceed directly to session-end (`/close`)

Focus: git cleanup, SSOT refresh, CI fixes, branch merges, documentation.
End with a single commit summarizing all housekeeping work.

### Feature Sessions
- Full wave execution (5 roles mapped to configured wave count)
- 4-6 agents per wave (read from Session Config)
- Balance between implementation speed and quality

### Deep Sessions
- Full wave execution (5 roles mapped to configured wave count)
- Up to 10-18 agents per wave (read from Session Config)
- Extra emphasis on Discovery role and Quality role
- May include security audits, performance profiling, architecture refactoring

## Error Recovery

| Situation | Action |
|-----------|--------|
| Agent times out | Re-dispatch with smaller scope |
| Agent produces broken code | Add fix task to next wave |
| Tests fail after wave | Diagnose in next wave, don't skip |
| Merge conflict between agents | Resolve manually, document |
| TypeScript errors introduced | Track count, run Full Gate per quality-gates by Quality wave |
| New critical issue discovered | Inform user, add to Impl-Polish+ roles if fits scope |
| Agent edits wrong files | Revert via git, re-dispatch with stricter scope |

## Completion

After the Finalization wave completes successfully:
1. Report final status to the user
2. Suggest invoking `/close` to finalize the session
3. Do NOT auto-commit — `/close` handles that with proper verification

## Anti-Patterns

- **NEVER** run `run_in_background: true` during waves — you lose coordination ability
- **NEVER** skip inter-wave review — quality degrades exponentially
- **NEVER** let agents commit independently — coordinator commits at session end
- **NEVER** continue to next wave if previous wave has unresolved failures
- **NEVER** dispatch more agents than configured in `agents-per-wave`
- **NEVER** let wave execution run without reporting progress to the user
