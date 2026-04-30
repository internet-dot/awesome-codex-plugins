---
name: security-suite
description: 'Run composable security analysis.'
---
# Security Suite

> **Purpose:** Provide composable, repeatable security/internal-testing primitives for authorized binaries and repo-managed prompt surfaces.

This skill separates concerns into primitives so security workflows stay testable and reusable.

## Guardrails

- Use only on binaries you own or are explicitly authorized to assess.
- Do not use this workflow to bypass legal restrictions or extract third-party proprietary content without authorization.
- Prefer behavioral assurance and policy gating over ad-hoc one-off reverse-engineering.

## Primitive Model

1. `collect-static` — file metadata, runtime heuristics, linked libraries, embedded archive signatures.
2. `collect-dynamic` — sandboxed execution trace (processes, file changes, network endpoints).
3. `collect-contract` — machine-readable behavior contract from help-surface probing.
4. `compare-baseline` — current vs baseline contract drift (added/removed commands, runtime change).
5. `enforce-policy` — allowlist/denylist gates and severity-based verdict.
6. `collect-redteam` — offline repo-surface attack-pack scan for prompt-injection, tool-misuse, secret-exfiltration, and unsafe-shell regressions.
7. `run` — thin binary orchestrator that composes primitives and writes suite summary.

## Quick Start

Single run (default dynamic command is `--help`):

```bash
python3 skills/security-suite/scripts/security_suite.py run \
  --binary "$(command -v ao)" \
  --out-dir .tmp/security-suite/ao-current
```

Baseline regression gate:

```bash
python3 skills/security-suite/scripts/security_suite.py run \
  --binary "$(command -v ao)" \
  --out-dir .tmp/security-suite/ao-current \
  --baseline-dir .tmp/security-suite/ao-baseline \
  --fail-on-removed
```

Policy gate:

```bash
python3 skills/security-suite/scripts/security_suite.py run \
  --binary "$(command -v ao)" \
  --out-dir .tmp/security-suite/ao-current \
  --policy-file skills/security-suite/references/policy-example.json \
  --fail-on-policy-fail
```

Repo-surface redteam:

```bash
python3 skills/security-suite/scripts/prompt_redteam.py scan \
  --repo-root . \
  --pack-file skills/security-suite/references/agentops-redteam-pack.json \
  --out-dir .tmp/security-suite-redteam
```

## Recommended Workflow

1. Capture baseline on known-good release.
2. Run suite on candidate binary in CI.
3. Compare against baseline and enforce policy.
4. Block promotion on failing verdict.

## Output Contract

All outputs are written under `--out-dir`:

- `static/static-analysis.json`
- `dynamic/dynamic-analysis.json`
- `contract/contract.json`
- `compare/baseline-diff.json` (when baseline supplied)
- `policy/policy-verdict.json` (when policy supplied)
- `suite-summary.json`
- `redteam/redteam-results.json` (when repo-surface redteam is run)

This output structure is intentionally machine-consumable for CI gates.

## Policy Model

Use `skills/security-suite/references/policy-example.json` as a starting point.

Supported checks:

- `required_top_level_commands`
- `deny_command_patterns`
- `max_created_files`
- `forbid_file_path_patterns`
- `allow_network_endpoint_patterns`
- `deny_network_endpoint_patterns`
- `block_if_removed_commands`
- `min_command_count`

## Redteam Pack Model

Use [agentops-redteam-pack.json](references/agentops-redteam-pack.json) as the
starting point for offline repo-surface redteam checks.

Supported target fields:

- `globs`
- `require_groups`
- `forbidden_any`
- `applies_if_any`

Each case expresses a concrete adversarial prompt or operator-bypass attempt and
binds it to one or more repo-owned files. The first shipped pack covers
instruction precedence, context overexposure, destructive git misuse, security
gate bypass, and unsafe shell or secret-handling regressions.

## Technique Coverage

This suite is designed for broad binary classes, not just CLI metadata:

- static runtime/library fingerprinting
- sandboxed behavior observation
- command/contract capture
- drift classification
- policy enforcement and CI verdicting
- repo-surface redteam checks for prompt and operator-contract regressions

It is intentionally modular so you can add deeper primitives later (syscall tracing, SBOM attestation verification, fuzz harnesses) without rewriting the workflow.

## Validation

Run:

```bash
bash skills/security-suite/scripts/validate.sh
bash tests/scripts/test-security-suite-redteam.sh
```

Smoke test (recommended):

```bash
python3 skills/security-suite/scripts/security_suite.py run \
  --binary "$(command -v ao)" \
  --out-dir .tmp/security-suite-smoke \
  --policy-file skills/security-suite/references/policy-example.json
```

Repo-surface smoke test:

```bash
python3 skills/security-suite/scripts/prompt_redteam.py scan \
  --repo-root . \
  --pack-file skills/security-suite/references/agentops-redteam-pack.json \
  --out-dir .tmp/security-suite-redteam-smoke
```

## Examples

### Scenario: Capture a Baseline and Gate a New Release

**User says:** `$security-suite run --binary $(command -v ao) --out-dir .tmp/security-suite/ao-v2.4`

**What happens:**
1. The suite runs static analysis (file metadata, linked libraries, embedded archive signatures), dynamic tracing (sandboxed `--help` execution observing processes, file changes, network endpoints), and contract capture against the `ao` binary.
2. It writes `static/static-analysis.json`, `dynamic/dynamic-analysis.json`, `contract/contract.json`, and `suite-summary.json` under the output directory.

**Result:** A complete baseline snapshot is captured for `ao` v2.4, ready to be used as `--baseline-dir` for future release comparisons.

### Scenario: CI Regression Gate With Baseline and Policy

**User says:** `$security-suite run --binary ./bin/ao-candidate --out-dir .tmp/ao-candidate --baseline-dir .tmp/security-suite/ao-v2.4 --policy-file skills/security-suite/references/policy-example.json --fail-on-removed --fail-on-policy-fail`

**What happens:**
1. The suite runs all three collection primitives on the candidate binary, then compares the resulting contract against the v2.4 baseline to produce `compare/baseline-diff.json` with any added, removed, or changed commands.
2. It evaluates the policy file checks (required commands, denied patterns, network allowlists, file limits) and writes `policy/policy-verdict.json` with a pass/fail verdict.

**Result:** The suite exits non-zero if any commands were removed or a policy check failed, blocking the candidate from promotion in the CI pipeline.

### Scenario: Offline Redteam the Repo's Prompt and Skill Surfaces

**User says:** `$security-suite collect-redteam --repo-root .`

**What happens:**
1. The redteam scanner loads the attack pack from [`agentops-redteam-pack.json`](references/agentops-redteam-pack.json) and evaluates repo-owned control surfaces against concrete attack cases.
2. It writes `redteam/redteam-results.json` and `redteam/redteam-results.md` under the chosen output directory, then exits non-zero if a fail-severity case is not resisted.

**Result:** The repo gets a deterministic redteam verdict for prompt-injection, tool misuse, context overexposure, secret-handling, and unsafe-shell regressions without needing hosted model scanning.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Suite exits non-zero with no clear finding | `--fail-on-removed` or `--fail-on-policy-fail` triggered on a legitimate change | Review `compare/baseline-diff.json` and `policy/policy-verdict.json` to identify the specific delta, then update the baseline or policy file accordingly. |
| `dynamic/dynamic-analysis.json` is empty or minimal | Binary requires arguments beyond `--help`, or sandbox blocked execution | Supply a custom dynamic command if supported, or verify the binary runs in the sandboxed environment (check permissions, missing shared libraries). |
| `contract/contract.json` shows zero commands | The binary does not expose a `--help` surface or uses a non-standard help flag | Verify the binary supports `--help`; for binaries with unusual help interfaces, run `collect-contract` separately with the correct invocation. |
| Policy verdict fails on `deny_command_patterns` | A new subcommand matches a deny regex in the policy file | Either rename the subcommand or update `deny_command_patterns` in your policy JSON to exclude the legitimate pattern. |
| `baseline-diff.json` not generated | `--baseline-dir` was not provided or points to a missing directory | Ensure the baseline directory exists and contains a valid `contract/contract.json` from a prior run. |
| Redteam scan fails after a wording cleanup | The attack pack no longer matches the intended guardrail language in target files | Review `redteam/redteam-results.json`, confirm whether the control regressed or the regex is too brittle, then update the target file or the pack intentionally. |

## Local Resources

### references/

- [references/owasp-checklist.md](references/owasp-checklist.md)
- [references/agentops-redteam-pack.json](references/agentops-redteam-pack.json)
- [references/policy-example.json](references/policy-example.json)

### scripts/

- `scripts/prompt_redteam.py`
- `scripts/security_suite.py`
- `scripts/validate.sh`


