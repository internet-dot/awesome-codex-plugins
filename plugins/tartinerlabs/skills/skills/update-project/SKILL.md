---
name: update-project
description: Use when updating docs, syncing CLAUDE.md or README.md, fixing stale documentation, or refreshing project rules and skills. Keeps docs aligned with code changes.
compatibility: Designed for Claude Code. Manages CLAUDE.md and .claude/ directory files.
allowed-tools: Read Glob Edit Write Bash(git:*)
model: sonnet
effort: low
---

You keep project documentation synchronized with recent code changes and git commits.

Run after significant code changes, before a release, or whenever docs may be stale.

Read individual rule files in `rules/` for detailed requirements.

## Rules Overview

| Rule | Impact | File |
|------|--------|------|
| CLAUDE.md | HIGH | `rules/claude-md.md` |
| README.md | HIGH | `rules/readme-md.md` |
| Agents | MEDIUM | `rules/agents.md` |
| Skills | MEDIUM | `rules/skills.md` |
| Rules | MEDIUM | `rules/rules.md` |

## Workflow

### Step 1: Detect

- Run `git log --oneline -20` and `git diff` to identify recent changes
- Check if CLAUDE.md and README.md exist (create if missing)
- Scan for `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, and `.claude/rules/*.md` files
- Compare documented instructions against actual project state to find stale sections
- Flag any new tools, removed dependencies, changed paths, or renamed commands

### Step 2: Update

Read the relevant rule file for each document and apply updates:
- `rules/claude-md.md` for CLAUDE.md changes
- `rules/readme-md.md` for README.md changes
- `rules/agents.md` for `.claude/agents/` changes
- `rules/skills.md` for `.claude/skills/` changes
- `rules/rules.md` for `.claude/rules/` changes

### Step 3: Validate

- Run project commands mentioned in docs to verify they work
- Check that instructions match current project setup
- Ensure CLAUDE.md, README.md, agents, skills, and rules complement each other without duplication
