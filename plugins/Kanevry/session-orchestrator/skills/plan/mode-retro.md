# Mode: `/plan retro` — Data-Driven Retrospective

> Reference file for the plan skill. Read by SKILL.md when mode is `retro`.
> Covers: automatic data collection, structured reflection (1-2 waves), improvement artifacts.

---

## Phase 1: Data Collection (Automatic)

Gather ALL data before asking questions. No user input. Present a dashboard when done.

### 1.1 Session Metrics

Read `.orchestrator/metrics/sessions.jsonl`. Extract per entry:

- `session_type`, `started_at`, `completed_at`, `duration_seconds`
- `effectiveness.completion_rate`, `effectiveness.planned_issues`, `effectiveness.completed`, `effectiveness.carryover`
- `agent_summary.complete`, `agent_summary.partial`, `agent_summary.failed`, `agent_summary.spiral`
- `waves[].role`, `waves[].agent_count`, `waves[].files_changed`, `waves[].quality`

Compute aggregates:
- Total sessions, average duration, session type distribution (deep/feature/housekeeping)
- Average completion rate, total carryover rate (carryover / planned across all sessions)
- Agent success rate (complete / total dispatched), spiral rate (spiral / total)
- Most common wave roles, average files changed per wave

If the file does not exist or is empty, note "No session metrics available" and continue.

### 1.2 Git Analysis

```bash
git log --oneline -50
git log --format="%H %s" --since="2 weeks ago"
git log --format="%H" --since="2 weeks ago" | xargs -I{} git diff-tree --no-commit-id --name-only -r {} | sort | uniq -c | sort -rn | head -20
```

Record: total commits (2 weeks), frequency per day, top 20 change hotspots with counts.

### 1.3 Open Issues

Query via VCS CLI (per gitlab-ops skill):
- **Overdue**: older than `stale-issue-days` without progress
- **Blocked**: `blocked` label or `is-blocked-by` links
- **Stale**: no activity in `stale-issue-days` days (default: 14)

### 1.4 Trend Analysis

Compare **last 5 sessions** vs **sessions 6-10**. Identify:
- Completion rate trend (improving/declining/stable, >/< 5% threshold)
- Session type mix shift
- Recurring agent failures (same role failing across sessions)
- Wave sizing patterns (agent count, wave count changing)

If fewer than 10 sessions exist, use all available data and note limited sample.

### 1.5 Data Summary Dashboard

```
## Data Summary
- Sessions: N total (X deep, Y feature, Z housekeeping)
- Completion: X% average (trend: up/down/stable)
- Agent health: X% success, Y% spiral rate
- Change hotspots: file1 (N changes), file2 (M changes)
- Open issues: N total (X overdue, Y blocked, Z stale)
```

Omit sections where no data was found. Show trends only with 5+ sessions of comparison data.

---

## Phase 2: Reflection (1-2 Waves)

### Pre-Wave Research

Dispatch 3 Explore agents in parallel before Wave 1:

```
Agent({ subagent_type: "Explore", description: "Read session memory files",
  prompt: "Read session memory files for retrospective context. On Claude Code: read session-*.md in ~/.claude/projects/<project>/memory/. On Codex CLI and Cursor IDE: skip this research — session memory is not available. Summarize: accomplishments, frustrations, scope changes, patterns." })

Agent({ subagent_type: "Explore", description: "Analyze git log patterns",
  prompt: "Analyze git log (2 weeks). Identify: large commits (>20 files), hotfix patterns, reverts, frequency distribution." })

Agent({ subagent_type: "Explore", description: "Analyze open issues for themes",
  prompt: "Read open issues from VCS. Categorize by type/area. Identify: recurring themes, repeated bugs, chronic carryover." })
```

Synthesize findings into Wave 1 questions.

### Wave 1 — What Went Well / What Didn't (5 questions)

Present via 2 AskUserQuestion calls (3+2 split).

**Call 1:**

1. **Highlights** — Top 3 data-backed successes. Options: `Confirm (Recommended)` | `Reorder/adjust` | `Add my own`
2. **Blockers** — Top 3 data-backed problems with root causes. Options: `Confirm (Recommended)` | `Different root causes` | `Add blockers`
3. **Carryover** — Unfinished issues from recent sessions (from `effectiveness.carryover` + `[Carryover]` prefixed issues). Options: `All still relevant (Recommended)` | `Cancel some` | `Reprioritize`

**Call 2:**

4. **Process** — Session structure assessment based on observed wave/agent patterns. Options: `Process is working well (Recommended)` | `Adjust wave/agent sizing` | `Change session type mix` | `Other`
5. **Surprises** — Open-ended. Present data anomalies as starters. Options: `No surprises (Recommended)` | `Positive surprise` | `Negative surprise` | `Other`

### Wave 2 — Improvements (Conditional)

> Trigger if Wave 1 reveals: significant blockers (Q2), process issues (Q4 not "working well"), or user explicitly requests actions. Otherwise skip to Phase 3.

**Call 1:**

1. **Improvement actions** — Propose 3-5 concrete improvements. Each with: action, expected impact, effort. `multiSelect: true`. Example: `Add pre-commit type checks (Recommended)` — "Impact: reduce type errors ~50%. Effort: 1h."
2. **Priority** — Rank selected improvements. Present in recommended order, user reorders.
3. **Ownership** — When to tackle each. Options: `All in next session (Recommended)` | `Spread across sessions` | `Assign to specific sessions`

**Call 2:**

4. **Baseline changes** — Only if recurring issues (3+ sessions, same root cause). Propose specific template/script/rule changes. Options: `No changes needed (Recommended)` | `Apply suggested` | `Custom changes`
5. **Session Config changes** — Propose config adjustments (e.g., `agents-per-wave`, `discovery-exclude-paths`, `stale-issue-days`). Options: `No changes needed (Recommended)` | `Apply suggested` | `Custom changes`

---

## Phase 3: Artifacts

### 3.1 Retro Document

1. Read `retro-template.md` from this skill directory
2. Fill with Phase 1 data + Phase 2 answers
3. Metrics section: auto-generated from `sessions.jsonl` — no user input for numbers
4. Highlights/Improvement sections: reflect user-confirmed answers, not raw data
5. Save to `{plan-retro-location}/YYYY-MM-DD-retro.md` (`mkdir -p` if needed)
6. Present path to user for review via AskUserQuestion

### 3.2 Improvement Issues

Create one VCS issue per agreed improvement from Wave 2:
- **Title**: `[Retro] <action description>`
- **Labels**: `type:enhancement`, `priority:<from ranking>`, `area:<inferred>`
- **Description**: action, impact, effort, link to retro document
- Create via VCS CLI (per gitlab-ops skill)

Skip if Wave 2 was not triggered.

### 3.3 Update Learnings

Append new patterns to `.orchestrator/metrics/learnings.jsonl`. Use the same JSONL schema as session-end writes (see session-end/SKILL.md for canonical field reference):

```json
{
  "id": "<uuid-v4>",
  "type": "fragile-file|effective-sizing|recurring-issue|scope-guidance|deviation-pattern",
  "subject": "<what the learning is about>",
  "insight": "<the actual learning>",
  "evidence": "<supporting data>",
  "confidence": 0.5,
  "source_session": "retro-YYYY-MM-DD",
  "created_at": "<ISO 8601>",
  "expires_at": "<ISO 8601 + learning-expiry-days (default: 30)>"
}
```

Typical retro learning types:
- `fragile-file` — hotspots correlating with failures or carryover
- `effective-sizing` — wave/agent configs producing best completion rates
- `recurring-issue` — problem patterns across multiple sessions
- `scope-guidance` — session scope calibration insights
- `deviation-pattern` — systematic plan deviations indicating planning gaps

Before writing, check existing entries for matching `type` + `subject`. Confirm (+0.15 confidence, cap 1.0) or contradict (-0.2). New learnings start at 0.5.

### 3.4 Optional Baseline Update

If Wave 2 Q4 identified baseline changes:
1. Propose specific modifications (file path, before/after content)
2. Present via AskUserQuestion — user MUST confirm before any baseline modification
3. Apply to `$BASELINE_PATH` (from Session Config `plan-baseline-path`)
4. If declined, skip entirely

Never modify baseline files without explicit user confirmation.
