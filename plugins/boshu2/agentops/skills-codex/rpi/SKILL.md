---
name: rpi
description: 'Full RPI lifecycle orchestrator. Delegates to $discovery, $crank, $validation phase skills. One command, full lifecycle with complexity classification, --from routing, and optional loop. Triggers: "rpi", "full lifecycle", "research plan implement", "end to end".'
---

# $rpi — Full RPI Lifecycle Orchestrator
> **Quick Ref:** One command, full lifecycle. `$discovery` → `$crank` → `$validation`. Thin wrapper that delegates to phase orchestrators.
**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**
**THREE-PHASE RULE + FULLY AUTONOMOUS.** Read `references/autonomous-execution.md` — it defines the mandatory 3-phase lifecycle, autonomous execution rules, anti-patterns, and phase completion logging. Unless `--interactive` is set, RPI runs hands-free. Do NOT stop after Phase 2. Do NOT ask the user anything between phases.

## Strict Delegation Contract (default)

RPI delegates via `$discovery`, `$crank`, `$validation` as **separate skill invocations**. Strict delegation is the **default** — there is no `--full` flag because strict delegation is always on.

**Anti-pattern to reject:** compressing phases into one pass, substituting direct agent-spawns for `$skill` invocations, skipping `$validation`. See [`../shared/references/strict-delegation-contract.md`](../shared/references/strict-delegation-contract.md) for the full contract, rationalizations to reject, supported compression escapes (`--quick`, `--fast-path`, `--from=<phase>`, `--no-retro`, `--no-forge`, `--no-budget`), and detection rules.

A live compression was observed 2026-04-19; see [`.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md`](../../.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md).

## Codex Lifecycle Guard

When this skill runs in Codex hookless mode (`CODEX_THREAD_ID` is set or
`CODEX_INTERNAL_ORIGINATOR_OVERRIDE` is `Codex Desktop`), ensure startup context
before phase orchestration:

```bash
ao codex ensure-start 2>/dev/null || true
```

`ao codex ensure-start` is the single startup guard for Codex skills. It records
startup once per thread and skips duplicate startup automatically. Let
`$validation`, `$post-mortem`, or `$handoff` own the hookless closeout path via
`ao codex ensure-stop`.

## Objective Scope Guard

`$rpi` owns one lifecycle objective from discovery through validation.

1. Keep one objective spine across phases:
   - if discovery or resume state yields an `epic_id`, preserve that `epic_id`
   - otherwise preserve the original goal plus execution-packet objective
2. Never replace the current objective with a child issue or one ready slice
   surfaced by `bd ready`, `bd show`, or `.agents/rpi/next-work.jsonl`.
3. When bead IDs are present, resolve them before routing; when beads are absent,
   route by `--from` plus the current goal/execution-packet state.
4. If the input resolves to a child issue with a parent epic, carry the child as
   context only and continue `$rpi` against the parent epic.
5. `<promise>PARTIAL</promise>` from `$crank` means re-enter STEP 2 on the same
   lifecycle objective. It is not completion, and it is not a reason to stop.

Phase ownership stays split even when `$rpi` is the entrypoint: `$discovery`
owns phase-1 sequencing, `$crank` owns phase-2 execution retries, and
`$validation` owns phase-3 closeout. `$rpi` only classifies, routes, loops, and
reports across those phase orchestrators.

## DAG — Execute This Sequentially

```text
mkdir -p .agents/rpi
classify(goal) -> complexity, start_phase
```

**From `--from` or start_phase, enter the DAG at the matching step and run every step after it:**

```text
STEP 1  -- if start_phase <= discovery:
            $discovery <goal> [--interactive] --complexity=<level>
            BLOCKED? -> stop (manual intervention)
            DONE?    -> read the execution packet (latest alias or matching run archive) and preserve its objective spine
            Log: PHASE 1 COMPLETE ✓ (discovery) — proceeding to Phase 2

STEP 2  -- if execution-packet has epic_id:
              $crank <epic-id> [--test-first] [--no-test-first]
            else:
              $crank .agents/rpi/execution-packet.json [--test-first] [--no-test-first]
            PARTIAL? -> retry SAME objective (max 3 total), then stop
            BLOCKED? -> retry SAME objective with block context (max 3 total), then stop
            DONE? -> ao ratchet record implement 2>/dev/null || true
            Log: PHASE 2 COMPLETE ✓ (implementation) — proceeding to Phase 3

STEP 3  -- if execution-packet has epic_id:
              $validation <epic-id> --complexity=<level> [--strict-surfaces if --quality]
            else:
              $validation --complexity=<level> [--strict-surfaces if --quality]
            FAIL? -> re-crank + re-validate (max 3 total), then stop
            DONE? -> ao ratchet record vibe 2>/dev/null || true
            Log: PHASE 3 COMPLETE ✓ (validation) — RPI DONE

STEP 4  -- report(verdicts)
            if --loop && FAIL && cycle < max_cycles: restart from STEP 1
            if --spawn-next: read .agents/rpi/next-work.jsonl, suggest next
```

**That's it.** Steps 1→2→3→4. No stopping between steps. No summarizing. No asking. Enter at `--from`, run to the end. The human's only touchpoint is after STEP 4.

## Setup + Classify (STEP 0 detail)

**Determine start_phase:**
- default: `discovery`
- `--from=implementation` (aliases: `crank`) → STEP 2
- `--from=validation` (aliases: `vibe`, `post-mortem`) → STEP 3
- aliases `research`, `plan`, `pre-mortem`, `brainstorm` → STEP 1
- If input is a bead ID and no `--from`, resolve it before routing:
  - `bd show <id>` says `issue_type=epic` → STEP 2 using that epic ID
  - child issue with `parent` → STEP 2 using the parent epic ID
- If beads are absent or the input is plain goal text:
  - preserve the goal as the lifecycle objective
  - use `.agents/rpi/execution-packet.json` as the phase-2 handoff when discovery does not yield an epic
  - default to STEP 1 unless the user explicitly set `--from`
- Do not infer epic scope from `ag-*` alone

**Classify complexity:**

| Level | Criteria | Behavior |
|-------|----------|----------|
| `fast` | Goal <=30 chars, no complex/scope keywords | Full DAG. Gates use `--quick` throughout. |
| `standard` | Goal 31-120 chars, or 1 scope keyword | Full DAG. Gates use `--quick` |
| `full` | Complex-operation keyword, 2+ scope keywords, or >120 chars | Full DAG. Gates use full council |

**Complex-operation keywords:** `refactor`, `migrate`, `migration`, `rewrite`, `redesign`, `rearchitect`, `overhaul`, `restructure`, `reorganize`, `decouple`, `deprecate`, `split`, `extract module`, `port`

**Scope keywords:** `all`, `entire`, `across`, `everywhere`, `every file`, `every module`, `system-wide`, `global`, `throughout`, `codebase`

**Overrides:** `--deep` forces `full`. `--fast-path` forces `fast`.

Log: `RPI mode: rpi-phased (complexity: <level>)`

Initialize state:
```text
rpi_state = {
  goal: "<goal string>",
  epic_id: null,
  phase: "<discovery|implementation|validation>",
  complexity: "<fast|standard|full>",
  test_first: <true by default; false only when --no-test-first>,
  cycle: 1,
  max_cycles: <3 when --loop; overridden by --max-cycles>,
  verdicts: {}
}
```

## Gate Logic Detail

**STEP 1 gate (discovery):**
- `<promise>DONE</promise>`: read the execution packet (latest alias or matching run archive), preserve `objective`, and use `epic_id` only when it is present. Otherwise pass the execution packet itself to STEP 2.
- `<promise>BLOCKED</promise>`: stop — discovery handles its own retries (max 3 pre-mortem attempts)

**STEP 2 gate (implementation, max 3 attempts):**
- `<promise>DONE</promise>`: proceed to STEP 3
- `<promise>BLOCKED</promise>`: retry `$crank` on the same lifecycle objective with block context (max 2 retries)
- `<promise>PARTIAL</promise>`: retry `$crank` on the same lifecycle objective (max 2 retries). Do not hand off a child issue, narrow to one slice, or stop at a partial phase result.

**STEP 3 gate (validation-to-crank loop, max 3 total):**
- `<promise>DONE</promise>`: proceed to STEP 4
- `<promise>FAIL</promise>`: extract findings → re-invoke `$crank` on the same epic or execution packet → re-invoke `$validation`

**STEP 4 (report + optional loop):**
- Summarize all phase verdicts and epic status. See `references/report-template.md`.
- `--loop` + FAIL + cycle < max_cycles: extract 3 fixes from post-mortem, increment cycle, restart from STEP 1
- `--spawn-next`: read `.agents/rpi/next-work.jsonl`, suggest next `$rpi` command (do NOT auto-invoke)

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--from=<phase>` | `discovery` | Enter DAG at `discovery`, `implementation`, or `validation` |
| `--interactive` | off | Human gates in discovery only |
| `--auto` | on | Fully autonomous. Inverse of `--interactive` |
| `--loop` | off | Post-mortem FAIL triggers new cycle |
| `--max-cycles=<n>` | `3` | Max cycles when `--loop` enabled |
| `--spawn-next` | off | Surface follow-up work after completion |
| `--test-first` | on | Strict-quality (passed to `$crank`) |
| `--no-test-first` | off | Opt out of strict-quality |
| `--fast-path` | auto | Force fast complexity (uses quick inline gates, still runs full lifecycle) |
| `--deep` | auto | Force full complexity |
| `--quality` | off | Pass `--strict-surfaces` to `$validation`, making all 4 surface failures blocking |
| `--dry-run` | off | Report without mutating queue |
| `--no-budget` | off | Disable phase time budgets |

## Quick Start

```bash
$rpi "add user authentication"                        # full DAG
$rpi --interactive "add user authentication"          # human gates in discovery only
$rpi --from=implementation ag-23k                      # enter at STEP 2
$rpi --from=validation                                 # enter at STEP 3
$rpi --loop --max-cycles=3 "add auth"                 # iterate-on-fail loop
$rpi --deep "refactor payment module"                  # force full council
$rpi --fast-path "fix typo in readme"                  # force fast inline gates
```

## Complexity-Scaled Council Gates
### Pre-mortem (STEP 5 in discovery)
complexity == "fast": inline review, no spawning (--quick) | complexity == "standard": inline fast default (--quick) | complexity == "full": full council, 2-judge minimum. Retry gate: max 3 total attempts.

### Final Vibe (STEP 1 in validation)
complexity == "fast": inline review, no spawning (--quick) | complexity == "standard": inline fast default (--quick) | complexity == "full": full council, 2-judge minimum. Retry gate: max 3 total attempts.

### Post-mortem (STEP 2 in validation)
complexity == "fast": inline review, no spawning (--quick) | complexity == "standard": inline fast default (--quick) | complexity == "full": full council, 2-judge minimum. Retry gate: max 3 total attempts.

## Phase Data Contracts

All transitions use filesystem artifacts (no in-memory coupling). The execution packet (`.agents/rpi/execution-packet.json` as the latest alias, plus `.agents/rpi/runs/<run-id>/execution-packet.json` as the per-run archive) carries `contract_surfaces` (repo execution profile), `done_criteria`, and queue claim/finalize metadata between phases. Sub-skills include `$plan`, `$vibe`, `$post-mortem`, and `$pre-mortem`. For detailed contract schemas, read `references/phase-data-contracts.md`.

## Examples
Read `references/examples.md` for full lifecycle, resume, and interactive examples.
## Troubleshooting
Read `references/troubleshooting.md` for common problems and solutions.
**See also:** [discovery](../discovery/SKILL.md), [crank](../crank/SKILL.md), [validation](../validation/SKILL.md)

## Reference Documents

- [references/autonomous-execution.md](references/autonomous-execution.md)
- [references/complexity-scaling.md](references/complexity-scaling.md)
- [references/context-windowing.md](references/context-windowing.md)
- [references/error-handling.md](references/error-handling.md)
- [references/examples.md](references/examples.md)
- [references/gate-retry-logic.md](references/gate-retry-logic.md)
- [references/gate4-loop-and-spawn.md](references/gate4-loop-and-spawn.md)
- [references/phase-budgets.md](references/phase-budgets.md)
- [references/phase-data-contracts.md](references/phase-data-contracts.md)
- [references/report-template.md](references/report-template.md)
- [references/troubleshooting.md](references/troubleshooting.md)

## Local Resources

### references/

- [references/autonomous-execution.md](references/autonomous-execution.md)
- [references/complexity-scaling.md](references/complexity-scaling.md)
- [references/context-windowing.md](references/context-windowing.md)
- [references/error-handling.md](references/error-handling.md)
- [references/examples.md](references/examples.md)
- [references/gate-retry-logic.md](references/gate-retry-logic.md)
- [references/gate4-loop-and-spawn.md](references/gate4-loop-and-spawn.md)
- [references/phase-budgets.md](references/phase-budgets.md)
- [references/phase-data-contracts.md](references/phase-data-contracts.md)
- [references/report-template.md](references/report-template.md)
- [references/troubleshooting.md](references/troubleshooting.md)

### scripts/

- `scripts/validate.sh`
