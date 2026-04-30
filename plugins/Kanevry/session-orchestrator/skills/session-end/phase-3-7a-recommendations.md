# Phase 3.7a: Compute and Write Recommendations (Epic #271 Phase A)

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
