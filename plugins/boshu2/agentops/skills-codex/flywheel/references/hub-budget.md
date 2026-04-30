# Hub Budget & Phase 4 Hardening

> Phase 4 (soc-ytpq) governance primitives for the global learnings hub at `~/.agents/learnings/`. Synthesizes the four Wave 1 PRs that landed: cross-writer dedup contract (4-A), advisory volume gate (4-B), size-budget eviction (4-C), and provenance tagging (4-D). All four are advisory or operator-driven — none block on default settings.

## 1. Hub size budget

**Target:** ≤ 250 MB / ≤ 5,000 files for `~/.agents/learnings/`.

When the hub exceeds budget:

```bash
ao maturity --evict --target-size=250M    # also: 1G, 1024K
```

Implementation:

- `lifecycle.ParseSizeBudget(s string) (int64, error)` — accepts integer suffixes only (`K`, `M`, `G`). Fractional values like `1.5G` are rejected for safety.
- `lifecycle.EvictUntilUnderBudget(candidates, currentSize, targetSize)` — sorts eligible candidates lowest-utility-first and walks the prefix until current size drops below target.

If the eligible pool is too small to meet the target, the run stops short of the budget rather than evicting protected files.

## 2. Eviction eligibility (`IsEvictionEligible`)

A learning is **eligible** for size-budget eviction iff **all** of:

| Predicate | Reason |
|-----------|--------|
| `maturity != "established"` | Canonical content is never evicted |
| `utility < 0.3` | High-utility content survives |
| `confidence < 0.3` | Well-grounded content survives |

The size-budget pass never over-evicts canonical or high-confidence material.

## 3. Promotion volume gate (advisory)

`ao harvest` emits a stderr WARN when a single run promotes more than the threshold:

```text
WARN: <count> promotions exceeded threshold <N> (override: --max-promotions=N or AO_MAX_PROMOTIONS=N)
```

| Setting | Value |
|---------|-------|
| Default threshold | `500` (`harvest.DefaultMaxPromotions`) |
| Flag | `--max-promotions=N` (wins over env) |
| Env | `AO_MAX_PROMOTIONS=N` (fallback) |
| Disable | any non-positive threshold (`--max-promotions=0`) |
| Exit code impact | none — WARN-only |

**Why advisory, not hard:** the post-`soc-ujls` cleanup ran 2,638 promotions in one pass — a legitimate backlog drain. A hard gate would have falsely blocked it. Operators see the warning and decide.

Implementation: `harvest.EmitVolumeGateWarning(catalog, threshold, w)` in `cli/internal/harvest/volume_gate.go`, wired into `runHarvest` after `BuildCatalog` returns.

## 4. Provenance tag (`source_rig:`)

Every file written by `harvest.Promote` AND `pool.(*Pool).Promote` carries a `source_rig:` field in its on-disk YAML frontmatter. The field is always present:

| Writer state | Serialized value |
|--------------|------------------|
| Known rig | `source_rig: global-hub`, `source_rig: agentops-nami`, etc. |
| Empty / unknown | `source_rig: unknown` |

**Forensics one-liner — find what's promoting:**

```bash
grep -h '^source_rig:' ~/.agents/learnings/*.md | sort | uniq -c | sort -rn
```

**Cross-writer dedup:** `pool.Promote` consults a JSONL sidecar at `~/.agents/pool/promoted-index.jsonl` (sha256 → path map; stale entries treated as miss) so it cannot re-promote content that `harvest.Promote` already wrote. Both writers content-dedup against the same hub.

## 5. Re-bloat triage runbook

If the hub starts regrowing after staying flat:

1. **Check `ao harvest` config first.** Verify `SkipGlobalHub` defaults to `true` (the agentops-b3v / soc-ujls fix). A regression here lets `~/.agents/learnings/` re-feed itself on every harvest pass — the original feedback loop.
2. **Identify the offender via `source_rig:`.** Run the grep above. A single rig dominating the histogram is your regressed writer.
3. **Use `--target-size`, never raw `rm`.** `ao maturity --evict --target-size=250M` respects `IsEvictionEligible` and preserves canonical content. Bulk deletion bypasses those guarantees.
