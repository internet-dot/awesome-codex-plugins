# STATE.md Ownership Contract

> Defines who can read and write `<state-dir>/STATE.md` and under what conditions.
> Referenced by: wave-executor, session-end, session-start, evolve.

## Schema

```yaml
---
schema-version: 1
session-type: feature|deep|housekeeping
branch: <current branch>
issues: [<issue numbers>]
started_at: <ISO 8601 with timezone>
status: active|paused|completed
current-wave: <N>
total-waves: <N>
---
```

### Body Sections

| Section | Purpose | Updated by |
|---------|---------|------------|
| `## Current Wave` | Next wave to execute | wave-executor (post-wave) |
| `## Wave History` | Completed wave records | wave-executor (post-wave) |
| `## Deviations` | Plan adaptation log | wave-executor (step 3) |

## Ownership Model

| Skill | Access | Operations |
|-------|--------|------------|
| **wave-executor** | Read + Write (owner) | Creates STATE.md (Pre-Wave 1b), updates after each wave (current-wave, Wave History, Deviations) |
| **session-end** | Read + Status-only write | Reads for metrics extraction (Phase 1.7), sets `status: completed` (Phase 3.4). Exception: only field modified is `status` in frontmatter. |
| **session-start** | Read-only | Reads for continuity checks (Phase 0.5): inspects `status` field to detect crashed/paused sessions |
| **evolve** | Read-only | Reads `## Deviations` section for deviation pattern extraction (Step 2.2, pattern 5) |

## Guards

### Branch Validation

Before reading STATE.md, verify the `branch` field matches the current branch:

```bash
STATE_BRANCH=$(grep '^branch:' <state-dir>/STATE.md | sed 's/branch: *//')
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$STATE_BRANCH" != "$CURRENT_BRANCH" ]]; then
  # STATE.md belongs to a different branch — treat as stale
  echo "⚠ STATE.md is from branch '$STATE_BRANCH' but current branch is '$CURRENT_BRANCH'. Ignoring."
fi
```

### Schema Version

The `schema-version` field enables future migration. Current version: `1`. If a skill reads a STATE.md with an unrecognized schema-version, it should warn and proceed with best-effort parsing rather than failing.

## Concurrency

STATE.md is NOT safe for concurrent access. Only one session should be active per branch at a time. If session-start detects `status: active`, it prompts the user to resume or start fresh (which overwrites the stale STATE.md).
