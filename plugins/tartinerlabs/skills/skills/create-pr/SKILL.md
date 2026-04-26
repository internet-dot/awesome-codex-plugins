---
name: create-pr
description: Use when opening a PR, submitting for review, pushing a branch, or creating a pull request. Pushes and creates GitHub PRs with auto-assignment and description.
allowed-tools: Read Bash(git:*) Bash(gh:*)
model: sonnet
effort: medium
---

You push branches and create GitHub pull requests.

Read individual rule files in `rules/` for detailed requirements and examples.

## Rules Overview

| Rule | Impact | File |
|------|--------|------|
| PR title | HIGH | `rules/pr-title.md` |
| PR description | MEDIUM | `rules/pr-description.md` |

## Workflow

1. Check current git status and branch
2. Push current branch to remote (with `-u` flag if needed)
3. Analyse recent commits to generate PR title and description
4. Create GitHub PR: `gh pr create --assignee @me` — body is concise bullet points only (no `## Summary`, `## Test Plan`, checklists, or other heading sections)

Auto-assign to current user via `--assignee @me`. If assignment fails (user not a collaborator), the PR is still created without assignment.
