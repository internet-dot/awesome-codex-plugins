---
name: beads
description: 'Track bd issues and dependencies.'
---
# Beads - Persistent Task Memory for AI Agents

Graph-based issue tracker that survives conversation compaction.

## Overview

**bd (beads)** replaces markdown task lists with a dependency-aware graph stored in git.

**Key Distinction**:
- **bd**: Multi-session work, dependencies, survives compaction, git-backed

**Decision Rule**: If resuming in 2 weeks would be hard without bd, use bd.

## Operating Rules

- Treat live `bd` reads as authoritative. Use `bd show`, `bd ready`, `bd list`, and `bd export` to inspect current tracker state. Do not treat `.beads/issues.jsonl` as the primary decision source when live `bd` data is available.
- Treat `.beads/issues.jsonl` as a git-friendly export artifact. If the repo tracks `.beads/issues.jsonl` and you mutate tracker state, refresh it explicitly with `bd export -o .beads/issues.jsonl`.
- After closing or materially updating a child issue, reconcile the open parent in the same session. Update stale "remaining gap" notes immediately, and close the parent when the child resolved the parent's last real gap.
- Before closing a child issue, include scoped closure proof in the `bd close --reason` text.
  Name the touched files or explicit no-file evidence artifact, validation command(s), and parent
  reconciliation outcome. Do not use generic closure reasons such as "done" or "implemented" for child beads.
- If `bd ready` returns a broad umbrella issue, do not implement directly against vague parent wording. First narrow the remaining gap into an execution-ready child issue, then land the child and reconcile the parent.
- Normalize stale queue items instead of silently skipping them. Rewrite broad or partially absorbed beads to the actual remaining gap.
- Use this post-mutation sequence when tracker state changed:

```bash
bd ...                              # mutate tracker state
bd export -o .beads/issues.jsonl    # if tracked in git
bd vc status
bd dolt commit -m "..."             # if tracker changes are pending
bd dolt push                        # only if a Dolt remote is configured
```

## Prerequisites

- **bd CLI**: Version 0.34.0+ installed and in PATH
- **Git Repository**: Current directory must be a git repo
- **Initialization**: `bd init` run once (humans do this, not agents)

## Examples

### Skill Loading from $vibe

**User says:** `$vibe`

**What happens:**
1. Agent loads beads skill automatically via dependency
2. Agent calls `bd show <id>` to read issue metadata
3. Agent links validation findings to the issue being checked
4. Output references issue ID in validation report

**Result:** Validation report includes issue context, no manual bd lookups needed.

### Skill Loading from $implement

**User says:** `$implement ag-xyz-123`

**What happens:**
1. Agent loads beads skill to understand issue structure
2. Agent calls `bd show ag-xyz-123` to read issue body
3. Agent checks dependencies with bd output
4. Agent closes issue with `bd close ag-xyz-123` after completion

**Result:** Issue lifecycle managed automatically during implementation.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| bd command not found | bd CLI not installed or not in PATH | Install bd: `brew install bd` or check PATH |
| "not a git repository" error | bd requires git repo, current dir not initialized | Run `git init` or navigate to git repo root |
| "beads not initialized" error | .beads/ directory missing | Human runs `bd init --prefix <prefix>` once |
| Issue ID format errors | Wrong prefix or malformed ID | Check rigs.json for correct prefix, follow `<prefix>-<tag>-<num>` format |

## Reference Documents

- [references/ANTI_PATTERNS.md](references/ANTI_PATTERNS.md)
- [references/BOUNDARIES.md](references/BOUNDARIES.md)
- [references/CLI_REFERENCE.md](references/CLI_REFERENCE.md)
- [references/DEPENDENCIES.md](references/DEPENDENCIES.md)
- [references/INTEGRATION_PATTERNS.md](references/INTEGRATION_PATTERNS.md)
- [references/ISSUE_CREATION.md](references/ISSUE_CREATION.md)
- [references/MOLECULES.md](references/MOLECULES.md)
- [references/PATTERNS.md](references/PATTERNS.md)
- [references/RESUMABILITY.md](references/RESUMABILITY.md)
- [references/ROUTING.md](references/ROUTING.md)
- [references/STATIC_DATA.md](references/STATIC_DATA.md)
- [references/TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)
- [references/WORKFLOWS.md](references/WORKFLOWS.md)

## Local Resources

### references/

- [references/ANTI_PATTERNS.md](references/ANTI_PATTERNS.md)
- [references/BOUNDARIES.md](references/BOUNDARIES.md)
- [references/CLI_REFERENCE.md](references/CLI_REFERENCE.md)
- [references/DEPENDENCIES.md](references/DEPENDENCIES.md)
- [references/INTEGRATION_PATTERNS.md](references/INTEGRATION_PATTERNS.md)
- [references/ISSUE_CREATION.md](references/ISSUE_CREATION.md)
- [references/MOLECULES.md](references/MOLECULES.md)
- [references/PATTERNS.md](references/PATTERNS.md)
- [references/RESUMABILITY.md](references/RESUMABILITY.md)
- [references/ROUTING.md](references/ROUTING.md)
- [references/STATIC_DATA.md](references/STATIC_DATA.md)
- [references/TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)
- [references/WORKFLOWS.md](references/WORKFLOWS.md)

### scripts/

- `scripts/validate.sh`
