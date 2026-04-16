---
name: session-start
user-invocable: false
tags: [orchestration, initialization, analysis, alignment]
model-preference: opus
model-preference-codex: gpt-5.4
model-preference-cursor: claude-opus-4-6
description: >
  Full session initialization for any project repo. Autonomously analyzes git state,
  VCS issues, SSOT files, branches, environment, and cross-repo status. Then presents
  structured findings with recommendations for user alignment before creating a wave plan.
  Triggered by /session [housekeeping|feature|deep] command.
---

# Session Start Skill

## Soul

Before anything else, read and internalize `soul.md` in this skill directory. It defines WHO you are — your communication style, decision-making philosophy, and values. Every interaction in this session should reflect this identity. You are not a generic assistant; you are a seasoned engineering lead who drives outcomes.

## Phase 0: Bootstrap Gate

Read `skills/_shared/bootstrap-gate.md` and execute the gate check. If the gate is CLOSED, invoke `skills/bootstrap/SKILL.md` and wait for completion before proceeding. If the gate is OPEN, continue to Phase 1.

<HARD-GATE>
Do NOT proceed past Phase 0 if GATE_CLOSED. There is no bypass. Refer to `skills/_shared/bootstrap-gate.md` for the full HARD-GATE constraints.
</HARD-GATE>

## Phase 1: Read Session Config

Read and parse Session Config per `skills/_shared/config-reading.md`. Store result as `$CONFIG`.

## Phase 1.5: Session Continuity

> Skip this phase if `persistence` config is `false`.

Check for `<state-dir>/STATE.md` in the project root:

> Where `<state-dir>` is `.claude/` under Claude Code or `.codex/` under Codex CLI. See `skills/_shared/platform-tools.md` for details.

> **Ownership Reference:** See `skills/_shared/state-ownership.md` for the STATE.md ownership contract, schema, and guards.

Before reading STATE.md contents, validate the branch field:
- If STATE.md's `branch` does not match `git rev-parse --abbrev-ref HEAD`, log: "⚠ STATE.md from branch [X], current branch is [Y] — treating as stale." Skip to step 2 (treat as if STATE.md does not exist).

1. **STATE.md exists** — read it and inspect the `status` field:
   - `status: active` — previous session crashed or was interrupted. Use the AskUserQuestion tool to present: "Found unfinished session from [started_at]. [N] waves completed. Resume or start fresh?" with options to resume the previous plan or start a new session.
   - `status: paused` — session was intentionally paused. Use AskUserQuestion to offer resuming from the pause point or starting fresh.
   - `status: completed` — previous session ended cleanly. Note the summary for context (what was done, what was deferred) but continue with normal initialization.
2. **STATE.md does not exist** — first session or persistence was previously off. Continue normally.

Also read `<state-dir>/STATUS.md` if it exists for additional project-level context.

## Phase 1.6: Metrics Initialization

> Skip if `persistence` config is `false`.

1. Ensure '.orchestrator/metrics/' directory exists in the project root (create if missing). For backward compatibility with pre-v2.0 sessions, also check the platform's legacy metrics directory (`<state-dir>/metrics/` where `<state-dir>` is `.claude/`, `.codex/`, or `.cursor/` per platform).
2. If '.orchestrator/metrics/sessions.jsonl' exists, count lines to determine number of previous sessions. If not found, check `<state-dir>/metrics/sessions.jsonl` as a platform-specific legacy fallback.
3. Store the count for display in Phase 7 — this feeds the Historical Trends section

## Phase 2: Git Analysis (parallel)

Run these checks in parallel using Bash:

1. **Branch state**: `git branch -a`, current branch, ahead/behind origin
2. **Recent commits**: `git log --oneline -N` where N is read from `recent-commits` config (default: 20) — identify last session's work by commit patterns
3. **Unpushed/uncommitted**: `git status --short` + `git log origin/main..HEAD --oneline`
4. **Open branches**: list all local branches, identify which are mergeable to develop/main
5. **Stale branches**: branches with no commits in more than `stale-branch-days` (default: 7) days

## Phase 3: VCS Deep Dive (parallel)

> **VCS Reference:** Detect the VCS platform per the "VCS Auto-Detection" section of the gitlab-ops skill.
> Use CLI commands per the "Common CLI Commands" section. For cross-project queries, see "Dynamic Project Resolution."

Using the detected VCS CLI, query (reading `issue-limit` from Session Config, default: 50):

1. **Open issues** — categorize by priority and status labels
2. **Recently closed** — what was done since last session
3. **Milestones** — active sprint status
4. **Open MRs/PRs** — anything waiting for review/merge
5. **Pipeline/CI status** — is CI green?

Group issues by:
- `priority:critical` / `priority:high` — must-address
- `status:ready` — ready to work on
- Session-type relevance (housekeeping tasks vs feature tasks vs deep-work tasks)

## Phase 4: SSOT & Environment Check

1. **SSOT freshness**: for each file in `ssot-files` config, check last modified date. Flag if older than `ssot-freshness-days` (default: 5) days.
2. **Quality baseline**: Run Baseline quality checks per the quality-gates skill. Read `test-command`, `typecheck-command`, and `lint-command` from Session Config (defaults: `pnpm test --run`, `tsgo --noEmit`, `pnpm lint`). Report results but do not block the session.
3. **Pencil design status**: if `pencil` is configured, verify the `.pen` file exists at the configured path. Report: "Pencil design configured at [path] — design-code alignment reviews will run after Impl-Core and Impl-Polish waves." If file not found, warn: "Pencil path configured but file not found at [path]."
4. **Plugin freshness**: Determine the session-orchestrator plugin directory (navigate up from this skill's base directory to the plugin root). Run `git -C <plugin-dir> log -1 --format="%ci"` to get the last commit date. If older than `plugin-freshness-days` (default: 30) days, flag a warning in the Session Overview: `"⚠ Session Orchestrator plugin last updated [N] days ago — consider pulling the latest version."` Non-blocking — present in overview, don't halt.

## Phase 5: Cross-Repo Status (if configured)

For each repo in `cross-repos`:
1. `cd ~/Projects/<repo> && git log --oneline -5 && git status --short`
2. Check for open issues that reference this repo
3. Note any branches that should be merged

## Phase 6: Pattern Recognition

Look across the gathered data for:
- **Recurring patterns**: same types of issues appearing repeatedly → suggest standardization
- **Blocking chains**: issues blocked by other issues across repos
- **Quick wins**: low-effort issues that could be closed alongside main work
- **Staleness**: issues open longer than `stale-issue-days` (default: 30) days without progress → flag for triage
- **Synergies**: issues that share code paths and can be combined

## Phase 6.5: Memory Recall

> Skip this phase if `persistence` config is `false`.

> **Platform Note:** Session memory files at `~/.claude/projects/` are a Claude Code feature. On Codex CLI and Cursor IDE, skip this phase — per-project memory persistence is not available on those platforms.

Surface context from previous sessions:

1. Look for session memory files at `~/.claude/projects/<project>/memory/session-*.md`
2. Read the 2–3 most recent files (by filename date, newest first)
3. Extract relevant context: what was accomplished, what was carried over as unfinished, what patterns or warnings were noted
4. If the `memory-cleanup-threshold` has been reached (number of session-*.md files >= threshold), include a note in the Session Overview: "Consider running `/memory-cleanup` — [N] session memory files accumulated."
5. Incorporate surfaced context into the Session Overview under a **Previous Sessions** subsection (e.g., recent accomplishments, deferred items, recurring patterns)

## Phase 6.6: Project Intelligence

> Skip if `persistence` config is `false` or `.orchestrator/metrics/learnings.jsonl` does not exist. If the canonical file is absent and a legacy `<state-dir>/metrics/learnings.jsonl` still exists, do not read it — direct the user to run `scripts/migrate-legacy-learnings.sh` once to migrate.

Read `.orchestrator/metrics/learnings.jsonl` and surface active learnings (confidence > 0.3, not expired):

1. Apply cap + rank (#88): sort active learnings by `confidence` DESC, then `created_at` DESC as tiebreaker. Slice to the first `learnings-surface-top-n` entries (default 15). Only the surfaced subset is used for the grouping below. Record the full pre-cap active count `M` (confidence > 0.3, not expired) and the surfaced count `N` for the Surface Health section.
2. Group learnings by type:
   - **Fragile files**: "These files have been problematic: [list with confidence scores]"
   - **Effective sizing**: "Previous sessions suggest [N] agents for [scope type]"
   - **Recurring issues**: "Watch for: [issue patterns with frequency]"
   - **Scope guidance**: "Sessions with [N] issues typically [outcome]"

### Surface health

Present a Surface Health block immediately after the per-type grouping, before the Project Intelligence section. Use the values computed in step 1 (`M` = active count pre-cap, `N` = surfaced count = `learnings-surface-top-n`):

1. Compute confidence buckets across the full active set (M entries, confidence > 0.3, not expired):
   - **High** (≥ 0.7): count entries with `confidence >= 0.7`
   - **Medium** (0.5–0.69): count entries with `confidence >= 0.5 and < 0.7`
   - **Low** (< 0.5, above filter threshold): count entries with `confidence > 0.3 and < 0.5`

2. Present the block using this template (substitute `{M}`, `{N}`, `{M - N}`, bucket counts, oldest values, and paths):

   ```
   **Project Intelligence — Surface Health**
   Active learnings: {M}  (high: {high-count} / medium: {med-count} / low: {low-count})
   Surfaced this session: {N}  |  Suppressed: {M - N}
   Oldest surfaced: {oldest-created_at ISO 8601} ({relative-age} days ago)
   Source file: .orchestrator/metrics/learnings.jsonl
   Vault mirror: {vault-dir value from Session Config, or "not enabled" if absent/empty}
   ```

3. Oldest surfaced entry: find the entry among the top-N surfaced learnings with the smallest `created_at` value. Display the raw ISO 8601 timestamp and compute relative age as `floor((current_date - created_at) / 86400)` days.

4. Vault mirror: read `vault-integration.vault-dir` from Session Config (`echo "$CONFIG" | jq -r '."vault-integration"."vault-dir" // empty'`). If the value is absent or empty, print `"not enabled"`.

5. **Conditional advisory** — print the following line only when `{M - N} > {N}` (i.e., suppressed count exceeds surfaced count):
   > ⚠ More learnings are suppressed ({M - N}) than surfaced ({N}). Consider raising `learnings-surface-top-n` in Session Config or running `/evolve review` to prune low-value entries.
   Do NOT print the advisory when `{M - N} <= {N}`.

3. Include a **Project Intelligence** section in the Phase 7 presentation:
   ```
   ## Project Intelligence (from [N] learnings)
   - Fragile: [files] (confidence: [X])
   - Sizing: [recommendation]
   - Watch: [recurring issues]
   - Scope: [guidance]
   ```
   If no active learnings exist, display: "No project intelligence yet — learnings accumulate after 2+ sessions."

4. **Effectiveness analysis** (requires 5+ sessions in `sessions.jsonl`):

   > Skip if `.orchestrator/metrics/sessions.jsonl` does not exist or has fewer than 5 entries.

   Read `.orchestrator/metrics/sessions.jsonl` and compute:
   - **Completion rate trend**: average `effectiveness.completion_rate` over last 5 sessions
     - If < 0.6: "Completion rate is [X]%. Consider reducing scope or using deep sessions."
     - If > 0.9: "Consistently high completion. Current scope sizing works well."
   - **Discovery probe value**: for sessions with `discovery_stats`, check each category in `by_category`:
     - If `findings == 0` across 3+ sessions: "Probe category '[X]' has produced no findings in [N] sessions. Consider excluding via `discovery-probes` config."
     - If `findings > 5` consistently but issues are rarely created from that category: "Probe category '[X]' generates many findings ([avg]) but few lead to issues. Consider raising `discovery-severity-threshold` or `discovery-confidence-threshold`."
   - **Carryover pattern**: if `effectiveness.carryover / planned_issues > 0.3` across 3+ sessions:
     "High carryover rate ([X]%). Consider: smaller scope, longer sessions (deep), or splitting across sessions."

   If fewer than 5 sessions exist: "Effectiveness analysis: not enough data yet ([N]/5 sessions)."

   Include effectiveness insights in the **Project Intelligence** section of the Phase 7 presentation:
   ```
   ## Project Intelligence (from [N] learnings, [M] sessions)
   - Fragile: [files] (confidence: [X])
   - Sizing: [recommendation]
   - Watch: [recurring issues]
   - Scope: [guidance]
   - Effectiveness: [completion rate trend, probe value, carryover pattern]
   ```

## Phase 7: Research (session type dependent)

> **Note:** Implementation-specific research (library APIs, best practices for specific code changes) is deferred to session-plan, which knows the exact scope. Session-start focuses on state analysis.

**For `feature` and `deep` sessions:**
- Check SSOT files for established patterns relevant to the recommended focus
- Review any tech stack changes since last session (dependency updates, new tooling)
- ALWAYS verify current state in actual code — never assume based on memory or SSOT alone

**For `housekeeping` sessions:**
- Focus on git cleanup, documentation currency, CI health
- Skip deep research — prioritize operational tasks
- Run token efficiency check: `bash "${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-$PLUGIN_ROOT}}/scripts/token-audit.sh"` and include findings in Session Overview. Flag any HIGH/WARN items as recommended housekeeping tasks.

## Phase 8: Structured Presentation & Q&A

Read `presentation-format.md` in this skill directory for the output structure, templates, and AskUserQuestion examples.

Present your findings following that structure. Key rules:
- **MANDATORY: Use a structured choice flow** — AskUserQuestion on Claude Code, numbered Markdown options on Codex/Cursor
- Always include your recommendation as the first option with "(Recommended)" in the label

## Phase 9: Handoff to Session Plan

After user alignment:
1. Invoke the **session-plan** skill with the agreed scope
2. The session-plan skill will decompose tasks into waves and present the execution plan

## Anti-Patterns

- **DO NOT** skip Phase 1 and jump straight to analysis — Session Config drives everything, missing it means wrong defaults
- **DO NOT** present raw data dumps without recommendations — the user expects opinionated analysis, not a wall of text
- **DO NOT** assume issue status from titles or labels alone — always check the actual VCS API for current state
- **DO NOT** run blocking quality gates (Full Gate) during session-start — that's the Quality wave's job. Baseline checks (non-blocking, informational) in Phase 4 are fine.

## Critical Rules

- **NEVER make assumptions** about code state based on memory or docs — always verify in actual files
- **NEVER skip the Q&A phase** — the user MUST confirm direction before wave planning
- **ALWAYS use `run_in_background: false`** for parallel subagent work — wait for completion
- **ALWAYS check `.env` or `.env.local`** for VCS host, API keys, and service URLs
- **ALWAYS present options with pros/cons and a clear recommendation** — never just list facts
- **ALWAYS update VCS issue status** when claiming work — use the issue update command per the "Common CLI Commands" section of the gitlab-ops skill
- **For Pencil designs**: use the `filePath` parameter, work only on new designs, treat completed ones as done
- **For cross-repo work**: always check the actual state of related repos, don't assume from memory

## Sub-File Reference

| File | Purpose |
|------|---------|
| `soul.md` | Identity and communication principles |
| `presentation-format.md` | Phase 7 output templates and AskUserQuestion examples |
