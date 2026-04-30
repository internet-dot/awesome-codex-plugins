---
name: retro
description: 'Capture a session learning.'
---
# Retro Skill

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

Quick-capture a learning to the knowledge flywheel. For comprehensive retrospectives with backlog processing, activation, and retirement, use `$post-mortem`.

## Quick Mode

Given `$retro --quick "insight text"` or `$retro "insight text"`:

1. Generate a slug from the content: first meaningful words, lowercase, hyphens, max 50 chars.
2. Resolve the active bead with `timeout_run 1 bd current 2>/dev/null || echo ""`.
3. Write directly to `.agents/learnings/YYYY-MM-DD-quick-<slug>.md`:

```markdown
---
type: learning
source: retro-quick
source_bead: <active bead id when available>
source_phase: validate
date: YYYY-MM-DD
maturity: provisional
utility: 0.5
---

# Learning: <Short Title>

**Category**: <auto-classify: debugging|architecture|process|testing|security>
**Confidence**: medium

## What We Learned

<user's insight text>

## Source

Quick capture via `$retro --quick`
```

If no bead is active, omit `source_bead` intentionally and still set `source_phase: validate`.

4. Confirm:

```
Learned: <one-line summary>
Saved to: .agents/learnings/YYYY-MM-DD-quick-<slug>.md

For comprehensive knowledge extraction, use `$post-mortem`.
```

**Done.** Return immediately after confirmation.

## Examples

**User says:** `$retro --quick "macOS cp alias prompts on overwrite — use /bin/cp to bypass"`

**What happens:**
1. Agent generates slug: `macos-cp-alias-overwrite`
2. Agent resolves the active bead with `timeout_run 1 bd current 2>/dev/null || echo ""`
3. Agent writes learning to `.agents/learnings/2026-03-03-quick-macos-cp-alias-overwrite.md` with provenance fields like:

```markdown
---
type: learning
source: retro-quick
source_bead: bd-123
source_phase: validate
date: 2026-03-03
maturity: provisional
utility: 0.5
---
```

4. Agent confirms: `Learned: macOS cp alias prompts — use /bin/cp`

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Learning too generic | Surface-level capture | Be specific: "auth tokens expire after 1h" not "learned about auth" |
| Duplicate learnings | Same insight captured twice | Check existing learnings with grep before writing |
| Need full retrospective | Quick capture isn't enough | Use `$post-mortem` for comprehensive extraction + processing |

## Local Resources

### scripts/

- `scripts/validate.sh`
