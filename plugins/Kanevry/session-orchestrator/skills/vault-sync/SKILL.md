---
name: vault-sync
description: Validates vault frontmatter (Zod schema) and wiki-link integrity. Phase 1: hard gate at session-end. Used by session-end skill to block close on invalid vault state.
---

# Vault Sync Skill

## Status

STATUS: PHASE 1 IMPLEMENTED (2026-04-13). Session-End hard gate (section 3.1) operational. Phase 2 (wave-executor incremental, 3.2) and Phase 3 (evolve advisory, 3.3) not yet implemented.

## Implementation

Phase 1 ships a self-contained validator that reads every `.md` file under `VAULT_DIR`, parses YAML frontmatter, validates against the canonical `vaultFrontmatterSchema`, and flags dangling wiki-links as warnings.

### Files

- `validator.mjs` — Node.js ESM validator. Uses `zod` + `yaml` npm packages. Reads `VAULT_DIR` (env or default cwd), walks the tree, skipping `node_modules/`, `.git/`, `.obsidian/`, `90-archive/`. For each `.md`: parses frontmatter, validates against the inline Zod schema, extracts `[[wiki-links]]`, verifies each target resolves. Emits JSON report on stdout.
- `validator.sh` — Thin POSIX wrapper. Resolves `VAULT_DIR` from arg 1 or env, self-bootstraps deps via `pnpm install --silent` on first run, execs the Node validator. Session-end and other callers use this entry point.
- `package.json` — Declares `zod` (`^3.24.0`, matching projects-baseline) and `yaml` (`^2.5.0`) as deps. `pnpm-lock.yaml` is committed; `node_modules/` is gitignored.
- `tests/validator.bats` — 16 BATS cases covering clean vaults, broken frontmatter, missing required fields, dangling links, no-vault skipping, README-style files, nested directories, and archive/obsidian exclusion.
- `tests/fixtures/` — Seven fixture vaults matching each test scenario.

### Schema source

The inline Zod schema is vendored from the canonical source at `projects-baseline/packages/zod-schemas/src/vault-frontmatter.ts`. The skill is intentionally self-contained (no monorepo workspace dependency), so the schema is duplicated with a header comment pointing at the SSOT. Drift is to be caught by a future smoke test that imports the canonical schema and diffs the shape — NOT YET IMPLEMENTED. Until that test exists, any change to the canonical schema must be mirrored here in the same commit.

### How session-end invokes it

```
VAULT_DIR=/path/to/vault bash ~/Projects/session-orchestrator/skills/vault-sync/validator.sh
```

- Exit `0` — vault valid (or skipped because no vault exists / no .md files). Warnings may still be present in the JSON report.
- Exit `1` — one or more validation errors. Session-end surfaces them in the quality gate report and refuses to close.
- Exit `2` — infrastructure error (missing `node`, missing `validator.mjs`, cannot bootstrap deps).

JSON output shape (stdout):

```json
{
  "status": "ok|invalid|skipped",
  "vault_dir": "...",
  "files_checked": N,
  "files_skipped_no_frontmatter": N,
  "errors": [{"file": "...", "path": "frontmatter.id", "message": "..."}],
  "warnings": [{"file": "...", "type": "dangling-wiki-link", "message": "..."}]
}
```

Opt-in `--check-expires` flag downgrades expired notes to warnings; default off (Phase 1 leaves freshness for the Phase 3 evolve advisory).

### CLI Flags

The validator (both `validator.mjs` and the `validator.sh` wrapper) accepts:

- `--mode <hard|warn|off>` — gate severity. `hard` (default) exits 1 on any frontmatter/schema error. `warn` exits 0 but still populates the `errors` array in the JSON output so callers can surface them as warnings. `off` short-circuits to `status: "skipped-mode-off"` — useful during onboarding when the gate is enabled but the vault is not yet clean.
- `--exclude <glob>` — repeatable. Glob patterns (relative to `VAULT_DIR`, POSIX-style forward slashes) matching files to skip. Supports `**` (any number of segments), `*` (any chars except `/`), and `?` (single char except `/`). Excluded files are counted in `excluded_count` and contribute nothing to `errors`/`warnings`. Example: `--exclude "**/_MOC.md" --exclude "**/README.md"`.
- `--check-expires` — flag expired notes (`expires:` date in the past) as warnings. Default off.

Environment variables:

- `VAULT_DIR` — directory to scan. Defaults to `$PWD`. Can also be passed as the first positional argument to `validator.sh`.

Example invocation:

```bash
VAULT_DIR=~/Projects/vault bash validator.sh \
  --mode warn \
  --exclude "**/_MOC.md" \
  --exclude "**/_overview.md" \
  --exclude "**/README.md"
```

The JSON output always includes the `mode` and `excluded_count` fields when the validator runs past the mode-off / no-vault short-circuits.

## Purpose

A "project vault" is a markdown-based knowledge base living under `vault/` at the project root. Each file carries strict YAML frontmatter (id, title, tags, status, created, expires, sources) and uses wiki-style links to cross-reference peer notes. The vault is consumed by two audiences: humans browsing the knowledge base, and Sophie-style RAG agents that embed and retrieve notes during chat. Because both audiences depend on the same content, drift is expensive: a stale `status: verified` note with a dead source URL quietly poisons retrieval results, and a broken wiki-link breaks both navigation and graph traversal.

Automated validation is therefore mandatory, not optional. The vault needs four kinds of checks: frontmatter schema conformance, wiki-link integrity, source whitelist enforcement (especially for regulated content like `austrian-law` that must cite only approved government URLs), and freshness (`expires` date in the past). Session-orchestrator is the right home for the in-session layer because every project with a vault will eventually want this, and session lifecycle hooks (wave boundaries, session end, evolve) are exactly the points where drift becomes visible.

The reference architecture is 3 layers:

- **Layer A: local git hooks** (pre-commit, pre-push) -- IMPLEMENTED in reference project. Fast, fail-early, blocks bad commits.
- **Layer B: session-orchestrator:vault-sync skill** (THIS SPEC) -- PENDING. Continuous freshness inside normal session flow.
- **Layer C: remote CI job** -- IMPLEMENTED in reference project's `.gitlab-ci.yml`. Final gate, catches anything the other two miss.

Layer B is the continuous freshness layer. Its job is to run inside normal session flow without requiring developers to remember to validate. If Layers A and C are the bookends, Layer B is the spine.

## Invocation Points

### 3.1 Session-End Hard Gate

- **Trigger**: called by `session-orchestrator:session-end` skill as part of Phase 1 (quality gates), alongside typecheck / lint / test.
- **Behavior**: full validation run over the entire vault. No incremental mode here -- a clean session close must prove the whole vault is valid.
- **Error handling**: validation errors block the session close. The session-end skill surfaces them in the quality gate report and refuses to commit until they are fixed.
- **Rationale**: a clean session must leave the vault in a valid state. This is the one place where the hard gate is non-negotiable.
- **Timeout budget**: ~30s for typical vaults (<500 files). Projects with larger vaults should override via `full-validation-threshold` (see Inputs).

### 3.2 Wave-Executor Incremental Check

- **Trigger**: called by `session-orchestrator:wave-executor` after any wave whose agents modified files under `vault/**` (detected via `git diff --name-only`).
- **Behavior**: incremental validation scoped to the files changed in that wave (diff against `$WAVE_START_REF..HEAD`). Frontmatter and wiki-link resolution run on the touched files only; the source whitelist check runs on touched files only.
- **Error handling**: findings are reported inline in the wave progress output. Warnings do not block. Errors trigger a fix task for the next wave rather than aborting the current one -- the vault is a living document and incremental corrections are normal.
- **Rationale**: catch drift within a single session, not only at session end. A wave that introduces a broken wiki-link should surface it in the next wave's plan, not at the finish line.

### 3.3 Evolve Advisory Scan

- **Trigger**: called by `session-orchestrator:evolve` as part of learning extraction.
- **Behavior**: read-only freshness audit. Flags notes with `status: verified` whose `expires` date has passed, and optionally (opt-in via config) probes source URLs for 404s.
- **Error handling**: output is an advisory section in the evolve report. Never blocks.
- **Rationale**: learning extraction is the moment when patterns surface. Staleness is a pattern. Surfacing it here turns vault maintenance into a natural byproduct of the evolve cycle.

## Inputs

### Phase 1 (implemented)

- **Environment variable**:
  - `VAULT_DIR` — directory to scan for `.md` files. Defaults to `$PWD`. Can also be passed as the first positional argument to `validator.sh`.
- **Session Config** — optional `vault-sync` section in `CLAUDE.md`:
  - `vault-sync.enabled: true|false` (default: `false`; when `false`, the gate is skipped silently)
  - `vault-sync.mode: hard|warn|off` (default: `warn` via Session Config; `hard` blocks session close on errors, `warn` reports but does not block, `off` short-circuits to `status: skipped-mode-off`. Note: `validator.sh` invoked directly without `--mode` defaults to `hard` — the `warn` default applies only when dispatched by session-end.)
  - `vault-sync.vault-dir: <path>` (default: project root `$PWD`; passed to the validator via `VAULT_DIR`)
  - `vault-sync.exclude: [<glob>, ...]` (default: `[]`; repeatable glob patterns — files matching any pattern are counted in `excluded_count` but not validated)

### Future Phases (not yet implemented)

The following fields are planned for Phase 2/3 but are not consumed by the current validator:

- `full-validation-threshold: N` — files above this count trigger incremental mode instead of full scan (Phase 2, wave-executor)
- `network-source-check: true|false` — opt-in URL probe for source whitelist enforcement (Phase 3, evolve advisory)
- **Runtime context**: current git HEAD, session-start ref (for incremental diff in wave-executor, Phase 2)

## Outputs

- **Return value**: JSON object emitted to stdout with the shape:
  ```json
  {
    "status": "ok|invalid|skipped|skipped-mode-off",
    "mode": "hard|warn|off",
    "vault_dir": "<absolute path>",
    "files_checked": N,
    "excluded_count": N,
    "files_skipped_no_frontmatter": N,
    "errors": [{ "file": "<relative path>", "path": "<frontmatter field path>", "message": "<description>" }],
    "warnings": [{ "file": "<relative path>", "type": "dangling-wiki-link|expired", "message": "<description>" }]
  }
  ```
  When the validator short-circuits early (no vault directory, no `.md` files, or `mode: off`), the `files_checked`, `excluded_count`, and `files_skipped_no_frontmatter` fields may be omitted or zero. In `warn` mode, `errors` is still populated but `status` is `"ok"` so callers can surface findings without blocking.
- **Exit codes**:
  - `0` -- vault is valid (or scan was skipped for a legitimate reason)
  - `1` -- validation errors (one or more files failed a rule)
  - `2` -- infrastructure error (validator command not found, `VAULT_ROOT` missing when `enabled: true`, validator crashed)
- **Surface points**:
  - Layer B (wave-executor): inline in the wave progress output, next to typecheck / lint results
  - Layer A (session-end): in the quality gate report, same format as other gates
  - Layer C (evolve): in the evolve report under "Vault Advisory"

## Error Handling Matrix

| Error Type                                                              | Severity     | Action                                                        |
| ----------------------------------------------------------------------- | ------------ | ------------------------------------------------------------- |
| Frontmatter schema violation (missing required field)                   | ERROR        | Block (hard gate) / add fix task (wave-executor)              |
| Wiki-link resolution failure                                            | ERROR        | Block (hard gate) / add fix task (wave-executor)              |
| Source whitelist violation (austrian-law without approved URL)          | ERROR        | Block (hard gate) / add fix task (wave-executor)              |
| Stale note (`expires` date in past)                                     | WARNING      | Advisory only -- never blocks                                 |
| Validator command not found (`pnpm vault:validate` missing)             | INFRA ERROR  | Skip with clear warning; do NOT fail the session              |
| Vault directory does not exist                                          | INFO         | Skip silently (project may not use vault)                     |

## Open Design Questions

1. Should incremental mode include wiki-link validation across the FULL vault, or only the files touched in this wave? Cross-reference bugs can hide in untouched files (note X suddenly has no backlinks because note Y was renamed), which argues for full scan. Performance argues for incremental. Probably hybrid: incremental for schema + touched-file links, full for the backlink graph.
2. Should the skill auto-fix trivial issues (missing `created:` date, tag case normalization, trailing whitespace) or always error out and leave fixes to humans? Auto-fix is convenient but risky inside an AI-driven session because it writes to files that agents are simultaneously editing.
3. How does this skill integrate with a future pgvector embeddings pipeline (a later roadmap phase)? Should it trigger re-embedding of changed notes, or stay strictly validation-only and leave embedding to a separate skill?
4. Should validation failures in wave-executor block the NEXT wave from starting, or only be reported as a fix task? Blocking is safer but reduces parallelism; reporting is faster but risks compounding errors across waves.
5. What is the contract for projects that have no vault at all? Skip silently (current default) or require an explicit `vault-sync.enabled: false` opt-out in Session Config? Silent skip is user-friendly but masks misconfiguration.
6. How do we handle multi-repo vaults -- e.g. a monorepo where each package has its own `vault/`, or a project that references a sibling repo's vault via a git submodule? Is there a single `VAULT_ROOT` or a list?
7. Should the skill learn from previous findings (cache last-known-clean state, skip files whose mtime has not changed) or always run fresh? Caching is a significant perf win on big vaults but introduces its own correctness risks.
8. How are secrets in vault files handled? If a note contains an accidentally-committed token in its `sources` field, should the skill block on it (SEC-type check) or is that strictly the job of the existing secret-scan pre-commit hook?

## References

- `<project>/scripts/vault/validate.ts` -- reference implementation of the validator (Layer A/C entry point)
- `<project>/scripts/vault/schema.ts` -- frontmatter schema (Zod)
- `<project>/.husky/pre-commit` STEP 3.1 -- Layer A local gate example
- `<project>/.gitlab-ci.yml` `vault:validate` job -- Layer C remote gate example
- `<project>/vault/_meta/frontmatter-schema.md` -- human-readable schema doc

## Implementation Roadmap

- **Phase 1 -- Minimal hard gate**: session-end integration only. Full validation, no incremental, no caching. Must ship as a single wave. Reads `VAULT_VALIDATOR_CMD`, executes it, parses exit code + JSON output, surfaces errors in the quality gate report. *Acceptance*: a session with a broken vault file refuses to close; a session with a clean vault closes with a "vault: valid (N files)" line in the report.
- **Phase 2 -- Incremental wave-executor integration**: add incremental diff-based scan. Wire into the wave-executor post-wave hook so it runs only when `vault/**` was touched. Wave progress reports findings inline. Introduce `full-validation-threshold` config. *Acceptance*: a wave that edits one vault file triggers a scan of exactly that file (plus its backlink graph); findings appear in the wave summary; errors generate a fix task for the next wave.
- **Phase 3 -- Advisory evolve integration + staleness**: add evolve hook, `expires` date check, optional network source check (gated behind `network-source-check: true`). Output goes to the evolve report as a non-blocking advisory. *Acceptance*: an evolve run over a vault with 3 expired notes produces an advisory listing all 3, with no impact on session success or exit code.
