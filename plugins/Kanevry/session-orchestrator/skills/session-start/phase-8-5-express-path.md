# Phase 8.5: Express Path Evaluation (#214)

> Project-instruction file resolution: `CLAUDE.md` and `AGENTS.md` (Codex CLI) are transparent aliases — see [skills/_shared/instruction-file-resolution.md](../_shared/instruction-file-resolution.md). All references to `CLAUDE.md` below apply to whichever file the repo uses.

After the user confirms the session type and scope via the Q&A above, evaluate whether the **Express Path** applies before handing off to session-plan. The express path collapses the full 5-wave plan into a single coordinator-direct phase for lightweight sessions.

**Activation conditions (ALL three must be true):**

1. `express-path.enabled` is `true` in Session Config (default: `true` — opt-in by default, opt-out via `express-path.enabled: false`).
2. Session type is `housekeeping` (the user confirmed `housekeeping` in Phase 8).
3. Agreed issue scope is ≤ 3 issues AND no parallel agents are required (i.e., tasks are sequential, no wave decomposition needed).

**Backward compat:** when `express-path.enabled: false`, this evaluation is skipped entirely and the normal 5-wave session-plan flow runs as before.

**Historical context:** The 13 prior coordinator-direct sessions documented in `CLAUDE.md` (or `AGENTS.md` on Codex CLI; 2026-04 series — vault-mirror GH#31, phased-rollout #307, v3.2.0 release, etc.) were all running this pattern implicitly: no wave decomposition, coordinator executes tasks directly in sequence. This phase codifies what was already proven to work.

**When Express Path activates:**

Emit the following banner immediately after the Phase 8 Q&A resolves:

```
Express path activated — <N> tasks, coordinator-direct, no inter-wave checks.
```

Then **skip the handoff to session-plan entirely**. Instead, execute the agreed tasks directly as the coordinator:

1. For each agreed task (in dependency order): execute as a direct coordinator action — read files, make changes, run quality checks inline.
2. After all tasks complete, invoke `skills/session-end/SKILL.md` directly (bypass session-plan and wave-executor).
3. Log the express-path activation in STATE.md `## Deviations` section: `Express path: N tasks executed coord-direct (express-path.enabled: true, session-type: housekeeping, scope: N issues)`.

**When Express Path does NOT activate** (conditions not met):

Proceed normally to Phase 9 (session-plan handoff). The express-path evaluation is a silent no-op when any condition fails.

**Condition examples:**

| Scenario | Activates? | Reason |
|---|---|---|
| `housekeeping`, 2 issues, `express-path.enabled: true` | Yes | All 3 conditions met |
| `housekeeping`, 4 issues, `express-path.enabled: true` | No | Scope > 3 |
| `feature`, 2 issues, `express-path.enabled: true` | No | Not housekeeping |
| `housekeeping`, 2 issues, `express-path.enabled: false` | No | Opted out |
| `housekeeping`, 3 issues needing parallel agents, `express-path.enabled: true` | No | Parallel agents needed |
