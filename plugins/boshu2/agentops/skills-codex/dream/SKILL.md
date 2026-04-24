---
name: dream
description: 'Run or review private overnight AgentOps compounding sessions.'
---
# Dream Skill

`$dream` is the interactive surface for the same Dream engine used by
`ao overnight`.

## Compounding Loop (v2)

Dream v2 runs a bounded outer loop of `INGEST -> REDUCE -> MEASURE` iterations until a halt condition fires: wall-clock budget exhausted, plateau (K sub-epsilon deltas in a row), regression beyond a per-metric floor, or metadata integrity failure. Each iteration is atomic and checkpointed so any rollback leaves the corpus clean. Dream is strictly knowledge-only.

Anti-goals (hard constraints):

- NEVER mutates source code.
- NEVER invokes `$rpi` or any code-mutating flow.
- NEVER performs git operations (no commits, branches, push, rebase, checkout).
- NEVER creates symlinks anywhere.
- No swarm/gc fan-out inside iterations in the first slice (serial only).

## Execution Steps

### Step 1: Route the request

- `setup` -> `ao overnight setup`
- `curator` or local Gemma worker requests -> `ao overnight curator status|diagnose|enqueue|compact|event`
- `start` or `run` -> `ao overnight start`
- `report` -> `ao overnight report`

### Step 2: Setup lane

Use `ao overnight setup` to inspect host constraints, runner availability,
scheduler mode, and keep-awake behavior.

```bash
ao overnight setup
ao overnight setup --apply --runner codex --runner claude --at 01:30
```

Default to preview. Use `--apply` only when the user explicitly wants Dream
config or scheduler artifacts persisted. Setup detects Tier 1 local curator
state separately from Tier 2 Dream Council runners.

### Step 2a: Local curator lane

Use `ao overnight curator` when the user asks about Gemma, Ollama, the local
worker, SOC trigger signals, Tier 1 drafts, or pending LOG compaction.

```bash
ao overnight curator status --json
ao overnight curator diagnose
ao overnight curator enqueue --kind lint-wiki
ao overnight curator enqueue --kind dream-seed
ao overnight curator compact --dry-run
ao overnight curator event --source local-soc --severity high --desired-action "review alert cluster" --budget 1
```

The first supported local curator shape is Ollama + Gemma under
`dream.local_curator.*`. Treat it as a Tier 1 draft/lint/triage lane, not as a
Dream Council runner. Gemma may enqueue allowlisted knowledge jobs and emit
needs-review event records; Codex and Claude remain Tier 2 review/synthesis
runners; humans own promotion into durable authored memory.

Do not create an unbounded model-to-model loop. Any escalation needs an explicit
source, severity, desired action, escalation target, budget, and ledger entry.

### Step 3: Bedtime run lane

Use `ao overnight start` for the actual private local run.

```bash
ao overnight start --goal "close the loop on today's auth work"
ao overnight start --goal "stabilize release follow-ups" --runner codex --runner claude --creative-lane
$dream start --queue=.agents/dream/tonight.md
$dream start --max-iterations=3
$dream start --warn-only=false
```

Expected behavior:

- operates against the real repo-local `.agents` corpus
- writes `summary.json` and `summary.md` (with per-iteration sub-summary entries for each INGEST -> REDUCE -> MEASURE pass)
- persists each iteration atomically to `<output-dir>/<runID>/iterations/iter-<N>.json`; resumed runs rehydrate prior iterations from disk instead of starting from a clean slate (Micro-epic 2)
- degrades honestly when soft-fail steps or keep-awake helpers are unavailable

### Step 4: Morning report lane

Use `ao overnight report` to render the latest Dream result.

```bash
ao overnight report
ao overnight report --from .agents/overnight/latest
```

When rendering a report, answer four questions fast:

1. What state did I wake up to?
2. What ran overnight?
3. What degraded or failed?
4. What should I do first?

## Key Rules

- Keep Dream settings under the shared `dream.*` control plane.
- Do not promise scheduled execution on a sleeping laptop.
- Do not imply tracked source-code edits overnight.
- GitHub nightly is the public proof harness, not the private Dream engine.

## Delineation vs $evolve

| Lane | Runs | Mutates code? | Mutates corpus? | Outer loop? | Budget |
|------|------|---------------|-----------------|-------------|--------|
| `$dream` | nightly, private local | **No** | **Yes (heavy)** | **Yes (convergence)** | wall-clock + plateau |
| `$evolve` | daytime, operator-driven | Yes (via `$rpi`) | Yes (light) | Yes | cycle cap |

Dream owns the knowledge compounding layer; `$evolve` owns the code compounding layer. Both share fitness-measurement substrate via `corpus.Compute` / `ao goals measure`. Run Dream overnight, then start each day with `$evolve` against the freshly-compounded corpus with a clean fitness baseline.

## See Also

- [Dream Run Contract](../../docs/contracts/dream-run-contract.md)
- [Dream Report Contract](../../docs/contracts/dream-report.md)
