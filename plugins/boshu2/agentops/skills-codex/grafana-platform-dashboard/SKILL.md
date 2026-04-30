---
name: grafana-platform-dashboard
description: 'Validate OpenShift Grafana dashboards.'
---
# Grafana Platform Dashboard

Design platform operations dashboards so operators see tenant-impacting risk first, then drill into service-specific health without overload.

## Quick Start

Use this skill when the user asks for platform dashboard updates and reliability checks.

1. Confirm dashboard target:
```bash
oc --context <ctx> get grafanadashboard -A | rg -i '<dashboard-name-or-theme>'
```
2. Export dashboard and JSON:
```bash
skills/grafana-platform-dashboard/scripts/grafanadashboard_roundtrip.sh export \
  --context <ctx> \
  --namespace <ns> \
  --name <grafanadashboard-name> \
  --out-dir /tmp/<workspace>
```
3. Edit the JSON and validate all PromQL:
```bash
skills/grafana-platform-dashboard/scripts/promql_scan_thanos.sh \
  --context <ctx> \
  --dashboard-json /tmp/<workspace>/<name>.json
```
4. Apply live safely:
```bash
skills/grafana-platform-dashboard/scripts/grafanadashboard_roundtrip.sh apply \
  --context <ctx> \
  --namespace <ns> \
  --name <grafanadashboard-name> \
  --json /tmp/<workspace>/<name>.json
```

## Workflow

### 1) Lock Scope From Platform Contracts

Use the platform contract in [platform-contract.md](references/platform-contract.md) before editing panels.

1. Keep L1 command view constrained to critical pre-tenant-impact signals.
2. Use gate-aligned components first (critical CO gate, nodes, MCP, core API/etcd/ingress).
3. Keep service-specific sections (Crossplane, Keycloak) below L1.

### 2) Enforce Information Architecture

Use [layout-guidelines.md](references/layout-guidelines.md):

1. L1: critical-only, immediate action, minimal panel budget.
2. L2: platform services by dependency domain.
3. L3: deep dives (for example future GPU dashboard), not in L1.

### 3) Build Queries From Known Library

Use [promql-library.md](references/promql-library.md):

1. Start from known-good queries and adapt labels minimally.
2. Prefer counts and action tables over decorative charts.
3. Filter alert noise explicitly (for example ArgoCD/GitOps) when requested.

### 4) Validate Before Apply

Always run the scan script after edits:

```bash
skills/grafana-platform-dashboard/scripts/promql_scan_thanos.sh \
  --context <ctx> \
  --dashboard-json <file.json> \
  --output <scan.tsv>
```

Pass criteria: all queries report `success`, zero bad/parse errors.

### 5) Apply and Verify Sync

Apply only after validation succeeds:

```bash
skills/grafana-platform-dashboard/scripts/grafanadashboard_roundtrip.sh apply ...
oc --context <ctx> -n <ns> get grafanadashboard <name> \
  -o jsonpath='{.status.conditions[?(@.type=="DashboardSynchronized")].status}{"|"}{.status.conditions[?(@.type=="DashboardSynchronized")].reason}{"\n"}'
```

### 6) Close With Operator-Focused Summary

Report:

1. What changed (panel names and intent).
2. Validation result (query count and failures).
3. Sync status and any residual risk.
4. Next step: promote live changes into GitOps-managed source.

## Design Rules

1. Put critical tenant-impact predictors first.
2. Every red panel must imply an action path.
3. Avoid ambiguous panel names (for example replace “platform pods” with concrete namespace scope).
4. Keep L1 low-noise; move detail below or to dedicated dashboards.
5. Keep GPU deep diagnostics in a dedicated GPU dashboard, not mixed into L1.

## References

1. [Platform Contract](references/platform-contract.md)
2. [PromQL Panel Library](references/promql-library.md)
3. [Layout Guidelines](references/layout-guidelines.md)

## Local Resources

### references/

- [references/layout-guidelines.md](references/layout-guidelines.md)
- [references/platform-contract.md](references/platform-contract.md)
- [references/promql-library.md](references/promql-library.md)

### scripts/

- `scripts/grafanadashboard_roundtrip.sh`
- `scripts/promql_scan_thanos.sh`
- `scripts/validate.sh`


