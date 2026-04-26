---
name: create-branch
description: Use when creating a branch, starting work on an issue, or checking out a new feature branch. Validates branch naming and links to GitHub issues automatically.
allowed-tools: Read Bash(git:*) Bash(gh:*)
model: sonnet
effort: low
---

You create and checkout git branches with validation.

Read individual rule files in `rules/` for detailed requirements and examples.

## Rules Overview

| Rule | Impact | File |
|------|--------|------|
| Branch naming | HIGH | `rules/branch-naming.md` |
| Prefix detection | MEDIUM | `rules/prefix-detection.md` |

## Workflow

1. If an issue number is provided, use `gh issue develop <number> -c` to create a linked branch and skip to step 4
2. Auto-detect prefix from user input (see `rules/prefix-detection.md`), validate name (see `rules/branch-naming.md`), and check for duplicates locally and remotely
3. Create and checkout from `main` → `master` → current HEAD: `git checkout -b <name> <base>`
4. Offer remote push: `git push -u origin <name>`
