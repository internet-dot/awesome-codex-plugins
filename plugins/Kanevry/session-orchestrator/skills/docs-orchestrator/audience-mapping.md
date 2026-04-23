# Audience Mapping

Rules for mapping session scope to target audiences, content sources, and documentation ownership.

## Audiences & File Patterns

| Audience | Target files (globs) | Typical update triggers |
|----------|----------------------|-------------------------|
| User | `README.md`, `docs/user/**/*.md`, `docs/getting-started.md`, `examples/**/*.md` | new CLI command, breaking API change, install flow change, new user-facing feature, changed example output |
| Dev | `CLAUDE.md`, `docs/dev/**/*.md`, `docs/adr/**/*.md` | architecture decision, major refactor, new module/subsystem, test coverage change, dependency upgrade, ADR-worthy choice |
| Vault/Ops | `<vault>/01-projects/<slug>/context.md`, `<vault>/01-projects/<slug>/decisions.md`, `<vault>/01-projects/<slug>/people.md` | project status change, ownership transition, stack/infra decision, cross-project dependency, migration, archival event |

## Source Rules

**The canonical four source types.** Only these four are permitted for docs-writer tasks.
Any content not traceable to one of these four sources MUST be marked
`<!-- REVIEW: source needed -->`. The docs-writer NEVER invents content.

Every docs-writer task prompt MUST enumerate which sources apply. Content without a
traceable source gets `<!-- REVIEW: source needed -->` — the agent NEVER invents content.

| Source | Command / Path | Primary audience(s) | Notes |
|--------|---------------|---------------------|-------|
| **diff** | `git diff $SESSION_START_REF..HEAD` | Dev, Vault | Authoritative for what changed and when. Preferred primary source for Dev. |
| **git-log** | `git log $SESSION_START_REF..HEAD --format="%H %s%n%b"` | All | Secondary context; use to reconstruct the "why" when diffs alone are ambiguous. |
| **session-memory** | `~/.claude/projects/<project>/memory/session-*.md`, `.orchestrator/` outputs | Vault, User | Primary for Vault narratives (status updates, decisions made in conversation). Also primary for User tasks designed interactively. |
| **affected-files** | Files in wave-scope `allowedPaths` / coordinator `affected-files` context block | User, Dev | Primary for understanding updated interfaces, config schemas, or module structures. |

**Detailed source descriptions:**

1. **diff** — Direct code changes from `git diff $SESSION_START_REF..HEAD`. Authoritative
   for Dev narratives (what changed and why) and Vault decisions (what was decided, when).
   Preferred primary source for Dev audience tasks.
2. **git-log** — Commit messages and associated PR/MR bodies from
   `git log $SESSION_START_REF..HEAD --format="%H %s%n%b"`. Secondary context for all
   audiences. Use to reconstruct the "why" when code diffs alone are ambiguous.
3. **session-memory** — Session transcript, wave outputs, agent summaries, and test
   results stored in `~/.claude/projects/<project>/memory/session-*.md` and under
   `.orchestrator/` during the current session. Primary source for Vault narratives
   (status updates, decisions made in conversation). Also the source for User audience
   tasks where the feature was designed interactively.
4. **affected-files** — Full content of files listed in the wave-scope's `allowedPaths`
   (or the coordinator's `affected-files` context block). Primary for User and Dev content
   where understanding the updated interface, configuration schema, or module structure is
   required.

**Ban on hallucination:** any section without a traceable source gets
`<!-- REVIEW: source needed -->`. This marker signals to the human reviewer that the
content needs verification before the next release. The docs-writer MUST NOT invent
architecture decisions, CLI flags, or status narratives from general knowledge.

## Non-Overlap with Sibling Skills

docs-orchestrator must never write to paths owned by the following sibling skills. Attempting
to target a forbidden path aborts the task at SKILL.md Phase 3.

| Sibling skill | Owned path pattern | Why docs-orchestrator must not touch |
|---------------|--------------------|---------------------------------------|
| vault-mirror | `<vault>/01-projects/*/_overview.md` | vault-mirror regenerates this file from JSONL metrics on every session-end. A second writer would corrupt the metrics-derived content or introduce human prose that vault-mirror's next run overwrites silently. |
| daily | `<vault>/03-daily/YYYY-MM-DD.md` | daily owns this path exclusively and is idempotent-by-design; a second writer (docs-writer) would corrupt the day's scratch notes and create conflicts on the next daily run. |
| claude-md-drift-check | CLAUDE.md (diagnostic path — read-only quality gate) | drift-check diagnoses CLAUDE.md divergence but does not edit it. docs-orchestrator may remediate CLAUDE.md via the Dev audience path, but they MUST NOT run on CLAUDE.md in parallel within the same session wave to avoid concurrent edit conflicts. |
| vault-sync | Frontmatter validation + wiki-link integrity on all `<vault>/**/*.md` (read-only quality gate) | vault-sync never edits files; it is a validation pass. docs-writer writes first; vault-sync validates after. No path conflict, but vault-sync runs must complete after docs-writer to detect drift introduced by new content. |

**Forbidden targets (hard rules — abort on match):**

- `<vault>/01-projects/*/_overview.md` — owned by vault-mirror.
- `<vault>/03-daily/*` — owned by daily.

These two patterns are enforced in Phase 3 of `SKILL.md` with an abort-on-match
check. If the requested file-pattern target matches either forbidden glob, the Docs task
is cancelled and an error is logged before any write occurs.

## Example Prompt Skeleton for docs-writer

The following is a representative prompt that docs-orchestrator generates for a Dev
audience task. Adjust file-pattern target, trigger, and sources per task.

```
You are docs-writer. Your task is to update developer documentation based on
session output.

## Task
Audience: Dev
File-pattern target: docs/dev/**/*.md, CLAUDE.md
Trigger: New `coordinator-snapshot.mjs` module added; CWD-drift guard introduced
  in wave-executor (issues #196, #219).

## Allowed Sources
Only these four sources are permitted. Do not use general knowledge.

- diff: `git diff $SESSION_START_REF..HEAD` (provided below)
- git-log: `git log $SESSION_START_REF..HEAD --format="%H %s%n%b"` (provided below)
- session-memory: wave summaries and agent outputs from
  ~/.claude/projects/<project>/memory/session-*.md and .orchestrator/ (provided below)
- affected-files: content of modified .mjs and SKILL.md files listed in allowedPaths
  (provided below)

No other sources are permitted. Do not use general knowledge about Node.js APIs,
architectural patterns, or project history that is not present in the sources above.

## Source Citations
For every paragraph you write, add a source attribution inline:
  <!-- source: diff -->
  <!-- source: git-log -->
  <!-- source: session-memory -->
  <!-- source: affected-file:path/to/file -->
  <!-- source: diff, affected-file:src/foo.ts -->  (multi-source)

If a paragraph cannot be traced to any of the four sources:
  <!-- REVIEW: source needed -->

Do not omit markers to make output look cleaner. Human reviewers depend on them.

## Hallucination Ban
Any section you write that cannot be traced to one of the four sources above MUST
include the marker:
  <!-- REVIEW: source needed -->
Do not omit this marker to make the output look cleaner. Human reviewers depend on
it to catch invented content before it ships.

## Forbidden Targets
- <vault>/01-projects/*/_overview.md — owned by vault-mirror. Do not edit.
- <vault>/03-daily/* — owned by daily. Do not edit.

## Output Report
At the end of your run, emit:
  [docs-orchestrator] Docs task complete.
    Files touched: <comma-separated relative paths>
    Audiences served: dev
    REVIEW markers: <count> (files: <paths or "none">)
    Source coverage: diff=used, git-log=used, session-memory=used, affected-files=used

## Sources
[diff output inserted here]
[git-log output inserted here]
[session-memory summary inserted here]
[affected-files content inserted here]
```
