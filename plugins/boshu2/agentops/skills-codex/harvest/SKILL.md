---
name: harvest
description: 'Promote .agents knowledge.'
---
# Harvest — Cross-Rig Knowledge Consolidation

> **Nightly usage (2026-04-09):** `$dream start` now runs harvest as part
> of its bounded compounding loop. Use `$harvest` for manual sweeps, CI
> runs, or when Dream is disabled. Dream holds `.agents/overnight/run.lock`
> while running — manual `ao harvest` will refuse until the lock releases.

Sweep all `.agents/` directories across the workspace, extract learnings, patterns,
and research, deduplicate cross-rig, and promote high-value items to the global
knowledge hub (`~/.agents/learnings/`).

> **Naming gotcha.** `$harvest` promotes into `~/.agents/learnings/`, not
> `~/.agents/`. Users often say "harvest all to `~/.agents`" and mean the
> promotion hub. If you really want every raw artifact (not just the
> promotion set) mirrored verbatim, you want `rsync`, not `$harvest`.

## Which skill do I need?

See [docs/skills-decision-tree.md](../../docs/skills-decision-tree.md) for
the full "which skill next?" decision table covering harvest, compile,
dream, knowledge-activation, and quickstart.

## What This Skill Does

The knowledge flywheel captures learnings per-rig, but they stay siloed. Harvest
closes the loop by walking all rigs, extracting artifacts, deduplicating by content
hash, and promoting high-confidence items to the global hub where every rig can
access them via `ao inject`.

**When to use:** Before an evolve cycle, after a burst of development across
multiple rigs, or weekly as part of knowledge governance.

**Output:** `.agents/harvest/latest.json` (catalog) + promoted files in `~/.agents/learnings/`

## Execution Steps

### Step 1: Preview Scope (Dry Run)

```bash
ao harvest --dry-run --quiet
```

Read `.agents/harvest/latest.json` and report:
- Rigs discovered
- Total artifacts extracted
- Unique vs duplicate count
- Promotion candidates (artifacts >= min confidence)

### Step 2: Confirm Execution

**Skip if `--auto` is set.** Otherwise, show the dry-run summary and ask:

```
Harvest will promote N artifacts from M rigs to ~/.agents/learnings/.
Proceed? [Approve / Adjust threshold / Abort]
```

### Step 3: Execute Harvest

```bash
ao harvest --roots ~/gt/ --promote-to ~/.agents/learnings --min-confidence 0.5
```

### Step 4: Post-Harvest Cleanup

Run dedup on the promotion target to clean up any remaining duplicates:

```bash
ao dedup --merge ~/.agents/learnings/ 2>/dev/null || true
```

### Step 5: Report Results

Report to user:
- Rigs scanned
- Artifacts extracted and unique count
- Duplicates found (with top duplicate groups)
- Artifacts promoted (with provenance)
- Top discoveries (highest-confidence cross-rig patterns)

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--auto` | off | Skip confirmation gate |
| `--roots` | `~/gt/` | Override root directories to scan |
| `--min-confidence` | 0.5 | Minimum confidence for promotion |
| `--include` | `learnings,patterns,research` | Artifact types to extract |

## Quick Start

```bash
$harvest                          # Full sweep with confirmation
$harvest --auto                   # Hands-free sweep
$harvest --min-confidence 0.7     # Only promote high-confidence items
$harvest --roots ~/gt/,~/projects/ # Scan additional directories
```

## Governance

See [references/governance.md](references/governance.md) for ongoing governance model:
size budgets, sweep frequency, staleness thresholds, and cross-rig synthesis triggers.

## See Also

- `$compile` — Single-rig Mine/Grow/Defrag
- `$flywheel` — Flywheel health monitoring
- `$inject` — Knowledge injection into sessions
- `$forge` — Transcript knowledge extraction

## Reference Documents

- [references/governance.md](references/governance.md) — Governance model for ongoing knowledge consolidation
