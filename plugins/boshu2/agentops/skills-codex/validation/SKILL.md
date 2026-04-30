---
name: validation
description: 'Run post-implementation validation.'
---
# $validation — Full Validation Phase Orchestrator

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

## Strict Delegation Contract (default)

Validation delegates to `$vibe`, `$post-mortem`, `$retro`, and `$forge` (plus lifecycle skills `$test`, `$deps`, `$review`, `$perf`) as **separate skill invocations**. Strict delegation is the **default**.

**Anti-pattern to reject:** spawning judges directly in place of `$vibe`, inlining post-mortem analysis, skipping `$forge`. See [`../shared/references/strict-delegation-contract.md`](../shared/references/strict-delegation-contract.md) for the full contract and supported compression escapes (`--quick`, `--no-retro`, `--no-forge`, `--no-lifecycle`, `--no-behavioral`, `--allow-critical-deps`).

See [`.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md`](../../.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md) for the live compression signature.

## DAG — Execute This Sequentially

```
mkdir -p .agents/rpi
detect complexity from execution-packet or --complexity flag (default: standard)
detect ao CLI availability
```

### Step 0: Load Prior Validation Context

Before running the validation pipeline, pull relevant learnings from prior reviews:

```bash
if command -v ao &>/dev/null; then
    ao lookup --query "<epic or goal context> validation review patterns" --limit 5 2>/dev/null || true
fi
```

**Apply retrieved knowledge (mandatory when results returned):**

If learnings are returned, do NOT just load them as passive context. For each returned item:
1. Check: does this learning apply to the current validation scope? (answer yes/no)
2. If yes: include it as a `known_risk` — what pattern does it warn about? does the code exhibit it?
3. Cite applicable learnings by filename when they influence a validation finding

After applying, record each citation:
```bash
ao metrics cite "<learning-path>" --type applied 2>/dev/null || true
```

Skip silently if ao is unavailable or returns no results.

**Run every step in order. Do not stop between steps.**

```
STEP 1  ──  $vibe recent [--quick]
              Use --quick for fast/standard. Full council for full.
              PASS/WARN? → continue
              FAIL?      → write summary, output <promise>FAIL</promise>, stop
                           (validation cannot fix code — caller decides retry)

STEP 1.5 ── Four-Surface Closure (mandatory)
              Read `skills/validation/references/four-surface-closure.md` for the mandatory four-surface closure check.
              Check all four surfaces: Code, Documentation, Examples, Proof.
              All 4 pass? → continue
              if --strict-surfaces:
                Any surface fails? → FAIL, write summary, output <promise>FAIL</promise>, stop
              else (default):
                Code passes, others fail? → WARN, continue
                Code fails? → BLOCK, write summary, output <promise>FAIL</promise>, stop

STEP 1.6 ── Test pyramid coverage audit (advisory, append to summary)
              Check L0-L3 + BF1/BF4 per modified file. WARN only, not FAIL.

STEP 1.7 ── Lifecycle Checks (advisory except critical dependency findings)
              Skip entire step if: --no-lifecycle flag.
              Each sub-step uses --quick mode to limit context consumption.
              On budget expiry: skip remaining sub-steps, write [TIME-BOXED].

              a) if lifecycle tier >= minimal AND test_framework_detected:
                   $test coverage --quick
                   Append coverage delta to phase summary.

              b) if lifecycle tier >= standard AND dependency_manifest_exists:
                   $deps vuln --quick
                   CRITICAL vulns (CVSS >= 9.0): **FAIL** (block shipping). Opt-out: `--allow-critical-deps` for acknowledged risk acceptance.
                   Non-critical: advisory note only.

              c) if lifecycle tier >= standard:
                   $review --diff --quick
                   Append review findings to summary as advisory.

              d) if lifecycle tier == full AND modified_files_touch_hot_path:
                   $perf profile --quick
                   Append perf findings to summary as advisory.
                   Hot path detection: modified files match benchmark files
                   or patterns (handler, middleware, router, parser, engine,
                   worker, pool, codec).

STEP 1.8 ── Stage 4: Behavioral Validation (holdout scenarios + agent-built specs)
            Skip if: no .agents/holdout/ directory AND no .agents/specs/ directory
            Skip if: --no-behavioral flag set
            
            Sub-steps:
              a) List active scenarios and agent-built specs:
                   ao scenario list --status active 2>/dev/null
                   find .agents/specs -name "*.json" -type f 2>/dev/null
              a.5) For each agent-built spec in .agents/specs/, treat as a scenario
                   with source="agent". Validate against scenario schema (auto-* id
                   pattern). Add to evaluation set alongside holdout scenarios.
              b) If 0 scenarios AND 0 specs → skip with note "No behavioral validation artifacts found"
              c) Spawn evaluator council with AGENTOPS_HOLDOUT_EVALUATOR=1
                 Pass scenarios + implementation diff as judge context
              d) Each judge evaluates: "Does the implementation satisfy the scenario's
                 expected_outcome? Score each acceptance_vector dimension 0.0-1.0."
              e) Compute satisfaction_score per scenario (mean of dimension scores)
              f) Aggregate: mean satisfaction across all scenarios
              g) Gate:
                   mean >= scenario.satisfaction_threshold → PASS
                   mean >= 0.5 → WARN ("Partial satisfaction — review scenarios")
                   mean < 0.5 → FAIL ("Implementation does not satisfy holdout scenarios")
              h) Write results to .agents/rpi/scenario-results.json
              i) Include satisfaction_score in validation_state
            
            PASS/WARN? → continue to STEP 2
            FAIL? → write summary, output <promise>FAIL</promise>, stop

STEP 2  ──  if epic_id:
              $post-mortem <epic-id> [--quick]
            else:
              $post-mortem recent [--quick]
              Use --quick for fast/standard. Full council for full.
              PASS/WARN? → continue
              FAIL?      → write summary, output <promise>FAIL</promise>, stop

STEP 3  ──  if not --no-retro:
              $retro

STEP 4  ──  if not --no-forge AND ao available:
              if [ -n "${CODEX_THREAD_ID:-}" ] || [ "${CODEX_INTERNAL_ORIGINATOR_OVERRIDE:-}" = "Codex Desktop" ]; then
                ao codex ensure-stop --auto-extract 2>/dev/null || true
              else
                ao forge transcript --last-session --queue --quiet 2>/dev/null || true
              fi

STEP 5  ──  write phase summary to .agents/rpi/phase-3-summary-YYYY-MM-DD-<slug>.md
              ao ratchet record vibe 2>/dev/null || true
              output <promise>DONE</promise>
```

**That's it.** Steps 1→2→3→4→5. No stopping between steps.

---

## Setup Detail

Track state inline: `epic_id`, `complexity`, `no_retro`, `no_forge`, `strict_surfaces`, `vibe_verdict`, `post_mortem_verdict`. Load execution packet (if available): read `complexity`, `contract_surfaces`, and `done_criteria` from `.agents/rpi/execution-packet.json`. When a current `run_id` is known, prefer the matching `.agents/rpi/runs/<run-id>/execution-packet.json` archive over the latest alias.

## Gate Detail

**Validation has multiple blocking conditions.** Validation cannot fix code — it can only report and fail closeout when the lifecycle contract is not met.

- **Blocking FAIL conditions:** `$vibe` FAIL, code-surface failure in STEP 1.5, `--strict-surfaces` failure on any closure surface, CVSS >= 9.0 dependency findings in STEP 1.7b unless `--allow-critical-deps`, and post-mortem FAIL in STEP 2.
- **PASS/WARN:** Log verdicts, continue through the remaining steps.
- **FAIL:** Extract findings from the latest evaluator output, write phase summary with FAIL status, output `<promise>FAIL</promise>` with findings attached. Suggest: `"Validation FAIL. Fix findings, then re-run $validation [epic-id]"`.

**Why no internal retry:** Retries require re-implementation (`$crank`). The caller (`$rpi` or human) decides whether to loop back.

## Phase Summary Format

Write to `.agents/rpi/phase-3-summary-YYYY-MM-DD-<slug>.md`:

```markdown
# Phase 3 Summary: Validation

- **Epic:** <epic-id or "standalone">
- **Vibe verdict:** <PASS|WARN|FAIL>
- **Post-mortem verdict:** <verdict or "skipped">
- **Retro:** <captured|skipped>
- **Forge:** <mined|skipped>
- **Complexity:** <fast|standard|full>
- **Status:** <DONE|FAIL>
- **Timestamp:** <ISO-8601>
```

## Phase Budgets

| Sub-step | `fast` | `standard` | `full` |
|----------|--------|------------|--------|
| Vibe | 2 min | 3 min | 5 min |
| Post-mortem | 2 min | 3 min | 5 min |
| Retro | 1 min | 1 min | 2 min |
| Forge | skip | 2 min | 3 min |

On budget expiry: allow in-flight calls to complete, write `[TIME-BOXED]` marker, proceed.

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--complexity=<level>` | auto | Force complexity level (fast/standard/full) |
| `--no-lifecycle` | off | Skip ALL lifecycle checks in STEP 1.7 (test, deps, review, perf) |
| `--lifecycle=<tier>` | matches complexity | Controls which lifecycle skills fire: `minimal` (test only), `standard` (+deps, +review), `full` (+perf) |
| `--no-retro` | off | Skip retro step only |
| `--no-forge` | off | Skip forge step only |
| `--no-budget` | off | Disable phase time budgets |
| `--strict-surfaces` | off | Make all 4 surface failures blocking (FAIL instead of WARN). Passed automatically by `$rpi --quality`. |
| `--allow-critical-deps` | off | Allow shipping with CVSS >= 9.0 vulnerabilities (acknowledged risk acceptance) |

## Quick Start

```bash
$validation ag-5k2                        # validate epic with full close-out
$validation                               # validate recent work (no epic)
$validation --complexity=full ag-5k2      # force full council ceremony
$validation --no-retro ag-5k2             # skip retro only
$validation --no-forge ag-5k2             # skip forge only
```

## Completion Markers

```
<promise>DONE</promise>    # Validation passed, learnings captured
<promise>FAIL</promise>    # Vibe failed, re-implementation needed (findings attached)
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Vibe FAIL on first run | Implementation has quality issues | Fix findings via `$crank`, then re-run `$validation` |
| Post-mortem reviewed recent work instead of an epic | No epic-id provided | Pass epic-id for epic-scoped closeout: `$validation ag-5k2` |
| Codex closeout missing | Codex has no session-end hook surface | Let `$validation` run `ao codex ensure-stop`, or run `ao codex ensure-stop` manually before leaving the session |
| Forge produces no output | No ao CLI or no transcript content | Install ao CLI or run `$retro` manually |
| Stale execution-packet | Packet from a previous RPI cycle | Delete `.agents/rpi/execution-packet.json` and pass `--complexity` explicitly |

## Reference Documents

- [references/four-surface-closure.md](references/four-surface-closure.md) — four-surface closure validation (code + docs + examples + proof)
- [references/forge-scope.md](references/forge-scope.md) — forge session scoping and deduplication
- [references/idempotency-and-resume.md](references/idempotency-and-resume.md) — re-run behavior and standalone mode

## See Also

Core phases: [vibe](../vibe/SKILL.md), [post-mortem](../post-mortem/SKILL.md), [retro](../retro/SKILL.md), [forge](../forge/SKILL.md), [crank](../crank/SKILL.md), [discovery](../discovery/SKILL.md), [rpi](../rpi/SKILL.md). Lifecycle Step 1.7: [test](../test/SKILL.md), [deps](../deps/SKILL.md), [review](../review/SKILL.md), [perf](../perf/SKILL.md).
