---
name: using-hotl
description: Use when starting any conversation - establishes how to find and use HOTL skills for implementation tasks
---

## When to Use HOTL Skills

HOTL skills are for **code-changing tasks that require planning** — new features, refactors, and significant changes. Not every task needs a skill.

**Answer directly without invoking a skill:**
- Code understanding questions — "how does this work?", "where is this defined?", "explain this error"
- Quick fixes — typos, config values, import paths, obvious one-line corrections
- Error tracing — "what does this error mean?", "which file throws this?"

**Use `hotl:systematic-debugging` (no brainstorm/plan needed):**
- Bug investigations, test failures, unexpected behavior

**Use the full HOTL workflow (brainstorm → plan → execute):**
- New features, significant refactors, architectural changes

## Available HOTL Skills

Use the `Skill` tool to invoke any of these when appropriate:

| Skill | When to Use |
|---|---|
| `hotl:brainstorming` | Before any feature work — design with HOTL contracts |
| `hotl:writing-plans` | After design approval — produces `hotl-workflow-<slug>.md` |
| `hotl:executing-plans` | Linear execution with human checkpoints |
| `hotl:loop-execution` | Execute a `hotl-workflow-*.md` with loops + auto-approve |
| `hotl:subagent-execution` | Delegated step runner over the loop execution engine — delegates eligible steps to fresh subagents |
| `hotl:dispatch-agents` | 2+ independent tasks that can run in parallel |
| `hotl:finishing-a-development-branch` | After execution — merge back, publish/PR, keep, or discard the execution branch/worktree |
| `hotl:tdd` | Before writing any implementation code |
| `hotl:systematic-debugging` | When encountering any bug or unexpected behavior |
| `hotl:document-review` | Optional — review existing docs, external specs, or hand-authored plans |
| `hotl:requesting-code-review` | Dispatched by executors at review checkpoints — standardizes what context the reviewer receives |
| `hotl:receiving-code-review` | Invoked when review findings arrive — verify, evaluate against contracts, then implement |
| `hotl:code-review` | After completing implementation, before merging |
| `hotl:pr-reviewing` | Review a PR across multiple dimensions — description, code, scan, tests |
| `hotl:resuming` | Resume an interrupted workflow run with verify-first strategy |
| `hotl:verification-before-completion` | Before claiming work is done |
| `hotl:setup-project` | To generate adapter files for Codex, Cline, Cursor, Copilot |

## Red Flags (You Are Over-Routing)

- Routing a code question through brainstorming → just answer it
- Creating a plan for a typo fix → just fix it and verify
- Brainstorming before debugging → use systematic-debugging directly
- Skipping brainstorming for a real feature → invoke the skill

## HOTL Operating Principles

**Human-on-the-Loop:** Set intent + constraints upfront. AI executes autonomously within guardrails. Human reviews final output.

**Three contracts every implementation workflow should define:**
1. **Intent contract:** objective, constraints, success criteria
2. **Verification contract:** how to confirm each step worked
3. **Governance contract:** approval gates, risk level, rollback strategy
