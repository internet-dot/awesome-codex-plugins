---
name: claude-md-drift-check
description: Detects drift between CLAUDE.md / _meta narrative and live repository state. Four checks: absolute-path resolution, 01-projects/ count claims, issue-reference freshness (closed refs in forward-looking sections), session-file existence. Invoked as an opt-in session-end phase; mirrors vault-sync's lean JSON+exit-code contract.
---

# CLAUDE.md Drift-Check Skill

## Status

PHASE 1 IMPLEMENTED (2026-04-19). Session-end opt-in quality gate. Upstream of `/close` commit preparation, downstream of `vault-sync`.

## Why this exists

`CLAUDE.md` is narrative SSOT for a repo's Session Config and project context. It decays quickly when surrounding state changes — paths get renamed, project counts shift, issues close, session files get pruned in digests. The drift-cluster closed by agents/vault#57 (3 items in one sweep) was the 4th incidence of the `issue-description-drift-stale-filecount` learning. Manual curation does not scale; this skill turns drift detection into a repeatable gate.

## Checks

| # | Check | What it scans | How |
|---|-------|---------------|-----|
| 1 | `path-resolver` | Every absolute path `/Users/…` in scope files | `existsSync(path)` |
| 2 | `project-count-sync` | Hardcoded "N registered" / "N projects" claims next to `01-projects/` | compare to `ls -d 01-projects/*/` |
| 3 | `issue-reference-freshness` | `#NN` in forward-looking sections (What's Next, Backlog, Open Issues, Offene Themen, Todo, Next Steps) | `glab issue view NN --repo <origin>` |
| 4 | `session-file-existence` | `50-sessions/YYYY-MM-DD-*.md` references anywhere in scope | `existsSync(vault/50-sessions/<file>)` |

Check 3 deliberately scopes to forward-looking sections. Mentions inside "Recently Closed", "Decisions", "Archive", etc. describe history and must not be flagged.

## Files

- `checker.mjs` — pure Node ESM, no runtime deps. Reads scope files, runs enabled checks, emits JSON on stdout.
- `checker.sh` — POSIX shim. Resolves `VAULT_DIR`, execs Node. No `pnpm install` needed (zero deps).
- `package.json` — declares Node engine; no dependencies.
- `tests/` — vitest suite added in Quality wave.

## Invocation

```bash
VAULT_DIR=/path/to/vault bash checker.sh --mode warn
```

CLI flags (all optional):

| Flag | Default | Effect |
|------|---------|--------|
| `--mode <hard\|warn\|off>` | `warn` | `hard` → exit 1 on errors; `warn` → exit 0, errors in JSON; `off` → short-circuit to `status: skipped-mode-off` |
| `--repo <owner/name>` | derived from `git remote get-url origin` | Override for Check 3's `glab issue view --repo` |
| `--include-path <glob>` | `CLAUDE.md`, `_meta/**/*.md` | Repeatable. Scope files, relative to `VAULT_DIR` |
| `--skip-path-resolver` | off | Disable Check 1 |
| `--skip-project-count` | off | Disable Check 2 |
| `--skip-issue-refs` | off | Disable Check 3 (also auto-skipped if `glab` not on PATH) |
| `--skip-session-files` | off | Disable Check 4 |

Environment:

- `VAULT_DIR` — project root to scan. Defaults to `$PWD`. Can also be passed as positional arg 1.

## JSON output

```json
{
  "status": "ok|invalid|skipped|skipped-mode-off",
  "mode": "hard|warn|off",
  "vault_dir": "<absolute path>",
  "files_scanned": N,
  "checks_run": ["path-resolver", "project-count-sync", "issue-reference-freshness", "session-file-existence"],
  "checks_skipped": ["<name>: <reason>"],
  "errors": [
    { "check": "<name>", "file": "<relative path>", "line": N, "message": "<human>", "extracted": "<raw text>" }
  ],
  "warnings": [
    { "check": "<name>", "file": "<relative path>", "line": N, "message": "<human>", "extracted": "<raw text>" }
  ]
}
```

Exit codes:

- `0` — no errors, or errors present but `mode=warn`, or short-circuit (mode=off / no scope files)
- `1` — errors present and `mode=hard`
- `2` — invocation or infra error (missing `VAULT_DIR`, unreadable file, malformed glob)

## Session Config block (opt-in)

In repo-level `CLAUDE.md` under `## Session Config`:

```yaml
drift-check:
  enabled: true
  mode: warn          # hard | warn | off
  include-paths:
    - CLAUDE.md
    - _meta/**/*.md
  check-path-resolver: true
  check-project-count-sync: true
  check-issue-reference-freshness: true
  check-session-file-existence: true
```

When `drift-check.enabled` is `false` or the block is absent, the session-end phase is a no-op.

## Invocation points

### Session-End Phase 2.2 — opt-in quality gate

- Trigger: after Phase 2.1 `vault-sync`, before commit prep
- Behavior: full scan of the configured `include-paths`
- Error handling: `mode=hard` blocks close; `mode=warn` surfaces in quality-gate report; `mode=off` skipped silently
- Rationale: drift is narrative-level; vault-sync catches frontmatter-level. The two gates are complementary.

### Future: wave-executor (not implemented)

A lightweight variant could run after Impl-Polish when `CLAUDE.md` is edited mid-session. Out of scope for Phase 1.

## Design notes

- **No zod.** Output is emission-only, input is plain text. Pure stdlib keeps dep footprint zero.
- **No frontmatter parsing.** Scope files are scanned as Markdown prose; `vault-sync` owns frontmatter validation.
- **Code-fence aware.** Path extraction skips triple-backtick blocks to avoid flagging example paths. Issue-ref extraction does NOT skip fences (configs and snippets often cite real live issues).
- **Section-aware Check 3.** A `#NN` mention in "Recently Closed" is context; the same mention in "What's Next" is drift. The checker tracks the current `##` heading to decide.
- **`glab` optional.** If `glab` is missing or not authenticated, Check 3 degrades to `checks_skipped` with a clear reason — never blocks.

## Relationship to vault-sync

| Aspect | vault-sync | drift-check |
|--------|-----------|-------------|
| Target | Frontmatter + wiki-links in vault/*.md | Narrative drift in CLAUDE.md / _meta/*.md |
| Schema source | Vendored Zod from baseline | None — regex + filesystem checks |
| Deps | `zod`, `yaml` | None (stdlib only) |
| Session-end phase | 2.1 | 2.2 |
| Default mode | `warn` | `warn` |

They are siblings, not overlapping. vault-sync is the structural gate; drift-check is the narrative gate.
