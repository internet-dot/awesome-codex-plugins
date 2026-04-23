---
name: quality-gates
user-invocable: false
tags: [reference, quality, typecheck, test, lint]
model-preference: sonnet
model-preference-codex: gpt-5.4-mini
model-preference-cursor: claude-sonnet-4-6
description: >
  Canonical quality check commands for typecheck, test, and lint.
  Defines 4 variants (Baseline, Incremental, Full Gate, Per-File) used by
  session-start, wave-executor, session-end, and session-reviewer.
  Reference skill — not invoked directly.
---

# Quality Gates — Reference Skill

This skill defines the canonical quality check commands. Do NOT invoke this skill directly.
Consuming skills (session-start, wave-executor, session-end, session-reviewer) reference the
variant they need and execute the commands inline.

## Command Resolution (policy-file-first, #183)

Quality-gate commands are resolved in this priority order:

1. **`.orchestrator/policy/quality-gates.json`** — canonical policy file (preferred). Schema: `.orchestrator/policy/quality-gates.schema.json`. Bootstrap writes a package-manager-aware default; hand-edit to customize.
2. **Session Config** `test-command` / `typecheck-command` / `lint-command` in CLAUDE.md (Claude Code / Cursor) or AGENTS.md (Codex CLI) — fallback.
3. **Hardcoded defaults** — last resort: `pnpm test --run`, `tsgo --noEmit`, `pnpm lint`.

Loader: `scripts/lib/quality-gates-policy.mjs` exports `loadQualityGatesPolicy(repoRoot)` and `resolveCommand(policy, key, fallback)`. The Bash-side runner `scripts/run-quality-gate.sh` performs the same resolution inline inside `extract_command()`.

If any resolved command is set to the literal string `skip`, skip that check entirely.

## Session Config Fields (legacy fallback)

Read these from the project's `## Session Config` section when `.orchestrator/policy/quality-gates.json` is absent:

- **`test-command`** — Custom test command.
- **`typecheck-command`** — Custom typecheck command.
- **`lint-command`** — Custom lint command.

If a field is missing, use the hardcoded default.

## Variant 1: Baseline

**Used by:** session-start (Phase 3)
**Purpose:** Quick health check at session start — non-blocking.

Commands:
1. Run `{typecheck-command} 2>&1 | tail -5`
2. Run `{test-command} 2>&1 | tail -5`

Behavior: Report results but do NOT block the session. Capture error counts and store them
as the session baseline for later comparison.

**Script output schema (Baseline):**
```json
{"variant": "baseline", "typecheck": {"status": "pass|fail|skip", "output": "string"}, "test": {"status": "pass|fail|skip", "output": "string"}}
```

## Variant 2: Incremental

**Used by:** wave-executor (after implementation waves)
**Purpose:** Verify implementation waves did not break anything.

Commands:
1. Run `{test-command}` on changed files only (e.g., `pnpm test -- <changed-test-files>`).
2. Run `{typecheck-command}`.

Behavior: Report failures. If issues are found, add fix tasks to the next wave automatically.
Do not block wave progression — let the next wave address regressions.

Metrics output (for consuming skills to capture):
```json
{
  "variant": "incremental",
  "duration_seconds": null,
  "typecheck": "pass|fail|skip",
  "test": "pass|fail|skip",
  "errors": []
}
```

## Variant 3: Full Gate

**Used by:** session-end (Phase 2)
**Purpose:** Final quality gate before commit — MUST pass.

Commands:
1. Run `{typecheck-command}` — must produce 0 errors.
2. Run `{test-command}` — must pass (exit code 0).
3. Run `{lint-command}` — must pass (warnings OK, errors NOT OK).
4. Check changed files for debug artifacts: `console.log`, `debugger`, `TODO: remove`.

Behavior: BLOCKING. Do not commit if any check fails. Fix quick issues (<2 min) inline.
For anything longer, create a `priority:high` issue and proceed without committing the
affected files.

Metrics output (for consuming skills to capture):
```json
{
  "variant": "full-gate",
  "duration_seconds": null,
  "typecheck": {"status": "pass|fail|skip", "error_count": 0},
  "test": {"status": "pass|fail|skip", "total": 0, "passed": 0},
  "lint": {"status": "pass|fail|skip", "warnings": 0},
  "debug_artifacts": []
}
```

## Variant 4: Per-File

**Used by:** session-reviewer agent
**Purpose:** Targeted quality check on specific changed files.

Commands:
1. Run `{test-command}` on specific file paths passed by the reviewer.
2. Run `{typecheck-command}`.

Behavior: Report per-file pass/fail status. The reviewer uses these results to annotate
its review output.

**Script output schema (Per-File):**
```json
{"variant": "per-file", "typecheck": {"status": "pass|fail|skip"}, "test": {"status": "pass|fail|skip"}, "files": ["string"]}
```

## Graceful Degradation

Handle missing tools without failing the session:

- If `{typecheck-command}` fails with "command not found" → skip TypeScript checks, note "No TypeScript configured".
- If `{test-command}` fails with "command not found" → skip tests, note "No test runner configured".
- If `{lint-command}` fails with "command not found" → skip lint, note "No linter configured".
- Non-TypeScript projects should set `typecheck-command: skip` in Session Config.

Always continue with the remaining checks — never abort a variant because one tool is missing.

## How Other Skills Reference This

When a consuming skill needs quality checks, include this directive:

> **Quality Reference:** Run [Baseline|Incremental|Full Gate|Per-File] quality checks
> per the quality-gates skill. Read `test-command`, `typecheck-command`, and `lint-command`
> from Session Config (defaults: `pnpm test --run`, `tsgo --noEmit`, `pnpm lint`).

Replace the bracketed variant name with the specific variant required by that phase.

## Script Alternative

Prefer `scripts/run-quality-gate.sh` for deterministic execution with structured JSON output. The inline command approach is supported but produces unstructured output that downstream consumers cannot reliably parse.

```bash
# Baseline (session-start)
bash "${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-$PLUGIN_ROOT}}/scripts/run-quality-gate.sh" --variant baseline --config "$CONFIG"

# Incremental (wave-executor)
bash "${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-$PLUGIN_ROOT}}/scripts/run-quality-gate.sh" --variant incremental --config "$CONFIG" --files changed-file1.ts,changed-file2.ts

# Full Gate (session-end)
bash "${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-$PLUGIN_ROOT}}/scripts/run-quality-gate.sh" --variant full-gate --config "$CONFIG" --session-start-ref "$SESSION_START_REF"

# Per-File (session-reviewer)
bash "${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-$PLUGIN_ROOT}}/scripts/run-quality-gate.sh" --variant per-file --config "$CONFIG" --files specific-file.ts
```

The script handles graceful degradation (missing tools → skip), structured JSON output matching the schemas above, and proper exit codes (0=pass, 1=error, 2=gate-failed).
