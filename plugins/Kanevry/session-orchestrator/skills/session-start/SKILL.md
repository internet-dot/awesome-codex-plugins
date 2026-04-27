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
   - `status: active` — previous session crashed or was interrupted. Use the AskUserQuestion tool to present: "Found unfinished session from [started_at]. [N] waves completed. Resume or start fresh?" with options to resume the previous plan or start a new session. After a resume choice, proceed to **Snapshot Recovery** subsection below.
   - `status: paused` — session was intentionally paused. Use AskUserQuestion to offer resuming from the pause point or starting fresh. After a resume choice, proceed to **Snapshot Recovery** subsection below.
   - `status: completed` — previous session ended cleanly. Note the summary for context (what was done, what was deferred), then **render the Recommendations Banner** (see subsection below) and **reset STATE.md to idle** before any new session state is written (see "Idle Reset" below). Continue with normal initialization.
2. **STATE.md does not exist** — first session or persistence was previously off. Continue normally.

### Recommendations Banner (Epic #271 Phase A)

> Runs on the `status: completed` branch only, BEFORE Idle Reset archives the fields. Silent no-op on other branches.

Read the 5 optional v1.1 Recommendation fields from STATE.md frontmatter via `parseRecommendations` (from `scripts/lib/state-md.mjs`). The writer is session-end Phase 3.7a (see `skills/session-end/SKILL.md`).

```bash
node --input-type=module -e "
import {readFileSync} from 'node:fs';
import {parseStateMd, parseRecommendations} from '${PLUGIN_ROOT}/scripts/lib/state-md.mjs';
import {isValidMode} from '${PLUGIN_ROOT}/scripts/lib/recommendations-v0.mjs';
import {appendFileSync, mkdirSync} from 'node:fs';

const SWEEP_LOG = '.orchestrator/metrics/sweep.log';
function logWarn(event, detail) {
  try {
    mkdirSync('.orchestrator/metrics', {recursive: true});
    appendFileSync(SWEEP_LOG, JSON.stringify({timestamp: new Date().toISOString(), event, detail}) + '\n');
  } catch {}
}

const parsed = parseStateMd(readFileSync('<state-dir>/STATE.md', 'utf8'));
if (!parsed) process.exit(0);
const rec = parseRecommendations(parsed.frontmatter);
if (!rec) process.exit(0); // pre-v1.1 STATE.md — graceful silent no-banner (AC3)

// AC4: type-mismatch in top-priorities — field-level null from parser; still render other fields
if (rec.priorities === null && Object.prototype.hasOwnProperty.call(parsed.frontmatter, 'top-priorities')) {
  logWarn('state-md-type-mismatch', {field: 'top-priorities', got: typeof parsed.frontmatter['top-priorities']});
}

// AC4: partial fields — warn but still render available ones
const missingCount = [rec.mode, rec.priorities, rec.carryoverRatio, rec.completionRate, rec.rationale].filter((x) => x === null).length;
if (missingCount > 0 && missingCount < 5) {
  logWarn('state-md-partial-recommendation', {missing: missingCount});
}

const modeOk = rec.mode && isValidMode(rec.mode);
const mode = modeOk ? rec.mode : '(unknown-mode)';
const rationale = rec.rationale || '(no rationale)';
const pct = (x) => (x === null ? '—' : Math.round(x * 100) + '%');
console.log('📋 Previous session recommended: ' + mode + ' — ' + rationale + ' (completion: ' + pct(rec.completionRate) + ', carryover: ' + pct(rec.carryoverRatio) + ')');
if (Array.isArray(rec.priorities) && rec.priorities.length > 0) {
  console.log('  Suggested issues: ' + rec.priorities.map((id) => '#' + id).join(', '));
}
"
```

**Behavior matrix (AC1/AC3/AC4):**
- All 5 fields present + valid → banner line + suggested-issues line (if priorities non-empty).
- Field(s) absent entirely → no banner (graceful no-op, no WARN).
- 1–4 fields present (partial) → banner renders with `—` for missing, WARN `state-md-partial-recommendation` to sweep.log.
- `top-priorities` is not an array (type-mismatch) → treated as null, WARN `state-md-type-mismatch` to sweep.log, other fields still render.
- Unknown `recommended-mode` value → banner shows `(unknown-mode)` instead of the string.

The reader does NOT mutate STATE.md — it is a pure observer. Idle Reset (subsection below) is the only code path that modifies the file on the `completed` branch.

### Idle Reset (completed-branch only)

When (and only when) the prior `status` is `completed`, rewrite STATE.md to a clean idle state before Phase 1b (Initialize STATE.md) runs. This prevents the next agent from reading a stale "completed" banner at session-start, while preserving the prior session's record in a demoted archive block.

Reset rules — applies ONLY on the `completed` branch. Do NOT perform this reset on `active` or `paused`; those paths stay user-interactive via AskUserQuestion.

1. Set frontmatter `status: idle`.
2. Clear `current-wave` (set to `0`).
3. Move the existing `## Wave History` body into a new `## Previous Session` archive section (retain the record, but demote it below the new session's live state). Remove the original `## Wave History` section — wave-executor will recreate it on the next wave.
4. Clear `## Deviations` (leave the heading with an empty body so the schema is preserved).
5. Leave other frontmatter fields (`schema-version`, `session-type`, `branch`, `issues`, `started_at`, `total-waves`) intact until Phase 1b overwrites them with the new session's values.
6. **v1.1 Recommendation-field archival (Epic #271 Phase A, AC2):** If ANY of the 5 Recommendation fields (`recommended-mode`, `top-priorities`, `carryover-ratio`, `completion-rate`, `rationale`) is present in the frontmatter, remove them from the frontmatter via `updateFrontmatterFields(contents, {field: null, ...})` (null value deletes the key). Then prepend a readable block (NOT YAML) to the `## Previous Session` body:

   ```markdown
   ### Recommendations (archived from v1.1 frontmatter)
   - **Recommended mode:** <mode>
   - **Rationale:** <rationale>
   - **Completion rate:** <XX%>
   - **Carryover ratio:** <XX%>
   - **Top priorities:** #<id>, #<id>, …  _(or "none")_
   ```

   Omit individual bullets for null-valued fields. If all 5 are null (i.e., `parseRecommendations` returned non-null but every field is null after type-coercion), skip the archival block entirely.

Rationale: `/close` intentionally keeps STATE.md as a record so the next session-start can read it. This reset completes that contract by demoting the record before new session state is written, so a fresh session never appears "already completed". The Recommendation archival (rule 6) preserves the session-to-session handoff in a human-readable form after the Recommendations Banner has rendered — Phase B's Mode-Selector will read the LIVE frontmatter of the current session and does not need the archived copy, so this is purely informational for humans browsing STATE.md history.

### Snapshot Recovery (#196)

Applies ONLY after the user chose to **resume** from the `active`/`paused` branch above. Skip entirely on the `completed` branch (snapshots for completed sessions are GC'd by session-end, not offered for recovery) and on the "start fresh" path of an `active`/`paused` prompt (starting fresh implies abandoning any snapshot).

```js
import { listSnapshots, deleteSnapshot } from '$PLUGIN_ROOT/scripts/lib/coordinator-snapshot.mjs';

const snaps = await listSnapshots({ sessionId: '<sessionId from STATE.md>' });
```

If `snaps.length === 0` → no snapshots to recover; continue to the Current-Task Banner.

If `snaps.length >= 1` → present the following choice:

**Claude Code (AskUserQuestion):**

```js
AskUserQuestion({
  questions: [{
    question: `Found ${snaps.length} coordinator snapshot(s) from the resumed session (latest from ${humanAgeOf(snaps[0].createdAt)}). Recover, keep as backup, or discard?`,
    header: "Snapshot",
    multiSelect: false,
    options: [
      { label: "Recover (diff vs current tree) (Recommended)", description: "Apply the latest snapshot back onto the working tree. You will see a diff and can unstage unwanted changes before committing." },
      { label: "Keep as backup", description: "Leave refs/so-snapshots/* in place untouched. You can recover manually later via `git stash apply $(git rev-parse <ref>)`." },
      { label: "Discard all", description: "Delete all refs/so-snapshots/<sessionId>/* immediately via deleteSnapshot." },
    ],
  }],
});
```

**Codex CLI / Cursor IDE fallback (numbered Markdown list):**

```markdown
Snapshot recovery options:

1. **Recover (Recommended)** — Apply the latest snapshot back onto the working tree. You will see a diff and can unstage unwanted changes before committing.
2. **Keep as backup** — Leave the refs in place untouched. You can recover manually later.
3. **Discard all** — Delete all refs/so-snapshots/<sessionId>/* immediately.

Reply with the number of your choice.
```

On user choice:
- **Recover** → `git stash apply <snaps[0].sha>` (use apply, not pop — leaves the ref intact in case the user changes their mind). Then show the resulting `git diff --stat` so the user sees what landed.
- **Keep as backup** → no-op. Log in the Session Overview: `Snapshot(s) retained: <N>. Recover manually with \`git stash apply <sha>\`.`
- **Discard all** → for each snapshot in `snaps`, call `deleteSnapshot({refName: snap.ref})`. Log count.

Snapshot age (`humanAgeOf`) is derived from `snap.createdAt` (ISO 8601 from `git for-each-ref --format='%(committerdate:iso8601)'`). A simple inline helper:

```js
function humanAgeOf(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
```

### Current-Task Banner (#184)

After the continuity checks above, render a one-line banner showing the current task from STATE.md. This gives the user an immediate "where am I" signal before the rest of the session overview loads.

```bash
node --input-type=module -e "
import {readFileSync} from 'node:fs';
import {readCurrentTask} from '${PLUGIN_ROOT}/scripts/lib/state-md.mjs';
try {
  const t = readCurrentTask(readFileSync('<state-dir>/STATE.md', 'utf8'));
  if (t) console.log('Current task: ' + t.description);
} catch {}
"
```

Skip silently when STATE.md is absent or unreadable. The banner is informational, not load-bearing.

Also read `<state-dir>/STATUS.md` if it exists for additional project-level context.

## Phase 1.6: Metrics Initialization

> Skip if `persistence` config is `false`.

1. Ensure '.orchestrator/metrics/' directory exists in the project root (create if missing). For backward compatibility with pre-v2.0 sessions, also check the platform's legacy metrics directory (`<state-dir>/metrics/` where `<state-dir>` is `.claude/`, `.codex/`, or `.cursor/` per platform).
2. If '.orchestrator/metrics/sessions.jsonl' exists, count lines to determine number of previous sessions. If not found, check `<state-dir>/metrics/sessions.jsonl` as a platform-specific legacy fallback.
3. Store the count for display in Phase 7 — this feeds the Historical Trends section

## Phase 2: Git Analysis (parallel)

Run these checks as ONE parallel Bash block — background the independent git ops with `&` and `wait`:

```bash
# Independent ops — launch in parallel, collect output via tmpfiles
git branch -a > /tmp/so-branches.$$ &
git log --oneline -N > /tmp/so-commits.$$ &        # N from Session Config `recent-commits` (default 20)
git status --short > /tmp/so-status.$$ &
git log origin/main..HEAD --oneline > /tmp/so-ahead.$$ &
wait
# Then read the 4 tmpfiles in a single step and derive: branch state, recent commits,
# unpushed/uncommitted, open branches. Clean up tmpfiles once derivations are done:
rm -f /tmp/so-branches.$$ /tmp/so-commits.$$ /tmp/so-status.$$ /tmp/so-ahead.$$
```

Checks to run (derived from the collected output):

1. **Branch state**: current branch (from `branch -a`), ahead/behind origin (from `ahead` tmpfile)
2. **Recent commits**: parse `commits` tmpfile — identify last session's work by commit patterns
3. **Unpushed/uncommitted**: `status` tmpfile + `ahead` tmpfile combined
4. **Open branches**: parse `branch -a` tmpfile, identify which are mergeable to develop/main
5. **Stale branches**: run AFTER the parallel block — requires iterating over branches (depends on `branch -a` output). Use `git log -1 --format=%ct <branch>` per branch; flag those with no commits in more than `stale-branch-days` (default: 7) days.

**Rationale:** The 4 independent ops are I/O-bound — running them in parallel cuts Phase 2 wall-clock from ~500ms to ~150ms. The stale-branches check depends on the branch list, so it runs after `wait`.

## Phase 2.5: Docs Planning (Docs-Orchestrator Integration)

> Skip this phase if `docs-orchestrator.enabled` config is not `true` (default: `false`).

### Step 1: Read Docs-Orchestrator Config

Read the three controlling fields from `$CONFIG` using the canonical `jq` accessor pattern:

```bash
DOCS_ENABLED=$(echo "$CONFIG" | jq -r '."docs-orchestrator".enabled // false')
DOCS_AUDIENCES=$(echo "$CONFIG" | jq -r '."docs-orchestrator".audiences // ["user","dev","vault"] | join(",")')
DOCS_MODE=$(echo "$CONFIG" | jq -r '."docs-orchestrator".mode // "warn"')
```

Valid values for `mode`: `warn` | `strict` | `off`. Never use `hard`.

If `DOCS_ENABLED` is not `true`, skip all remaining steps in this phase and proceed directly to Phase 3.

### Step 2: Audience Auto-Detection

Using signals already gathered in Phases 2–5 (git analysis, VCS issues, branch state, SSOT checks), apply the following heuristic to determine which audiences are likely affected. Record each match with its triggering signal for inclusion in the output block.

**User audience** — flag as likely when any of the following are true:
- Affected files include `README.md`, `docs/user/**/*.md`, `docs/getting-started.md`, or `examples/**/*.md`
- Open or recently closed issues reference CLI UX changes, new user-facing commands, or a breaking API change
- New public commands are introduced (e.g. changes to `commands/` directory)
- Install flow or setup instructions are modified

**Dev audience** — flag as likely when any of the following are true:
- Affected files include `CLAUDE.md`, `docs/dev/**/*.md`, or `docs/adr/**/*.md`
- Issues describe an architecture decision, major refactor, new module or subsystem, test-coverage shift, dependency upgrade, or an ADR-worthy choice
- New `.mjs` scripts, skill files (`skills/**`), hook files (`hooks/**`), or agent definitions (`agents/**`) are added or substantially changed

**Vault audience** — flag as likely when ALL of the following are true:
- `vault-integration.enabled: true` is present in `$CONFIG`
- Issues involve project-status change, ownership transition, stack/infra decision, cross-project dependency, migration, or archival event

After detection, intersect the detected set with the audiences listed in `DOCS_AUDIENCES` (the user may have narrowed the allowed set in config). If the intersection is empty, proceed to Step 3 without pre-selecting any option as "Recommended" and add a note that no audiences were auto-detected.

See `skills/docs-orchestrator/audience-mapping.md` for the authoritative audience → file-pattern and trigger table.

### Step 3: Confirm Audiences with User

Present the audience confirmation using the platform-appropriate interaction pattern.

**Claude Code (AskUserQuestion):**

Mark the auto-detected primary audience (or audiences, if multiple) with `(Recommended)`. `multiSelect: true` because a single change commonly touches more than one audience.

```js
AskUserQuestion({
  questions: [{
    question: "Welche Audiences berührt dieser Scope? (Mehrfachauswahl möglich)",
    header: "Audiences",
    multiSelect: true,
    options: [
      {
        label: "Dev (Recommended)",   // add "(Recommended)" to each detected audience
        description: "Architektur-, Modul- oder Refactoring-Änderungen — aktualisiert CLAUDE.md, docs/dev/**, docs/adr/**."
      },
      {
        label: "User",
        description: "Öffentlich sichtbare Änderungen — aktualisiert README.md, docs/user/**, examples/**."
      },
      {
        label: "Vault",
        description: "Strategische oder Status-Änderungen — aktualisiert <vault>/01-projects/<slug>/context.md, decisions.md, people.md."
      }
    ]
  }]
})
```

**Codex CLI / Cursor IDE fallback (numbered Markdown list):**

```markdown
Welche Audiences berührt dieser Scope? (Mehrfachauswahl möglich)

Auto-detected: [dev]  ← list detected audiences here, or "none" if empty intersection

1. **Dev (Recommended)** — Architektur-, Modul- oder Refactoring-Änderungen. Targets: CLAUDE.md, docs/dev/**, docs/adr/**.
2. **User** — Öffentlich sichtbare Änderungen. Targets: README.md, docs/user/**, examples/**.
3. **Vault** — Strategische oder Status-Änderungen. Targets: <vault>/01-projects/<slug>/context.md, decisions.md, people.md.

Enter one or more numbers (comma-separated), or press Enter to accept the recommended default.
```

Store the confirmed audience list as `CONFIRMED_AUDIENCES`.

### Step 4: Emit Docs Planning Result Block

After the user confirms (or defaults are accepted), emit the following delimited block verbatim into the conversation context. This block is the **contract between Phase 2.5 and session-plan Step 1.8** — session-plan MUST parse it to classify tasks as `Docs` role and route them to the `docs-writer` agent.

```markdown
### Docs Planning Result (Phase 2.5)
Audiences: [<comma-separated confirmed audiences, e.g. dev, user>]
Detected-from: [<comma-separated detection signals, e.g. affected-files, issue-labels>]
Mode: <warn|strict|off>
Docs-tasks-seed:
  - audience: "dev"
    rationale: "<one-line reason derived from detection signal, e.g. 'new skill scaffolded in skills/docs-orchestrator'>"
  - audience: "user"
    rationale: "<one-line reason, or omit entry if audience not confirmed>"
```

Session-plan Step 1.8 identifies this block by the exact heading `### Docs Planning Result (Phase 2.5)` and reads `Audiences:` and `Docs-tasks-seed:` to seed the Docs role task list. **Parse rule for `Docs-tasks-seed:`:** each top-level `- audience:` bullet is exactly one seed task; parse all entries in document order; the following indented `rationale:` key binds to the most recent `- audience:`. If this block is absent (phase was skipped), session-plan MUST NOT create any Docs role tasks.

### Step 5: Non-Overlap Discipline

`docs-orchestrator` MUST NOT write to the following paths — they are owned by sibling skills:

- `<vault>/01-projects/*/_overview.md` — owned by `vault-mirror` (regenerated from JSONL on every session-end)
- `<vault>/03-daily/*` — owned by `daily` (idempotent day-level notes; a second writer would corrupt the file)

See `skills/docs-orchestrator/audience-mapping.md` (Non-Overlap with Sibling Skills table) for the complete ownership list and source-citation rules.

Proceed to Phase 3.

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
2. **Quality baseline**: Run Baseline quality checks per the quality-gates skill. Commands are resolved in this order (issue #183):
   a. `.orchestrator/policy/quality-gates.json` — preferred source when present.
   b. Session Config `test-command` / `typecheck-command` / `lint-command` — fallback.
   c. Hardcoded defaults: `pnpm test --run`, `tsgo --noEmit`, `pnpm lint`.
   Before running, perform a **command-availability check**: for each resolved command, extract the binary (first token) and run `command -v <binary>`. If absent, skip that check and log `⚠ Quality baseline: <binary> not found — skipping <variant>`. Report results but do not block the session.
3. **Pencil design status**: if `pencil` is configured, verify the `.pen` file exists at the configured path. Report: "Pencil design configured at [path] — design-code alignment reviews will run after Impl-Core and Impl-Polish waves." If file not found, warn: "Pencil path configured but file not found at [path]."
4. **Plugin freshness**: Determine the session-orchestrator plugin directory (navigate up from this skill's base directory to the plugin root). Run `git -C <plugin-dir> log -1 --format="%ci"` to get the last commit date. If older than `plugin-freshness-days` (default: 30) days, flag a warning in the Session Overview: `"⚠ Session Orchestrator plugin last updated [N] days ago — consider pulling the latest version."` Non-blocking — present in overview, don't halt.

   Additionally, if `.orchestrator/bootstrap.lock` exists in the current repo, invoke the bootstrap-lock-freshness probe (`scripts/lib/bootstrap-lock-freshness.mjs`) to check lock age and plugin-version drift. When severity is `warn` or `alert`, render an additional banner alongside the plugin-freshness warning:
   - **warn** (age 30–89d or version mismatch): `"⚠ bootstrap.lock: age=<N>d, plugin-version=<lock-ver> (current=<plugin-ver>) — consider re-running /bootstrap --retroactive to refresh."`
   - **alert** (age ≥90d, unparseable, or missing): `"⚠ bootstrap.lock: <message> — re-run /bootstrap --retroactive is strongly recommended."`

   Both banners are non-blocking — display in the Session Overview, do not halt the session. If `bootstrap-lock-freshness.mjs` is absent (pre-#186 plugin install), skip silently.

## Phase 4.5: Resource Health (v3.1.0)

> Skip this phase if `resource-awareness: false` in Session Config.

Read `.orchestrator/host.json` (written by `hooks/on-session-start.mjs`) and run a live resource snapshot. Compare against `resource-thresholds` from Session Config to derive an adaptive wave-sizing recommendation before session-plan runs.

### Probe + Evaluate

```js
// Conceptual — the wave-executor and session-plan skills call these directly.
import { probe, evaluate } from '$PLUGIN_ROOT/scripts/lib/resource-probe.mjs';
const snapshot = await probe();
const verdict = evaluate(snapshot, config['resource-thresholds']);
```

The `evaluate()` result has three fields:
- `verdict`: `green` | `warn` | `critical`
- `reasons`: array of human-readable explanations
- `recommended_agents_per_wave_cap`: integer cap (0 = coordinator-direct) or null

### Adaptive Rules (default thresholds; configurable via `resource-thresholds`)

| Signal | Threshold | Action |
|--------|-----------|--------|
| RAM free below `ram-free-min-gb` (default 4) | warn | Cap `agents-per-wave` at 2 |
| RAM free below `ram-free-critical-gb` (default 2) | critical | Recommend coordinator-direct (0 agents) |
| CPU load above `cpu-load-max-pct` (default 80) sustained | warn | Cap `agents-per-wave` at 2 |
| Claude processes ≥ `concurrent-sessions-warn` (default 5) | warn | Warn; suggest sequencing or waiting |
| SSH session detected AND `ssh-no-docker: true` | info | Append note: host is SSH-attached, Docker-dependent steps should run on a local dev host |

### Presentation

Print a one-line Resource Health verdict immediately after Phase 4's output:

```
Resource Health: ⚠ warn — RAM free 3.1 GB below threshold 4 GB; capping agents-per-wave at 2.
```

When verdict is `warn` or `critical`, use the AskUserQuestion tool to present:
1. **Proceed as recommended** (apply the cap) — Recommended
2. **Proceed as originally planned** (user accepts the risk)
3. **Abort** (no wave planning runs; user closes or investigates)

When SSH is detected and the session type is `deep`, auto-append this note to the plan handoff to session-plan (no user prompt needed):
> Host is SSH-attached — Docker-dependent wave steps should run on a local dev host.

### Integration with session-plan

When Phase 4.5 recommends a cap, pass that cap into the session-plan handoff. session-plan honors the cap by reducing `agents-per-wave` for the upcoming plan, regardless of what the Session Config default says. This is an in-session override, not a config mutation.

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

## Phase 7.5: Mode-Selector Pre-Pass (Epic #271 Phase B-2)

> Skip this phase if `persistence` config is `false`, or if the entire Phase 6.6 block was skipped.
> This is the **first wired invocation point** of `selectMode` (previously documented as "None wired" in `skills/mode-selector/SKILL.md` — Phase C `/autopilot` is the second, reserved for #277).

Run immediately before Phase 8 so the Mode-Selector recommendation can influence the AUQ option ordering.

### Distinction from Phase 1.5 Recommendations Banner

Phase 1.5 renders a `📋` banner that reads the **previous** session's archived Recommendation fields from STATE.md (`recommended-mode`, `rationale`, `completion-rate`, etc., written by session-end Phase 3.7a). It is a backward-looking handoff signal.

Phase 7.5 runs `selectMode(signals)` — a **forward-looking** computation over live signals gathered this session (current carryover ratios, recent sessions trend, learnings, bootstrap tier). It emits a `📊` banner.

Both banners may render in the same session-start run. That is intentional: the `📋` banner tells you what the last session recommended; the `📊` banner tells you what the selector computes from all available data right now. They should usually agree. When they diverge, the `📊` signal is more current and should be treated as authoritative.

### Step 1: Build Signals

Invoke `buildLiveSignals` from `scripts/lib/build-live-signals.mjs` to assemble the `signals` object. The helper composes all six source modules (state-md, sessions.jsonl, bootstrap.lock, scanBacklog, learnings, vaultStaleness reserved) with graceful-null on every failure. Pure async, never throws.

```js
import { buildLiveSignals } from '$PLUGIN_ROOT/scripts/lib/build-live-signals.mjs';

// Pass the surfaced top-N learnings (already computed in Phase 6.6) to avoid
// re-reading learnings.jsonl. Other paths default to canonical locations
// (.claude/STATE.md, .orchestrator/metrics/sessions.jsonl, .orchestrator/bootstrap.lock).
const signals = await buildLiveSignals({
  learnings: surfacedTopLearnings,   // array, may be empty
  backlogLimit: 50,
});
```

`buildLiveSignals` is the single SSOT for the Signals shape consumed by `selectMode` and by the autopilot driver protocol (see `skills/autopilot/SKILL.md § Production Wiring`). Phase 7.5 here and the autopilot in-process driver MUST go through this helper — do not inline the recipe in either call site.

**Key source bindings (Phase → field):**

| `signals` field | Populated from | Phase |
|---|---|---|
| `recommendedMode` | `parseRecommendations(frontmatter).mode` | Phase 1.5 |
| `carryoverRatio` | `parseRecommendations(frontmatter).carryoverRatio` | Phase 1.5 |
| `completionRate` | `parseRecommendations(frontmatter).completionRate` | Phase 1.5 |
| `previousRationale` | `parseRecommendations(frontmatter).rationale` | Phase 1.5 |
| `topPriorities` | `parseRecommendations(frontmatter).priorities` | Phase 1.5 |
| `recentSessions` | tail-10 of `.orchestrator/metrics/sessions.jsonl` | Phase 6.6 |
| `bootstrapLock` | `.orchestrator/bootstrap.lock` via `parseBootstrapLock` | Phase 4 |
| `learnings` | surfaced top-N learnings (confidence > 0.3) | Phase 6.6 |
| `backlog` | `scanBacklog({limit: 50})` from `backlog-scan.mjs` (live VCS scan) | Phase 7.5 Step 1 |

### Step 2: Invoke selectMode

Wrap the call in a try/catch. `selectMode` is a pure function with a defensive null-guard and should never throw, but if it does the session must not be blocked.

```js
let recommendation = null;

try {
  recommendation = selectMode(signals);
} catch (err) {
  // Log to sweep.log as mode-selector-error — no banner, continue to Phase 8.
  try {
    const { appendFileSync, mkdirSync } = await import('node:fs');
    mkdirSync('.orchestrator/metrics', { recursive: true });
    appendFileSync(
      '.orchestrator/metrics/sweep.log',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'mode-selector-error',
        detail: String(err?.message ?? err),
      }) + '\n',
    );
  } catch {}
  // Fall through: recommendation stays null → no banner, Phase 8 uses default AUQ ordering.
}
```

### Step 3: Render the 📊 Banner (conditional)

```js
const pct = (x) => Math.round(x * 100) + '%';

if (!recommendation || recommendation.confidence === 0.0) {
  // No banner. Fall through to Phase 8 with default (unmodified) AUQ ordering.

} else if (recommendation.confidence < 0.5) {
  // Low-confidence suggestion — informational banner only.
  // Do NOT pre-select this mode as the AUQ "Recommended" option.
  console.log(
    `📊 Mode-Selector suggests: ${recommendation.mode}` +
    ` (confidence: ${pct(recommendation.confidence)}) — ${recommendation.rationale}`
  );
  // Phase 8 AUQ ordering: unchanged from default. The banner is purely informational.

} else {
  // confidence >= 0.5 — pre-select as AUQ option 1 with "(Recommended by Mode-Selector)" label.
  console.log(
    `📊 Mode-Selector recommends: ${recommendation.mode}` +
    ` (confidence: ${pct(recommendation.confidence)}) — ${recommendation.rationale}`
  );
  // Phase 8 AUQ ordering: modified — see Step 4.
}
```

### Step 4: AUQ Option Ordering Protocol (Phase 8 integration)

Phase 8 reads `presentation-format.md` for the AUQ structure. The Mode-Selector output modifies option ordering **only when `recommendation.confidence >= 0.5`**. Do not modify `presentation-format.md` — the ordering adjustment is a runtime protocol applied at the call site in Phase 8.

**When `recommendation.confidence >= 0.5`:**

1. AUQ option 1 label: `"<recommendation.mode> (Recommended by Mode-Selector)"`.  
   AUQ option 1 description: `recommendation.rationale` + any relevant focus issues from Phase 3/6.
2. `recommendation.alternatives` (when non-empty, may have up to 3 entries) become options 2..N.  
   Each alternative label: `"<alt.mode> (confidence: <pct(alt.confidence)>%)"`.  
   Each alternative description: a brief label derived from the mode name (e.g. "housekeeping → cleanup cycle", "feature → standard incremental delivery").
3. Total AUQ options ≤ 4 (AUQ tool cap). If `alternatives.length >= 3`, show the first 2 and add a final option: `"Other (specify)"` with description `"Enter a custom mode or focus not listed above."`.
4. Any previously-computed focus recommendations from the Session Overview (Phase 8's ## Recommended Focus section) are folded into the descriptions of whichever option matches that mode. They are NOT added as separate AUQ options.

**When `recommendation.confidence < 0.5` (including `0.0`):**

AUQ option ordering is **unchanged** from the existing `presentation-format.md` default. The `📊` banner (if rendered) is informational only and does not influence option ordering.

**Codex CLI / Cursor IDE fallback (no AUQ tool):**

When operating on Codex CLI or Cursor IDE, apply the same ordering logic but render as a numbered Markdown list (per `presentation-format.md` Codex fallback section). When `confidence >= 0.5`, prefix option 1 with `(Recommended by Mode-Selector)`.

### Step 5: Graceful No-Op Rules

All of the following result in **no banner and default AUQ ordering** — they are silent no-ops that do not block session startup:

| Condition | Why | Behaviour |
|---|---|---|
| `persistence: false` | Phase 6.6 skipped, no learnings/sessions data | Phase 7.5 skipped entirely |
| STATE.md absent | `rec === null`, all Phase-A `signals.*` are null | `selectMode` returns `confidence: 0.0` → no banner |
| Pre-v1.1 STATE.md (no Phase A fields) | `parseRecommendations` returns `null` → `rec === null` | Same as above |
| `selectMode` throws (should never happen) | Pure function contract violation | `mode-selector-error` logged to sweep.log, no banner |
| `recommendation.confidence === 0.0` | Default fallback branch in selector | No banner, default ordering |
| `recommendation === null` (catch path) | Error during invocation | No banner, default ordering |
| `.orchestrator/bootstrap.lock` absent | `bootstrapLockObj === null` | Signals still valid; lock contributes 0 delta |
| `sessions.jsonl` absent or < 1 entry | `recentSessions: []` | Signals still valid; trend contributes 0 delta |
| `glab`/`gh` CLI missing or non-zero exit | `scanBacklog` returns null | `signals.backlog: null`; backlog signal contributes 0 delta. Phase B-3 (#293). |
| no git origin | `detectVcs()` returns null → `scanBacklog` short-circuits | Same as above |

Note: `selectMode` is designed to NEVER throw (pure function, defensive null-guard). The try/catch in Step 2 is belt-and-suspenders. If it does throw, the `mode-selector-error` breadcrumb in sweep.log is the observable signal for debugging without blocking the session.

### Step 6: Record Mode-Selector Accuracy Learning (post-AUQ, Phase B-4)

Runs **after Phase 8 collects the user's mode choice** (or skip on Codex/Cursor numbered-list response). This step writes a `mode-selector-accuracy` learning to `.orchestrator/metrics/learnings.jsonl` so future Mode-Selector heuristic tuning has feedback data. Phase B-4 (#294).

**Trigger conditions (ALL must be true):**

1. Phase 7.5 produced a non-null `recommendation` (banner rendered — Step 3 was either the `< 0.5` or `>= 0.5` branch).
2. The user actively confirmed or overrode via AUQ (or numbered-list reply on Codex/Cursor). Timeouts and aborts do NOT trigger a write.
3. `recommendation.mode` and the user's chosen mode are both valid `isValidMode` values from `recommendations-v0.mjs`.

**Skip silently when:**

- Phase 7.5 was skipped (`persistence: false` or Phase 6.6 skipped).
- `recommendation === null` or `recommendation.confidence === 0.0` (no banner rendered).
- The chosen mode does not parse cleanly (e.g., custom "Other" free-text response).

**Write contract (delegated to `recordAccuracy` in `mode-selector-accuracy.mjs`):**

```js
import { recordAccuracy } from '$PLUGIN_ROOT/scripts/lib/mode-selector-accuracy.mjs';

// After Phase 8 AUQ resolves with the user's choice:
const result = await recordAccuracy({
  recommended: recommendation.mode,   // from Phase 7.5 Step 2
  chosen:      userChosenMode,        // from Phase 8 AUQ answer, normalized to canonical mode
  sessionId:   `${branch}-${ymd}-${hhmm}`, // matches the wave-executor session_id format
});

if (!result.ok) {
  // Log to sweep.log as mode-selector-accuracy-skip; never block session-start.
  appendFileSync(
    '.orchestrator/metrics/sweep.log',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'mode-selector-accuracy-skip',
      detail: result.reason, // 'no-recommendation' | 'unknown-mode' | 'missing-session-id' | 'append-failed: ...'
    }) + '\n',
  );
}
```

**Lifecycle handling (NOT this step's job):**

The helper writes a fresh entry at `confidence: 0.5`. The +0.15 confirm / -0.20 contradict semantics are applied later by `evolve` and `session-end` when the same `(type, subject)` pair recurs across sessions. Subject pattern: `<recommended>-selected-vs-<chosen>` — agreement and override outcomes land at distinct subjects so they accumulate independently.

**Graceful no-op rules** (none of these block session-start):

| Condition | Behaviour |
|---|---|
| recommendation is null | helper returns `{ok: false, reason: 'no-recommendation'}` |
| chosen mode unparsable | helper returns `{ok: false, reason: 'unknown-mode'}` |
| `appendLearning` validation fails | helper returns `{ok: false, reason: 'append-failed: ...'}` |
| learnings.jsonl write I/O error | same as above; sweep.log captures detail |

### References

- Implementation: `scripts/lib/mode-selector.mjs::selectMode`
- Skill contract: `skills/mode-selector/SKILL.md`
- Phase A parser: `scripts/lib/state-md.mjs::parseRecommendations`
- Phase A writer: `skills/session-end/SKILL.md` Phase 3.7a
- Bootstrap lock reader: `scripts/lib/bootstrap-lock-freshness.mjs::parseBootstrapLock`
- Session normalizer: `scripts/lib/session-schema.mjs::normalizeSession`
- Backlog signal: `scripts/lib/backlog-scan.mjs::scanBacklog` (Phase B-3, #293)
- Accuracy helper: `scripts/lib/mode-selector-accuracy.mjs::recordAccuracy` (Phase B-4, #294)
- PRD: `docs/prd/2026-04-25-mode-selector.md`
- Issues: [#292 Phase B-2 integration](https://gitlab.gotzendorfer.at/infrastructure/session-orchestrator/-/issues/292), [#293 Phase B-3 backlog signal](https://gitlab.gotzendorfer.at/infrastructure/session-orchestrator/-/issues/293), [#294 Phase B-4 accuracy feedback](https://gitlab.gotzendorfer.at/infrastructure/session-orchestrator/-/issues/294)

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
