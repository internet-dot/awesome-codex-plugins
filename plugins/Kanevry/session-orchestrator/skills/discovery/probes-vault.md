> See probes-intro.md for confidence scoring reference.

## Category: `vault`

### Probe: vault-staleness

**Activation:** `.vault.yaml` present in repo root OR Session Config `vault-integration.enabled: true`.

**Detection Method:**

```bash
# Step 1: Verify the probe exists; skip if missing
test -f skills/discovery/probes/vault-staleness.mjs || { echo "SKIPPED: vault-staleness -- skills/discovery/probes/vault-staleness.mjs not found"; exit 0; }

# Step 2: Run the probe. It reads vault-integration.vault-dir from $CONFIG
# (passed from the discovery skill) and scans the vault.
node --input-type=module -e "
import {runProbe} from './skills/discovery/probes/vault-staleness.mjs';
const cfg = JSON.parse(process.env.SO_CONFIG || '{}');
const r = await runProbe(process.cwd(), cfg);
for (const f of r.findings) {
  console.log('FINDING:', JSON.stringify(f));
}
console.log('METRICS:', JSON.stringify(r.metrics));
if (r.skipped_reason) console.log('SKIPPED:', r.skipped_reason);
"
```

**Output:** one `FINDING:` line per finding, one `METRICS:` line per run. Summary JSONL record appended to `.orchestrator/metrics/vault-staleness.jsonl`.

**Default severity:** low (<7d delta), medium (≥7d delta). Missing frontmatter fields → low.

---

### Probe: vault-narrative-staleness

**Activation:** same as vault-staleness.

**Detection Method:**

```bash
test -f skills/discovery/probes/vault-narrative-staleness.mjs || { echo "SKIPPED: vault-narrative-staleness -- probe file not found"; exit 0; }

node --input-type=module -e "
import {runProbe} from './skills/discovery/probes/vault-narrative-staleness.mjs';
const cfg = JSON.parse(process.env.SO_CONFIG || '{}');
const r = await runProbe(process.cwd(), cfg);
for (const f of r.findings) {
  console.log('FINDING:', JSON.stringify(f));
}
console.log('METRICS:', JSON.stringify(r.metrics));
if (r.skipped_reason) console.log('SKIPPED:', r.skipped_reason);
"
```

**Output:** same shape as vault-staleness. JSONL appended to `.orchestrator/metrics/vault-narrative-staleness.jsonl`.

**Default severity:** low (within 2× tier threshold), medium (within 3×), high (beyond 3×). Missing `updated` field → low.

**Tier thresholds (days):** top=30, active=60, archived=180. Tier sourced from `_overview.md` frontmatter; defaults to `active` if missing.

---

**Session-end integration:** When `vault-staleness.enabled: true` in Session Config, these same probes are also invoked at session-end Phase 2.3 — see `skills/session-end/SKILL.md` for the gating logic and strict-mode override behavior. The `/discovery vault` invocation here is the on-demand discovery path; Phase 2.3 is the close-time gate.
