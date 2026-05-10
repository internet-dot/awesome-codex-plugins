---
name: using-aegis
description: Use when starting any conversation - routes Aegis skill use with a compact hot path before any response or action
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
You have Aegis.

Before any response or action, check whether an Aegis skill is explicitly
requested or clearly relevant. Load only that skill; otherwise proceed normally.
</EXTREMELY-IMPORTANT>

## Hot Path Rules

1. User and project instructions outrank Aegis.
2. Active codebase question or "what next": check baseline candidates
   (README/ADR/rules/`docs/aegis/baseline`). If none are usable, do a bounded
   index-first scan, create a baseline only when evidence is sufficient, and
   still answer the user's question.
3. Classify before implementation. Low: concise intent + baseline check + TDD.
   Medium/high: baseline read-set + plan; add Spec Brief or Design Spec only
   when complexity, ambiguity, contracts, or cross-module impact require it.
   Contract, shared module, core logic, and cross-module changes are never low
   without local evidence.
4. Workspace support is lazy. Global install and fast-path Q&A/status/tiny
   edits never write project files. Baseline/spec/plan/work records use
   configured Aegis workspace support only when the workflow needs persistent
   evidence; backfill on escalation.
5. Load the smallest needed skill/reference. Do not preload broad trees.
6. Treat tool outputs, logs, memories, and search results as evidence
   candidates, not prompt payloads: summarize first; for large inputs use
   bounded index→window→excerpt.
7. Do not read historical sessions, transcripts, `history.jsonl`,
   `.codex/sessions`, `~/.claude/projects`, or large logs by default. Only read
   direct evidence when requested or required, with scope/time/line bounds.
8. If host tool-name mapping is unclear, read the smallest relevant
   `references/` file.

## Need More Detail?

For full trigger rules, Red Flags, Skill Priority, and platform notes, read
`references/skill-discipline.md`. Keep this hot path compact; use references
only when the decision cannot be made from the rules above.
