---
name: session-end
user-invocable: false
tags: [orchestration, verification, commits, issues]
model-preference: sonnet
model-preference-codex: gpt-5.4-mini
model-preference-cursor: claude-sonnet-4-6
description: >
  Full session close-out: verifies all planned work against the agreed plan, creates issues
  for gaps, runs quality gates, commits cleanly, mirrors to GitHub, and produces a session
  summary. Triggered by /close command.
---

# Session End Skill

> **Platform Note:** State files (STATE.md, wave-scope.json) live in the platform's native directory: `.claude/` (Claude Code), `.codex/` (Codex CLI), or `.cursor/` (Cursor IDE). All references to `.claude/` below should use the platform's state directory. Shared metrics live in `.orchestrator/metrics/`. See `skills/_shared/platform-tools.md`.

## Phase 0: Bootstrap Gate

Read `skills/_shared/bootstrap-gate.md` and execute the gate check. If the gate is CLOSED, invoke `skills/bootstrap/SKILL.md` and wait for completion before proceeding. If the gate is OPEN, continue to Phase 1.

<HARD-GATE>
Do NOT proceed past Phase 0 if GATE_CLOSED. There is no bypass. Refer to `skills/_shared/bootstrap-gate.md` for the full HARD-GATE constraints.
</HARD-GATE>

## Phase 1: Plan Verification

Read back the session plan that was agreed at the start. For EACH planned item:

### 1.1 Done Items
- **Verify with evidence**: read the changed files, check git diff, run relevant test
- Confirm acceptance criteria are met
- Mark as completed

### 1.2 Partially Done Items
- Document what was completed and what remains
- Create a VCS issue for the remaining work with:
  - Title: `[Carryover] <original task description>`
  - Labels: `priority:<original>`, `status:ready`
  - Description: what's done, what's left, context for next session
- Link to original issue if applicable

### 1.3 Not Started Items
- Document WHY (blocked? de-scoped? out of time?)
- If still relevant: ensure original issue remains `status:ready`
- If no longer relevant: close with comment explaining why

### 1.4 Emergent Work
- Tasks that were NOT in the plan but were done (fixes, discoveries)
- Document and attribute to relevant issues
- If new issues were identified: create them on the VCS platform

### 1.5 Discovery Scan (if enabled)

Read `skills/session-end/discovery-scan.md` for embedded discovery dispatch and findings triage.

### 1.6 Safety Review

> Skip if `persistence` is `false` in Session Config (STATE.md won't exist).

Review safety metrics from the session. This is informational — it does NOT block the session close.

1. Read `<state-dir>/STATE.md` to extract:
   - **Circuit breaker activations**: agents that hit maxTurns (`PARTIAL`), agents that spiraled (`SPIRAL`), agents that failed (`FAILED`)
   - **Worktree status**: which agents used worktree isolation, any fallbacks or merge conflicts
2. Read enforcement hook logs from stderr (if captured): count of scope violations blocked/warned, command violations blocked/warned
3. Summarize:
   ```
   Safety review:
   - Agents: [X] complete, [Y] partial (hit turn limit), [Z] spiral/failed
   - Enforcement: [N] scope violations, [M] command blocks
   - Isolation: [K] agents in worktrees, [J] fallbacks
   ```
4. If any agents were `SPIRAL` or `FAILED`, ensure carryover issues exist (cross-reference with Phase 1.2)

5. **Carryover validation fallback (#261):** Walk each Wave History entry in STATE.md. For every agent whose status is `SPIRAL` or `FAILED`, check whether the line ends with a `→ issue #NNN` suffix (or `→ existing #NNN`). If the suffix is absent, the auto-create call in wave-executor did not run (e.g. the session crashed before dispatch completed, or the CLI was offline at detection time). Retroactively file the carryover via `createSpiralCarryoverIssue`:

   ```js
   import { createSpiralCarryoverIssue } from '${PLUGIN_ROOT}/scripts/lib/spiral-carryover.mjs';

   // For each SPIRAL/FAILED agent missing the "→ issue #NNN" suffix:
   const result = await createSpiralCarryoverIssue({
     taskDescription: '<agent task from Wave History>',
     kind: 'SPIRAL', // or 'FAILED'
     context: '<Deviations / error context from STATE.md>',
     priority: 'high',
     vcs: '<from Session Config>'
   });
   // result.created → note new issue id in Final Report under "New Issues Created"
   // result.skipped === 'duplicate' → an earlier session already filed one; record the existing id
   // result.skipped === 'error' → log in Final Report as "⚠ carryover filing failed for <task>: <error>" and continue (do NOT block close)
   ```

   The module is idempotent via its task-hash dedup marker, so re-running the fallback across sessions will not create duplicates.

### 1.7 Metrics Collection

Read `skills/session-end/metrics-collection.md` for JSONL schema and conditional field rules.

### 1.8 Session Review

Dispatch the session-reviewer agent to verify implementation quality before the quality gate:

> On Codex CLI, dispatch via the `session-reviewer` agent role defined in `.codex-plugin/agents/session-reviewer.toml`.

1. Invoke `subagent_type: "session-orchestrator:session-reviewer"` with:
   - **Scope**: all files changed this session (from `git diff --name-only` against the base branch)
   - **Context**: the session plan (issues, acceptance criteria) and all wave results from STATE.md
2. Wait for the reviewer's **Verdict**:
   - **PROCEED** — continue to Phase 2
   - **FIX REQUIRED** — address each listed item before proceeding. For quick fixes (<2 min each), fix inline. For larger items, create carryover issues (same as Phase 1.2) and note them as unresolved review findings in the Final Report

## Phase 2: Quality Gate

> **Verification Reference:** See `verification-checklist.md` in this skill directory for the full quality gate checklist.

Run ALL checks listed in the verification checklist. If any check fails: fix if quick (<2 min), otherwise create a `priority:high` issue. Do NOT commit broken code.

### 2.1 Vault Validation (if configured)

Read `skills/session-end/vault-operations.md` for validator bash contract and reporting matrix.

### 2.2 CLAUDE.md Drift Check (if configured)

Read `skills/session-end/drift-operations.md` for checker bash contract and reporting matrix. Complements 2.1: vault-sync validates frontmatter inside the vault tree; drift-check validates narrative claims (paths, counts, issue refs, session-file refs) in top-level repo docs.

### 2.3 Vault Staleness Check (if configured)

> Skip this subsection if `vault-staleness.enabled` is not `true` (default: `false`).

#### Step 1 — Resolve mode

Read `vault-staleness.mode` from `$CONFIG` (default: `warn`). Valid values: `off | warn | strict`.

If `mode === 'off'`, skip Phase 2.3 entirely.

#### Step 2 — Invoke staleness probes

Both probes already ship in `skills/discovery/probes/`. Invoke each via Node import (no shell-out):

```js
import { runProbe as runStaleness } from '$REPO_ROOT/skills/discovery/probes/vault-staleness.mjs';
import { runProbe as runNarrative }  from '$REPO_ROOT/skills/discovery/probes/vault-narrative-staleness.mjs';

const projectStaleness = await runStaleness(projectRoot, config);
const narrativeStaleness = await runNarrative(projectRoot, config);
```

Each probe returns `{ findings: Array, metrics: Object, duration_ms: Number }` and auto-appends a JSONL summary record to its respective metrics file.

#### Step 3 — Aggregate and route by mode

```
totalFindings = projectStaleness.findings.length + narrativeStaleness.findings.length
```

- `mode === 'warn'` (default): report findings to closing report Docs Health line. Never block close.
- `mode === 'strict'`:
  - If `totalFindings === 0`: continue, log `Vault staleness: clean (mode=strict)`.
  - If `totalFindings > 0`: BLOCK the close. Present the findings list and offer override:
    - On Claude Code: AskUserQuestion with options:
      1. "Fix and retry Phase 2.3" (Recommended) — exit close, let user investigate
      2. "Override and close" — proceed, log a Deviation entry in STATE.md `## Deviations`:
         `- [<ISO timestamp>] Phase 2.3: Vault staleness strict-mode findings overridden by user. Findings: <count> (projects: <N>, narratives: <M>).`
      3. "Abort close" — exit close without writing
    - On Codex CLI / Cursor IDE: same options as numbered Markdown list.

#### Step 4 — Surface to closing report

Pass the aggregated counts and mode forward to Phase 6 Final Report (Docs Health line — see Phase 6 below).

## Phase 3: Documentation Updates

### 3.0 Defensive Cleanup

Delete `<state-dir>/wave-scope.json` if it still exists:

```bash
rm -f <state-dir>/wave-scope.json
```

This should have been cleaned up by wave-executor after the final wave, but crashed sessions or interrupted executions may leave it behind. A stale scope manifest from a previous session could incorrectly restrict the next session's enforcement hooks.

### 3.1 SSOT Files
- Update `STATUS.md` / `STATE.md` if they exist (metrics, dates, status)
- Update `CLAUDE.md` if patterns or conventions changed during this session
- Check `<state-dir>/rules/` — if a new pattern was established, suggest a new rule file

### 3.2 Docs Verification (docs-orchestrator integration)

> Skip this subsection if `docs-orchestrator.enabled` config is not `true` (default: `false`). Also skip entirely if `docs-orchestrator.mode` is `off`.

#### Step 1 — Load docs-tasks SSOT

Read `docs-tasks` from STATE.md frontmatter. This field is written by wave-executor Pre-Wave 1b when `docs-orchestrator.enabled: true` and session-plan emitted a `### Docs Tasks (machine-readable)` block.

Use `scripts/lib/state-md.mjs` to parse the frontmatter safely — do NOT re-implement YAML parsing inline. Example accessor:

```bash
node --input-type=module -e "
import {readFileSync} from 'node:fs';
import {parseFrontmatter} from '${PLUGIN_ROOT}/scripts/lib/state-md.mjs';
const raw = readFileSync('<state-dir>/STATE.md', 'utf8');
const fm = parseFrontmatter(raw);
const tasks = fm['docs-tasks'];
if (!Array.isArray(tasks)) { process.stdout.write('ABSENT'); process.exit(0); }
process.stdout.write(JSON.stringify(tasks));
"
```

**Fallback — missing field:** If `docs-tasks` is absent from frontmatter, attempt to re-parse the session-plan output's `### Docs Tasks (machine-readable)` YAML fenced block from conversation context. This is degraded but functional.

**No tasks found at all:** Log `"ℹ docs-orchestrator enabled but no docs-tasks persisted — skipping verification"` in the session report and skip Phase 3.2 entirely. This is NOT an error.

**Silent-failure guard:** If STATE.md is unreadable, if frontmatter YAML is malformed, or if `docs-tasks` is present but not a list — these MUST produce an explicit error entry in the session final report. Do NOT skip silently:
```
⚠ Phase 3.2: docs-tasks parse error — <reason>. Manual docs verification required.
```

#### Step 2 — Read SESSION_START_REF

Read `session-start-ref` from STATE.md frontmatter. Full accessor and fallback chain are documented in `plan-verification.md § SESSION_START_REF accessor`. Summary:
- Primary: `session-start-ref` field in STATE.md frontmatter.
- Fallback: `git diff --name-only origin/main...HEAD` (no specific base SHA).

If `git diff` itself fails (network issue, corrupt repo), log:
```
⚠ Phase 3.2: git diff failed — <stderr>. Docs verification skipped.
```
and skip Phase 3.2. This is an explicit error, not a silent skip.

#### Step 3 — Compute changed files

```bash
CHANGED_FILES=$(git diff --name-only "$SESSION_START_REF..HEAD")
```

Cache this list for the per-task loop below. If the command exits non-zero, surface the error per the guard above and skip Phase 3.2.

#### Step 4 — Audience → file-pattern reference

The following mini-table mirrors `skills/docs-orchestrator/audience-mapping.md` (authoritative source — consult it for updates):

| Audience | Target file patterns |
|----------|----------------------|
| `user` | `README.md`, `docs/user/**/*.md`, `docs/getting-started.md`, `examples/**/*.md` |
| `dev` | `CLAUDE.md`, `docs/dev/**/*.md`, `docs/adr/**/*.md` |
| `vault` | `<vault>/01-projects/<slug>/context.md`, `<vault>/01-projects/<slug>/decisions.md`, `<vault>/01-projects/<slug>/people.md` |

Each `docs-task` carries its own `target-pattern` field (set during session-plan Step 1.8, derived from the audience-mapping table above). Use `task.target-pattern` as the primary match target; the table above is for human reference and fallback when `target-pattern` is absent.

#### Step 5 — Per-task verification loop

For each `task` in `docs-tasks`:

1. **Resolve target:** glob-match `task.target-pattern` against the cached `CHANGED_FILES` list.

2. **Not matched → GAP:**
   - No file matching `task.target-pattern` appears in the diff.
   - Record outcome: `gap`.

3. **Matched → inspect diff:**
   ```bash
   git diff "$SESSION_START_REF..HEAD" -- <matched-file>
   ```
   - **Substantive content change** (non-whitespace, non-comment-only lines added/removed): outcome `ok`.
   - **Whitespace-only or structural-only diff** (no prose or code content changed): outcome `gap`.
   - **File contains `<!-- REVIEW: source needed -->` markers within changed regions:** outcome `partial`. This means content was written but requires human review before release. `partial` does NOT block in strict mode — it is always a warning, by policy choice. Document both the `ok` content and the markers in the report.

4. Record `{id, audience, target-pattern, wave, status: ok|partial|gap}` for the aggregate report.

#### Step 6 — Aggregate and report per mode

Read `docs-orchestrator.mode` from Session Config (default: `warn`).

**`mode: warn`** (default, non-blocking):
- Append a subsection to the Phase 6 Final Report (see below).
- `/close` proceeds regardless of gap count.

**`mode: strict`** (blocking on any gap):
- If ALL tasks are `ok` or `partial`: proceed — append report, continue close.
- If ANY task is `gap`:
  - **Claude Code:** use `AskUserQuestion` with these options (mark Recommended):
    ```
    Phase 3.2 found documentation gaps. How would you like to proceed?
    1. Address gaps and retry Phase 3.2 (Recommended)
    2. Override — close session with gaps (deviations logged)
    3. Abort close
    ```
  - **Codex CLI / Cursor fallback:** render a numbered Markdown list:
    ```markdown
    ## Phase 3.2: Documentation Gaps Detected (mode=strict)

    Choose one:
    1. **Address gaps and retry Phase 3.2** *(Recommended)*
    2. Override — close session with gaps (deviations will be logged)
    3. Abort close

    Gap tasks: <list task IDs and target-patterns>
    ```
  - On "Address and retry": pause close, allow user to dispatch docs-writer manually or fix docs directly, then re-run Phase 3.2 from Step 3.
  - On "Override": log a deviation in the `## Deviations` section of STATE.md:
    ```
    - [Phase 3.2] docs-orchestrator strict-mode gaps overridden by user. Tasks: <ids>. Timestamp: <ISO 8601>.
    ```
    Then append the report and proceed with close.
  - On "Abort": stop `/close` entirely. User must re-invoke.

**`mode: off`:** This path is not reached because the Phase gate at the top of 3.2 exits early for `mode: off`. Documented here for completeness.

#### Step 7 — Documentation Coverage report block

Emit the following block to be included in Phase 6 Final Report under `### Documentation Coverage (docs-orchestrator)`:

```
### Documentation Coverage (docs-orchestrator)

Mode: <warn|strict>
Tasks verified: <total>

| Task ID | Audience | Target pattern | Wave | Status |
|---------|----------|----------------|------|--------|
| <id>    | <user|dev|vault> | <pattern> | <N> | ✅ ok / ⚠ partial / ❌ gap |
...

Summary: <N> ok, <N> partial (REVIEW markers present — human review needed before release), <N> gap
```

For `partial` tasks, append a note per task:
```
⚠ <target-pattern>: contains <!-- REVIEW: source needed --> markers — content written but not fully source-cited. Review before release.
```

For `gap` tasks in warn mode, append:
```
ℹ Gap tasks were not addressed. No docs-writer output found for these patterns. Consider scheduling in a follow-up session.
```

### 3.2a Session Handover (for significant sessions)
If this session made substantial changes, create or update:
- `<state-dir>/session-handover/` doc with: tasks completed, resume point, metrics changed, issues opened/closed
- Or update `<state-dir>/STATE.md` with session digest

### 3.3 Claude Rules Freshness
Review `<state-dir>/rules/` files that are relevant to this session's work:
- Are the rules still accurate after this session's changes?
- Should any rule be updated with new patterns?
- Should a new path-scoped rule be created?
- Suggest changes but DO NOT modify without user confirmation

### 3.4 Update STATE.md

> **Ownership Reference:** See `skills/_shared/state-ownership.md`. session-end is authorized to set `status: completed` plus the optional `updated` timestamp (#184), and — as of Phase A of Epic #271 — the 5 Recommendation fields written by Phase 3.7a. No other fields.

> **Runtime Ordering Note (Epic #271 Phase A):** Phase 3.4's `status: completed` write executes LAST in Phase 3, AFTER Phase 3.7 (sessions.jsonl) and Phase 3.7a (Compute and Write Recommendations). The ordinal position here (3.4) is kept for historical compatibility; the canonical runtime order is `3.1 → 3.2 → 3.3 → 3.4a → 3.5 → 3.5a → 3.7 → 3.7a → 3.4`. Rationale: Phase 3.7a reads in-memory session metrics and writes the 5 Recommendation fields via `updateFrontmatterFields`; that write must complete BEFORE the STATE.md frontmatter is finalized with `status: completed` so the Recommendation fields are visible to the next session-start while STATE.md is still `status: active`. Crash-resilience: if `/close` aborts between 3.7a and 3.4, STATE.md carries `status: active` + Recommendations; session-start Phase 1.5 offers resume (and the banner renders). If the reverse ordering were used (status: completed first), a crash would leave `status: completed` without Recommendations — the Reader would silently no-op the banner, losing the handoff.

> Gate: Only run if `persistence` is enabled in Session Config and `<state-dir>/STATE.md` exists.
1. Set frontmatter `status: completed`
2. Record final wave count and completion time in the frontmatter
3. Touch `updated: <ISO 8601 UTC>` in the frontmatter (issue #184). Use `scripts/lib/state-md.mjs` → `touchUpdatedField` for safety:
   ```bash
   node --input-type=module -e "
   import {readFileSync, writeFileSync} from 'node:fs';
   import {touchUpdatedField} from '${PLUGIN_ROOT}/scripts/lib/state-md.mjs';
   const p = '<state-dir>/STATE.md';
   writeFileSync(p, touchUpdatedField(readFileSync(p, 'utf8'), new Date().toISOString()));
   "
   ```
   Silent no-op if the file has no frontmatter.
4. Keep the file as a record — do NOT delete it (next session-start reads it)

If STATE.md doesn't exist, skip this subsection.

### 3.4a Coordinator Snapshot Cleanup (#196)

Pre-dispatch snapshots (`refs/so-snapshots/<sessionId>/wave-*`) are created by wave-executor before each wave dispatch so that session-start can offer recovery if a session is interrupted mid-wave. On a clean close those snapshots are no longer needed and should be deleted. In addition, orphaned refs from older sessions that were never cleaned up (e.g. after a hard crash) are garbage-collected using an age-based policy (14 days).

> Gate: Only run if `persistence` is `true` in Session Config. Skip entirely when persistence is off (snapshots are never written in that mode).

```bash
node --input-type=module -e "
import { listSnapshots, deleteSnapshot, gcSnapshots } from '${PLUGIN_ROOT}/scripts/lib/coordinator-snapshot.mjs';

// Step A: delete this session's snapshots (clean close → we don't need them)
const mine = await listSnapshots({ sessionId: '${SESSION_ID}' });
for (const s of mine) {
  const r = await deleteSnapshot({ refName: s.ref });
  if (!r.ok) console.error('snapshot cleanup:', r.error);
}

// Step B: GC orphans older than 14 days (non-fatal)
const gc = await gcSnapshots({ olderThanDays: 14 });
console.log(\`snapshot cleanup: deleted \${mine.length} from this session + \${gc.deletedCount} expired orphans (scanned \${gc.scanned}).\`);
"
```

Failures in either step are logged to stderr but do **not** block session close — a missed cleanup is self-healing via the 14-day GC on the next session.

This cleanup is the counterpart to the session-start Phase 1.5 recovery prompt: once a session closes cleanly, future sessions must not be offered recovery for its snapshots.

### 3.5 Session Memory

> Gate: Only run if `persistence` is enabled in Session Config AND platform is Claude Code (session memory at `~/.claude/projects/` is Claude Code-only). Learnings (Phase 3.5a) and metrics (Phase 3.7) still write to `.orchestrator/metrics/` on all platforms.

1. Create `~/.claude/projects/<project>/memory/session-<YYYY-MM-DD>.md` with:
   - Frontmatter: `name`, `description` (1-line summary), `type: project`
   - `## Outcomes` — per-issue status (completed / partial / not started) with evidence
   - `## Learnings` — patterns discovered, architectural insights, gotchas
   - `## Next Session` — priority recommendations, suggested session type, blockers
2. Update `~/.claude/projects/<project>/memory/MEMORY.md`:
   - Under a `## Sessions` heading (create if missing), add:
     `- [Session <date>](session-<date>.md) — <one-line summary>`

### 3.5a Learning Extraction + 3.6 Memory Cleanup & Learnings Write

Read `skills/session-end/learning-patterns.md` for extraction heuristics, confidence updates, passive decay, and JSONL write procedure.

### 3.7 Write Session Metrics

Read `skills/session-end/session-metrics-write.md` for JSONL append, vault-mirror invocation, and behavior matrix.

### 3.7a Compute and Write Recommendations (Epic #271 Phase A)

> Gate: Only run if `persistence` is `true` in Session Config AND `<state-dir>/STATE.md` exists. Skip silently otherwise.

> **Ownership Reference:** See `skills/_shared/state-ownership.md`. session-end is the ONLY writer of the 5 Recommendation fields (`recommended-mode`, `top-priorities`, `carryover-ratio`, `completion-rate`, `rationale`). No other skill may write these keys.

> **Ordering:** Runs AFTER Phase 3.7 (sessions.jsonl is just-written — reads in-memory session metrics, NOT JSONL) and BEFORE Phase 3.4 `status: completed` setting. See the Phase 3.4 Runtime Ordering Note for rationale.

Compute the v0 recommendation from in-memory session metrics and additively write 5 fields to STATE.md frontmatter:

```bash
node --input-type=module -e "
import {readFileSync, writeFileSync, appendFileSync, mkdirSync} from 'node:fs';
import {updateFrontmatterFields} from '${PLUGIN_ROOT}/scripts/lib/state-md.mjs';
import {computeV0Recommendation} from '${PLUGIN_ROOT}/scripts/lib/recommendations-v0.mjs';

const STATE_PATH = '<state-dir>/STATE.md';
const SWEEP_LOG = '.orchestrator/metrics/sweep.log';

try {
  // In-memory session metrics — pulled from the session's running state,
  // NOT re-read from sessions.jsonl (which was just-written in Phase 3.7).
  const completionRate = <number from session metrics: completed_issues / planned_issues>;
  const carryoverRatio = <number: carryover_count / planned_issues (0 when planned=0)>;
  const carryoverIssues = [<priority-sorted carryover issue IIDs, critical/high first, FIFO tiebreak>];

  const rec = computeV0Recommendation({completionRate, carryoverRatio, carryoverIssues});

  const fields = {
    'recommended-mode': rec.mode,
    'top-priorities': rec.priorities,
    'carryover-ratio': Number(carryoverRatio.toFixed(2)),
    'completion-rate': Number(completionRate.toFixed(2)),
    'rationale': rec.rationale,
  };

  const contents = readFileSync(STATE_PATH, 'utf8');
  writeFileSync(STATE_PATH, updateFrontmatterFields(contents, fields));
  console.log('Recommendations written: ' + rec.mode + ' (' + rec.rationale + ')');
} catch (err) {
  // AC3: defensive — exception must NOT block Phase 3.4 status: completed.
  mkdirSync('.orchestrator/metrics', {recursive: true});
  const evt = {
    timestamp: new Date().toISOString(),
    event: 'recommendation-compute-failed',
    error: String(err && err.message ? err.message : err),
  };
  appendFileSync(SWEEP_LOG, JSON.stringify(evt) + '\n');
  console.error('⚠ Phase 3.7a: recommendation compute failed — fields omitted, sweep.log entry written. Continuing.');
}
"
```

**Data source guarantee:** The three inputs (`completionRate`, `carryoverRatio`, `carryoverIssues`) MUST come from the in-memory session metrics object built in Phase 1.7, NOT from a re-read of `.orchestrator/metrics/sessions.jsonl`. Reading the just-written JSONL would introduce a circular dependency and risk reading a truncated line if Phase 3.7's `appendJsonl` was mid-flush.

**Field precision:**
- `carryover-ratio` and `completion-rate` are rounded to 2 decimal places.
- `top-priorities` contains 0–5 integer issue IIDs, already priority-sorted by the Phase 1.1 carryover loop.
- `rationale` is a ≤ 120-char single-line string (v0 produces ≤ 40 chars).

**Error mode (AC3):** On any exception from `computeV0Recommendation` or the file I/O, the catch block writes a `recommendation-compute-failed` event to `.orchestrator/metrics/sweep.log` and returns without touching STATE.md. Phase 3.4 then proceeds as normal, setting `status: completed` without Recommendation fields. The Reader (session-start Phase 1.5) handles the absent-fields case via graceful-no-banner fallback.

## Phase 4: Commit & Push

### 4.1 Stage Changes
- **Stage files individually**: `git add <file>` — NEVER `git add .` or `git add -A`
- **Always stage these session artifacts** (if modified):
  - `.orchestrator/metrics/sessions.jsonl` (session summary from Phase 3.7)
  - `.orchestrator/metrics/learnings.jsonl` (learnings from Phase 3.6)
  - `<state-dir>/STATE.md` (session state, if persistence enabled)
  - Any files created or modified by wave agents
- Review staged changes: `git diff --cached` — verify every change is from THIS session
- If you see changes you did NOT make, ask the user (parallel session awareness)

### 4.2 Commit
Use Conventional Commits format:
```
type(scope): description

- [bullet points of what changed]
- Closes #IID1, #IID2 (if applicable)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

For sessions with many changes, prefer ONE commit per logical unit (not one mega-commit).

### 4.3 Push
```bash
git push origin HEAD
```

### 4.4 GitHub Mirror (if configured in Session Config)
```bash
# Only attempt if 'mirror: github' is in Session Config AND remote exists
git remote get-url github 2>/dev/null && git push github HEAD 2>/dev/null || echo "GitHub mirror: not configured"
```

## Phase 5: Issue Cleanup

> **VCS Reference:** Use CLI commands per the "Common CLI Commands" section of the gitlab-ops skill.

1. **Close resolved issues**: Use the issue close and note commands per the "Common CLI Commands" section of the gitlab-ops skill. Note: some VCS platforms require separate note and close commands.
2. **Update in-progress issues**: ensure labels reflect actual state using the issue update command
3. **Create carryover issues**: for partially-done work (from Phase 1.2), use the issue create command with appropriate labels

#### Discovery Issue Creation (if discovery ran in Phase 1.5)

For each finding with severity `critical` or `high` from Phase 1.5:
1. Create a VCS issue using the detected platform CLI:
   - Title: `[Discovery] <description>` (truncated to 70 chars)
   - Body: `**Probe:** <probe>\n**File:** <file>:<line>\n**Severity:** <severity>\n**Confidence:** <confidence>%\n**Recommendation:** <recommendation>`
   - Labels: `type:discovery`, `priority:<severity>` (critical→critical, high→high)
2. Log each created issue ID for the Final Report
3. Update `discovery_stats.issues_created` count

4. **Create gap issues**: for newly-discovered problems
5. **Update milestones**: if milestone progress changed

## Phase 6: Final Report

Present to the user:

```
## Session Summary

### Completed
- [x] Issue #N: [description] — [evidence: tests passing, files changed]
- [x] Issue #M: [description]

### Carried Over
- [ ] Issue #P: [what's left] — new issue #Q created
- [ ] [description] — blocked by [reason]

### New Issues Created
- #R: [title] (priority: [X], status: ready)
- #S: [title] (priority: [X], status: ready)

### Metrics
- Duration: [total wall-clock time]
- Waves: [N completed]
- Agents: [total dispatched] ([X complete, Y partial, Z failed])
- Files changed: [N]
- Per-wave breakdown:
  - Wave 1 (Discovery): [duration] — [N agents] — [K files]
  - Wave 2 (Impl-Core): [duration] — [N agents] — [K files]
  - ...
- Tests: [passing/total]
- TypeScript: 0 errors
- Commits: [N] pushed to [branch]
- Mirror: [synced/skipped]
- Docs Health: Vault staleness — [render one of the three cases below based on Phase 2.3 result]
  - Findings present (warn mode): `[N stale projects, M stale narratives] (mode=warn). See .orchestrator/metrics/vault-staleness.jsonl.`
  - Skipped (disabled or mode=off): `skipped (disabled | mode=off).`
  - Clean run: `clean (mode=<mode>).`
- Enforcement: [N violations blocked / M warnings] (or "N/A" if enforcement off)
- Circuit breaker: [N agents hit limits, M spirals detected] (or "none")
- Metrics written to: `.orchestrator/metrics/sessions.jsonl`
- Learnings: [N] new, [M] confirmed, [K] contradicted/expired — written to `.orchestrator/metrics/learnings.jsonl`

### Next Session Recommendations
- Priority: [what should be tackled next]
- Type: [housekeeping/feature/deep recommended]
- Notes: [any context for next session]
```

> **Documentation Coverage anchor:** If Phase 3.2 ran and produced task verification results (i.e. `docs-orchestrator.enabled: true` and `docs-tasks` were found), the results appear here as a `### Documentation Coverage (docs-orchestrator)` subsection emitted by Phase 3.2 Step 7. The content is written dynamically — it is not pre-populated in this template. When `docs-orchestrator.enabled` is `false` or `docs-tasks` were absent, this subsection is omitted entirely.

## Sub-File Reference

| File | Purpose |
|------|---------|
| `plan-verification.md` | Phase 1 plan verification and metrics collection |
| `verification-checklist.md` | Phase 2 quality gate checklist and checks |
| `discovery-scan.md` | Phase 1.5 embedded discovery dispatch and findings triage |
| `metrics-collection.md` | Phase 1.7 JSONL schema and conditional field rules |
| `vault-operations.md` | Phase 2.1 validator bash contract and reporting matrix |
| `drift-operations.md` | Phase 2.2 drift-checker bash contract and reporting matrix |
| `learning-patterns.md` | Phases 3.5a + 3.6 extraction heuristics, confidence updates, passive decay, and JSONL write procedure |
| `session-metrics-write.md` | Phase 3.7 JSONL append, vault-mirror invocation, and behavior matrix |

## Anti-Patterns

- **DO NOT** commit before running quality gates — a "clean commit" with TypeScript errors is not clean
- **DO NOT** mark issues as closed without verifying the implementation actually addresses them
- **DO NOT** skip creating tracking issues for unfinished work — "I'll remember for next session" always fails
- **DO NOT** use `git add .` or `git add -A` — parallel sessions may have uncommitted work in the tree
- **DO NOT** push to mirrors before verifying origin push succeeded — broken state propagates

## Critical Rules

- **NEVER claim work is done without running verification** — evidence before assertions
- **NEVER commit with TypeScript errors** — 0 errors is non-negotiable
- **NEVER use `git add .`** — stage files individually to avoid capturing parallel session work
- **NEVER skip issue updates** — VCS must reflect reality after every session
- **ALWAYS create issues for unfinished work** — nothing should be "remembered" without a ticket
- **ALWAYS push to origin** — local-only work is lost work
- **ALWAYS mirror to GitHub** if configured — keep mirrors in sync
- **ALWAYS review `git diff --cached`** before committing — verify only YOUR changes are staged
