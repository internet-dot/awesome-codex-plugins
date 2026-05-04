# Discovery Output Templates

## Execution Packet

Write the current packet to:

- `.agents/rpi/execution-packet.json` as the latest alias
- `.agents/rpi/runs/<run-id>/execution-packet.json` as the per-run archive when `run_id` exists

```json
{
  "schema_version": 1,
  "run_id": "<run-id or omitted>",
  "objective": "<goal>",
  "epic_id": "<epic-id or null when discovery stays file-backed>",
  "plan_path": ".agents/plans/<plan-file>.md",
  "contract_surfaces": ["docs/contracts/repo-execution-profile.md"],
  "validation_commands": ["<from repo profile or defaults>"],
  "validation_lanes": [
    {
      "name": "<stable lane id>",
      "command": "<validation command>",
      "read_only": true,
      "writes_artifacts": false,
      "isolated_agents_home": true,
      "release_only": false,
      "mutation_escape_hatch": null,
      "cost_class": "standard",
      "auto_select": "default",
      "timeout_seconds": 180
    }
  ],
  "tracker_mode": "<beads|tasklist>",
  "tracker_health": {
    "healthy": true,
    "mode": "<beads|tasklist>",
    "reason": "<probe summary>"
  },
  "done_criteria": ["<from repo profile or defaults>"],
  "complexity": "<fast|standard|full>",
  "pre_mortem_verdict": "<PASS|WARN>",
  "test_levels": {
    "required": ["L0", "L1"],
    "recommended": ["L2"],
    "rationale": "<why these levels apply>"
  },
  "ranked_packet_path": ".agents/rpi/ranked-packet.json",
  "discovery_timestamp": "<ISO-8601>"
}
```

If discovery does not produce an epic, this execution packet becomes the
concrete phase-2 handoff object for `$crank` and the concrete phase-3 context
for standalone `$validation`.

## Phase Summary

Write to `.agents/rpi/phase-1-summary-YYYY-MM-DD-<goal-slug>.md`:

```markdown
# Phase 1 Summary: Discovery

- **Goal:** <goal>
- **Epic:** <epic-id>
- **Issues:** <count>
- **Complexity:** <fast|standard|full>
- **Pre-mortem:** <PASS|WARN> (attempt <N>/3)
- **Brainstorm:** <used|skipped>
- **History search:** <findings count or skipped>
- **Status:** DONE
- **Timestamp:** <ISO-8601>
```

## Ratchet and Telemetry

```bash
ao ratchet record discovery 2>/dev/null || true
bash scripts/checkpoint-commit.sh rpi "phase-1" "discovery complete" 2>/dev/null || true
bash scripts/log-telemetry.sh rpi phase-complete phase=1 phase_name=discovery 2>/dev/null || true
```
