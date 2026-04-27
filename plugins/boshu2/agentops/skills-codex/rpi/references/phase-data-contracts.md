# Phase Data Contracts

How each consolidated phase passes data to the next. Artifacts are filesystem-based; no in-memory coupling between phases.

| Transition | Output | Extraction | Input to Next |
|------------|--------|------------|---------------|
| → Discovery | Goal string + repo execution profile contract | Goal from the `$rpi` invocation; repo policy from `docs/contracts/repo-execution-profile.md` and `repo-execution-profile.schema.json` | `repo_profile` state is loaded before research/planning begins |
| Discovery → Implementation | Epic execution context or file-backed objective + discovery summary + `execution_packet` | `phased-state.json` + `.agents/rpi/phase-1-summary.md` + `.agents/rpi/execution-packet.json` (latest alias) or `.agents/rpi/runs/<run-id>/execution-packet.json` (run archive) | `$crank <epic-id>` when `epic_id` exists; otherwise `$crank .agents/rpi/execution-packet.json` with repo policy, contract surfaces, and validation bundle already normalized |
| Implementation → Validation | Completed/partial crank status + implementation summary + `execution_packet` | `bd children <epic-id>` or file-backed implementation state + `.agents/rpi/phase-2-summary.md` + `.agents/rpi/execution-packet.json` (latest alias) or `.agents/rpi/runs/<run-id>/execution-packet.json` (run archive) | `$validation <epic-id>` when `epic_id` exists; otherwise standalone `$validation` with the same repo execution profile fields and done criteria |
| Validation → Next Cycle (optional) | Vibe/post-mortem verdicts + harvested follow-up work + queue lifecycle fields (`claim_status`, `claimed_by`, `claimed_at`, `consumed`, `failed_at`) | Latest council reports + `.agents/rpi/next-work.jsonl` | Stop, loop (`--loop`), suggest next `$rpi` (`--spawn-next`), or hand work back to `$evolve` |

Execution packet v1 should remain additive. Recommended fields:
- `schema_version`
- `run_id`
- `objective`
- `epic_id` (optional when the tracker cannot mint an epic)
- `plan_path`
- `contract_surfaces`
- `validation_commands`
- `tracker_mode`
- `tracker_health`
- `done_criteria`
- `pre_mortem_verdict`
- `test_levels`
- `ranked_packet_path`

Execution packet retention rule:
- `.agents/rpi/execution-packet.json` is the mutable latest alias for the current objective
- `.agents/rpi/runs/<run-id>/execution-packet.json` is the durable per-run packet archive when `run_id` exists

Queue lifecycle rule:
- post-mortem writes new entries as available: entry aggregate `consumed=false`, `claim_status="available"`
- consumers treat item lifecycle as authoritative inside `items[]`; omitted item `claim_status` means available
- `$evolve` and `$rpi loop` claim an item before starting a cycle: item `claim_status="in_progress"`
- successful `$rpi` + regression gate finalizes that item claim: item `consumed=true`, `claim_status="consumed"`, `consumed_by`, `consumed_at`
- failed or regressed cycles release the claim back to available state and may stamp item `failed_at` for retry ordering
- consumers may rewrite existing queue lines to claim, release, fail, or consume items after initial write
- the entry aggregate flips to `consumed=true` only after every child item is consumed

Canonical schema contract: [`docs/contracts/next-work.schema.md`](../../../docs/contracts/next-work.schema.md) (v1.4)
