---
name: discovery
description: 'Create execution packets.'
---
# $discovery — Full Discovery Phase Orchestrator

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

## Strict Delegation Contract (default)

Discovery delegates to `$brainstorm` (conditional), `$design` (conditional), `$research`, `$plan`, and `$pre-mortem` as **separate skill invocations** per step. Strict delegation is the **default**.

**Anti-pattern to reject:** inlining `$research` work, collapsing `$plan` into an inline decomposition, skipping `$pre-mortem`. See [`../shared/references/strict-delegation-contract.md`](../shared/references/strict-delegation-contract.md) for the full contract and supported compression escapes (`--quick`, `--skip-brainstorm`, `--interactive`/`--auto`, `--no-scaffold`).

See [`.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md`](../../.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md) for the live compression signature.

## Codex Lifecycle Guard

When this skill runs in Codex hookless mode (`CODEX_THREAD_ID` is set or
`CODEX_INTERNAL_ORIGINATOR_OVERRIDE` is `Codex Desktop`), ensure startup context
before entering the discovery DAG:

```bash
ao codex ensure-start 2>/dev/null || true
```

`ao codex ensure-start` is the single startup guard for Codex skills. It records
startup once per thread and skips duplicate startup automatically. Leave
`ao codex ensure-stop` to closeout skills; discovery owns the startup path.

## DAG — Execute This Sequentially

```
mkdir -p .agents/rpi
detect bd and ao CLI availability
```

**Run every step in order. Do not stop between steps.**

```
STEP 1  ──  if not --skip-brainstorm AND goal is vague (<50 chars or vague keywords):
              $brainstorm <goal>
              Use refined goal for subsequent steps if produced.

STEP 1.5 ── if PRODUCT.md exists in repo root
              AND goal appears to be a feature or capability
              (not a bug fix, chore, or docs task — i.e., goal does NOT start with
               "fix", "chore", "docs", "typo", "bump", "update dep", "lint", "format"):
                $design <goal> [--quick]
                FAIL verdict? → output <promise>BLOCKED</promise>, stop (design is a blocking product-alignment gate).
              Skip silently if PRODUCT.md does not exist or goal is non-feature.

STEP 2  ──  if ao available:
              ao search "<goal keywords>" 2>/dev/null || true
              ao lookup --query "<goal keywords>" --limit 5 2>/dev/null || true
              Assemble ranked packet: compiled planning rules + active findings
              + unconsumed high-severity next-work items. Carry forward as context.
              For each returned learning, check applicability to the goal. If applicable,
              cite by filename and record: ao metrics cite "<path>" --type applied 2>/dev/null || true

STEP 3  ──  $research <goal> [--auto]
              Pass --auto unless --interactive. Output lands in .agents/research/.
              After: identify applicable test levels (L0-L3) for downstream $plan.

STEP 4  ──  $plan <goal> [--auto]
              Pass --auto unless --interactive.
              After: extract epic-id, auto-detect complexity from issue count
              (1-2 → fast, 3-6 → standard, 7+ → full) unless --complexity override.

STEP 4.5 ── if --no-scaffold is NOT set (alias: --no-lifecycle, deprecated)
              AND plan output contains new project/module creation
              (keywords: scaffold, new project, bootstrap, init, create module,
               new package, new service):
                detect language from plan context or existing project files
                $scaffold <detected-language> <project-name>
                Scaffold output becomes input context for pre-mortem.
              Skip if: --no-scaffold flag (or deprecated --no-lifecycle), no new project/module detected in plan.

STEP 5  ──  $pre-mortem <plan-path> [--quick]
              Use --quick for fast/standard. Full council for full.
              PASS/WARN? → continue to STEP 6
              FAIL?      → re-plan with findings, re-run pre-mortem (max 3 total)
                           Still FAIL after 3? → output <promise>BLOCKED</promise>, stop

STEP 6  ──  Write execution-packet.json (latest alias) + per-run packet archive
              to .agents/rpi/ and .agents/rpi/runs/<run-id>/ when run_id exists.
              Include plan_path, test_levels, ranked_packet_path, epic-id, complexity.
              ao ratchet record discovery 2>/dev/null || true
              Output <promise>DONE</promise>
```

**That's it.** Steps 1→1.5→2→3→4→4.5→5→6. No stopping between steps.

---

## Setup Detail

**State:**
```
discovery_state = {
  goal: "<goal string>",
  interactive: <true if --interactive>,
  complexity: <fast|standard|full or null for auto-detect>,
  skip_brainstorm: <true if --skip-brainstorm or goal is >50 chars and specific>,
  epic_id: null,
  attempt: 1,
  verdict: null
}
```

**CLI dependency detection:**
```bash
if bd ready --json >/dev/null 2>&1 && bd list --type epic --status open --json >/dev/null 2>&1; then
  TRACKING_MODE="beads"
else
  TRACKING_MODE="tasklist"
fi
if command -v ao &>/dev/null; then AO_AVAILABLE=true; else AO_AVAILABLE=false; fi
```

## Gate Detail

**Discovery has two blocking gates.**

- **STEP 1.5 (design gate):** `FAIL` blocks discovery immediately for feature/capability goals when `PRODUCT.md` exists.
- **STEP 5 (pre-mortem gate):** Max 3 attempts with plan→pre-mortem retry loop.
  - **PASS/WARN:** Store verdict, apply any required pre-mortem hardening back into the plan issues or file-backed task specs, then proceed to STEP 6.
  - **FAIL:** Log `"Pre-mortem: FAIL (attempt N/3) -- retrying plan with feedback"`. Re-invoke `$plan` with findings context, then re-invoke `$pre-mortem`. After 3 total failures: output `<promise>BLOCKED</promise>`, stop.

## Step Detail

**STEP 1 (brainstorm):** Skip if `--skip-brainstorm`, or goal >50 chars with no vague keywords (`improve`, `better`, `something`, `somehow`, `maybe`), or brainstorm artifact already exists in `.agents/brainstorm/`.

**STEP 1.5 (design gate):** Optional. Runs `$design` when PRODUCT.md exists at repo root and the goal is a feature or capability (not a bug fix, chore, or docs task). Design verdict `FAIL` blocks discovery; `PASS` or `WARN` continues. Skipped silently when PRODUCT.md is absent.

**STEP 2 (search history):** Ranked packet assembly — match compiled planning rules, active findings from `.agents/findings/*.md`, and unconsumed high-severity items from `.agents/rpi/next-work.jsonl`. Rank by goal-text overlap → issue-type overlap → file-path overlap.

**STEP 3.1 (test levels):** After research, determine L0-L3 applicability. External APIs/I/O → L0+L1+L2 min. Cross-module → add L2. Full subsystem → add L3. Record in `discovery_state.test_levels`.

**STEP 4 (plan):** After plan, record the exact `plan_path` for STEP 5. If tracker probes are healthy, extract epic-id via `bd list --type epic --status open`. If tracker probes are degraded, keep the objective + `plan_path` in `.agents/rpi/execution-packet.json` and continue in `tasklist` mode without inventing an epic.

**STEP 5 (pre-mortem):** Pass the recorded `plan_path` into `$pre-mortem`. Do not rely on “most recent” plan/spec selection during discovery retries.

**STEP 5.5 (pre-mortem fix propagation):** Before STEP 6, copy any required pseudocode fixes from the pre-mortem report into the affected plan issues or file-backed task specs. Workers read issue/task bodies, not the pre-mortem report.

**STEP 6 (output):** Write execution packet and phase summary per `references/output-templates.md`. Keep `.agents/rpi/execution-packet.json` as the latest alias and archive the same packet to `.agents/rpi/runs/<run-id>/execution-packet.json` when `run_id` exists. Include `plan_path`, `test_levels`, and `ranked_packet_path` in the execution packet for `$crank` and standalone `$validation` consumption.

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--auto` | on | Fully autonomous (no human gates). Inverse of `--interactive`. Passed through to `$research` and `$plan`. |
| `--interactive` | off | Human gates in research and plan (STEP 3, STEP 4). Does NOT affect pre-mortem gate. |
| `--skip-brainstorm` | auto | Skip STEP 1 brainstorm when goal is already specific |
| `--complexity=<level>` | auto | Force complexity level (`fast` / `standard` / `full`) |
| `--no-budget` | off | Disable phase time budgets |
| `--no-scaffold` | off | Skip scaffold auto-invocation in STEP 4.5 (canonical name) |
| `--no-lifecycle` | off | **DEPRECATED ALIAS** for `--no-scaffold`. Honored through v2.40.0. Treated as `--no-scaffold`. |

## Quick Start

```bash
$discovery "add user authentication"              # full discovery
$discovery --interactive "refactor payment module" # human gates in research + plan
$discovery --skip-brainstorm "fix login bug"       # skip brainstorm for specific goals
$discovery --complexity=full "migrate to v2 API"   # force full council ceremony
```

## Completion Markers

```
<promise>DONE</promise>      # Discovery complete, epic-id + execution-packet ready
<promise>BLOCKED</promise>   # Pre-mortem failed 3x, manual intervention needed
```

## Troubleshooting

Read `references/troubleshooting.md` for common problems and solutions.

## Reference Documents

- [references/complexity-auto-detect.md](references/complexity-auto-detect.md) — precedence contract for keyword vs issue-count classification
- [references/idempotency-and-resume.md](references/idempotency-and-resume.md) — re-run safety and resume behavior
- [references/phase-budgets.md](references/phase-budgets.md) — time budgets per complexity level
- [references/troubleshooting.md](references/troubleshooting.md) — common problems and solutions
- [references/output-templates.md](references/output-templates.md) — execution packet and phase summary formats

**See also:** [brainstorm](../brainstorm/SKILL.md), [design](../design/SKILL.md), [research](../research/SKILL.md), [plan](../plan/SKILL.md), [pre-mortem](../pre-mortem/SKILL.md), [crank](../crank/SKILL.md), [rpi](../rpi/SKILL.md)

## Local Resources

### references/

- [references/complexity-auto-detect.md](references/complexity-auto-detect.md)
- [references/idempotency-and-resume.md](references/idempotency-and-resume.md)
- [references/output-templates.md](references/output-templates.md)
- [references/phase-budgets.md](references/phase-budgets.md)
- [references/troubleshooting.md](references/troubleshooting.md)

<!-- Lifecycle integration wired: 2026-03-28. See skills/discovery/SKILL.md for canonical -->
