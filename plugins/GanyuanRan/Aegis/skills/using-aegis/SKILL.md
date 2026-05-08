---
name: using-aegis
description: Use when starting any conversation - establishes compact Aegis skill-use discipline before any response, clarification, or action
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
You have Aegis.

Before any response or action, check whether a skill is relevant or explicitly
requested. If yes, load and follow that skill. If no skill applies, proceed
normally.
</EXTREMELY-IMPORTANT>

## Hot Path Rules

1. User instructions are highest priority. Aegis skills guide how to work, but
   never override explicit user or project instructions.
2. classify task complexity before implementation. Low-complexity may enter TDD
   after concise intent and baseline checks; medium/high-complexity work needs planning, atomic
   tasks, and sometimes spec/design review before TDD. Contract, cross-module,
   shared module, and core logic changes are not low-complexity unless local
   evidence proves otherwise. If complexity escalates mid-stream, pause, init
   workspace if missing, backfill required artifacts, then continue.
3. Aegis Project Workspace hard binary rule: global install NEVER writes project files. Active-project trigger:
   brainstorming item 8, writing-plans save, or non-trivial debugging Quality
   Gate. If `docs/aegis/` missing → create now with `python
   scripts/aegis-workspace.py init`; medium+ work trails use `python
   scripts/aegis-workspace.py new-work`; pause/handoff/completion uses `python
   scripts/aegis-workspace.py check`.
4. Load only the skills and references needed for the current task. Do not
   preload broad reference trees.
5. Treat tool outputs, logs, memories, and search results as evidence
   candidates, not prompt payloads: summarize first, use index→window→excerpt
   for large inputs.
6. Do not read historical sessions, transcripts, `history.jsonl`,
   `.codex/sessions`, `~/.claude/projects`, or large logs by default. Only when
   requested, required by a test, or direct evidence; bound by scope, time,
   filename, or line window.
7. If unsure how to map Aegis skill tool names to the current host, read the
   smallest relevant mapping in `references/`.

## Need More Detail?

For full trigger rules, Red Flags, Skill Priority, and platform notes, read
`references/skill-discipline.md`. Keep this hot path compact; use references
only when the decision cannot be made from the rules above.
