---
name: council
description: 'Run multi-judge consensus for validation, brainstorming, or research.'
---
# $council — Multi-Model Consensus Council (Codex Native)

Spawn parallel judges with different perspectives via `spawn_agent`, consolidate into consensus.

## Quick Start

```bash
$council --quick validate recent                               # fast inline check
$council validate this plan                                    # validation (2 judges)
$council brainstorm caching approaches                         # brainstorm
$council --deep validate the implementation                    # 3 judges
$council --preset=security-audit validate the auth system      # preset personas
```

## Modes

| Mode | Judges | Method | Use Case |
|------|--------|--------|----------|
| `--quick` | 0 (inline) | Self | Fast single-agent check, no spawning |
| default | 2 | `spawn_agent` | Independent judges |
| `--deep` | 3 | `spawn_agent` | Thorough review |
| `--mixed` | 3+3 | `spawn_agent` + Codex CLI | Cross-vendor consensus |

**Note:** `--debate` (multi-round adversarial) requires agent messaging. Use `spawn_agent` plus `send_input` for one-off follow-up only; do not rely on debate-style rounds.

**Note:** `--mixed` is strict. Pre-flight `codex` and `codex --version` before spawning any judges; if Codex CLI is missing or not runnable, hard-error and tell the operator to install/fix Codex CLI or drop `--mixed`. Never silently convert `--mixed` into runtime-native-only judging.

**Note:** `--profile=<name>` follows the shared model-profile contract: `balanced`, `budget`, `fast`, `inherit`, `quality`, `thorough`. See `references/model-profiles.md`.

| Env var | Default |
|---------|---------|
| `COUNCIL_CLAUDE_MODEL` | sonnet |
| `COUNCIL_EXPLORER_MODEL` | sonnet |
| `COUNCIL_CODEX_MODEL` | unset; use Codex default (`gpt-5.5` recommended when available) |
| `COUNCIL_TIMEOUT` | 120 |
| `COUNCIL_EXPLORER_TIMEOUT` | 60 |
| `COUNCIL_R2_TIMEOUT` | 90 |

| Flag | Description |
|------|-------------|
| `--technique=<name>` | Brainstorm technique (reverse, scamper, six-hats). See `references/brainstorm-techniques.md`. |
| `--profile=<name>` | Model quality profile (balanced, budget, fast, inherit, quality, thorough). See `references/model-profiles.md`. |

## Task Types

| Type | Trigger Words | Focus |
|------|---------------|-------|
| **validate** | validate, check, review, assess, critique | Is this correct? What's wrong? |
| **brainstorm** | brainstorm, explore, options, approaches | Alternatives? Pros/cons? |
| **research** | research, investigate, deep dive, analyze | What can we discover? |

## Execution Flow

### Phase 1: Build Packet

1. Determine task type from user prompt
2. Identify target (files, diffs, plan, code)
3. Read relevant context files
4. Select perspectives (or use preset)

### Phase 1a: Spawn Judges

Use one `spawn_agent` call per judge. Include the same context packet in each prompt and assign a distinct perspective:

```text
spawn_agent(message="You are judge-1.

Perspective: correctness

Task: validate the following target.
Target files: ...
Context: ...

Write your full analysis to .agents/council/judge-1.md and your verdict to the final paragraph.")

spawn_agent(message="You are judge-2.

Perspective: completeness

Task: validate the following target.
Target files: ...
Context: ...

Write your full analysis to .agents/council/judge-2.md and your verdict to the final paragraph.")
```

With `--mixed`, spawn the runtime-native judges above plus 3 Codex CLI judges. Codex CLI judges write under `.agents/council/codex-{N}.json` when `--output-schema` is supported, or `.agents/council/codex-{N}.md` as an output-format fallback only. See `references/cli-spawning.md` for the strict pre-flight and command shape.

### Step 1b: Load Project Reviewer Config

Check for project-level reviewer configuration before spawning judges:

```bash
REVIEWER_CONFIG=".agents/reviewer-config.md"
if [ -f "$REVIEWER_CONFIG" ]; then
    # Parse YAML frontmatter for reviewer list
    # Use reviewers/plan_reviewers/skip_reviewers to select judge perspectives
fi
```

If `reviewer-config.md` exists:
- Use `reviewers` list to select which judge perspectives to spawn
- Use `plan_reviewers` for plan validation specifically
- Use `skip_reviewers` to exclude perspectives even if preset includes them
- Pass markdown body as additional context to all judges

If no config exists, use defaults (current behavior unchanged).

For schema details and an example, see `references/reviewer-config-example.md`.

### Phase 1b: Wait for Judges

```
wait_agent(targets=["agent-id-1", "agent-id-2"])
```

If a judge needs follow-up, use `send_input` on that agent. If a judge stalls, `close_agent` it and proceed with the remaining responses.

### Phase 2: Consolidation (Lead — Inline)

The lead reads each judge's output file and synthesizes:

1. Read each `.agents/council/judge-*.md` file
2. Compute consensus verdict:
   - **PASS:** All judges PASS (or majority PASS, none FAIL)
   - **WARN:** Any judge WARN, none FAIL
   - **FAIL:** Any judge FAIL
   - Core rules: All PASS -> PASS; Any FAIL -> FAIL; Mixed PASS/WARN -> WARN; cross-vendor disagreement -> DISAGREE.
3. Identify shared findings across judges
4. Surface disagreements with attribution
5. Generate final report

### Phase 3: Write Report

Save to `.agents/council/YYYY-MM-DD-<type>-<target>.md`:

```markdown
# Council Report: <type> <target>

**Consensus:** PASS/WARN/FAIL
**Judges:** N responded / N spawned
**Date:** YYYY-MM-DD

## Shared Findings
- Finding 1 (judges 1, 2)
- Finding 2 (judges 1, 3)

## Disagreements
- Judge 1 says X, Judge 2 says Y

## Recommendations
1. ...
2. ...

## Individual Verdicts
| Judge | Perspective | Verdict | Confidence | Findings |
|-------|-------------|---------|------------|----------|
| judge-1 | correctness | PASS | high | 3 |
| judge-2 | completeness | WARN | medium | 5 |
```

## Presets

| Preset | Perspectives |
|--------|-------------|
| default | correctness, completeness |
| security-audit | vulnerability, attack-surface, data-flow |
| architecture | coupling, scalability, maintainability |
| research | breadth, depth, contrarian |
| ops | reliability, observability, failure-modes |

Use: `$council --preset=security-audit validate the auth system`

## Graceful Degradation

| Failure | Behavior |
|---------|----------|
| 1 of N judges timeout | Proceed with N-1, note in report |
| All judges fail | Return error, suggest retry |
| No multi-agent capability | Fall back to `--quick` (inline) |

## Context Budget Rule

Judges write ALL analysis to output files. Results to the lead contain ONLY minimal signals. This prevents N judges from flooding the lead's context.

## Standards Integration

If `$standards` is available and the target includes code files, load applicable language standards and include them in each judge prompt.

## First-Pass Rigor Gate (validate mode)

When validating plans/specs, judges must check:
1. Mutation + ack sequence is explicit and non-contradictory
2. Consume-at-most-once path is crash-safe
3. Status/precedence behavior has field-level truth table
4. Conformance includes boundary failpoint tests

Missing gate item → minimum WARN. Critical unverifiable invariant → FAIL.

## Reference Documents

- [references/model-routing.md](references/model-routing.md)
- [references/agent-prompts.md](references/agent-prompts.md)
- [references/backend-background-tasks.md](references/backend-background-tasks.md)
- [references/backend-codex-subagents.md](references/backend-codex-subagents.md)
- [references/backend-inline.md](references/backend-inline.md)
- [references/brainstorm-techniques.md](references/brainstorm-techniques.md)
- [references/caching-guidance.md](references/caching-guidance.md)
- [references/cli-spawning.md](references/cli-spawning.md)
- [references/debate-protocol.md](references/debate-protocol.md)
- [references/explorers.md](references/explorers.md)
- [references/finding-extraction.md](references/finding-extraction.md)
- [references/model-profiles.md](references/model-profiles.md)
- [references/output-format.md](references/output-format.md)
- [references/personas.md](references/personas.md)
- [references/presets.md](references/presets.md)
- [references/quick-mode.md](references/quick-mode.md)
- [references/ralph-loop-contract.md](references/ralph-loop-contract.md)
- [references/reviewer-config-example.md](references/reviewer-config-example.md)
- [references/strategic-doc-validation.md](references/strategic-doc-validation.md)
