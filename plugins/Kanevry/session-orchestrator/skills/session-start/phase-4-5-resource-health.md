# Phase 4.5: Resource Health (v3.1.0)

> Skip this phase if `resource-awareness: false` in Session Config.

Read `.orchestrator/host.json` (written by `hooks/on-session-start.mjs`) and run a live resource snapshot. Compare against `resource-thresholds` from Session Config to derive an adaptive wave-sizing recommendation before session-plan runs.

## Probe + Evaluate

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

## Adaptive Rules (default thresholds; configurable via `resource-thresholds`)

| Signal | Threshold | Action |
|--------|-----------|--------|
| RAM free below `ram-free-min-gb` (default 4) | warn | Cap `agents-per-wave` at 2 |
| RAM free below `ram-free-critical-gb` (default 2) | critical | Recommend coordinator-direct (0 agents) |
| CPU load above `cpu-load-max-pct` (default 80) sustained | warn | Cap `agents-per-wave` at 2 |
| Claude processes ≥ `concurrent-sessions-warn` (default 5) | warn | Warn; suggest sequencing or waiting |
| SSH session detected AND `ssh-no-docker: true` | info | Append note: host is SSH-attached, Docker-dependent steps should run on a local dev host |

## Presentation

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

## Integration with session-plan

When Phase 4.5 recommends a cap, pass that cap into the session-plan handoff. session-plan honors the cap by reducing `agents-per-wave` for the upcoming plan, regardless of what the Session Config default says. This is an in-session override, not a config mutation.
