---
title: Change Scope
impact: MEDIUM
tags: scope, split, single-commit, grouping
---

**Rule**: Keep related changes in a single commit. Only split when the changeset is large and mixes unrelated functionality.

### Single Commit (Default)

Most changes should be one commit:
- Bug fix with related test update
- New feature with supporting types
- Config change with documentation update

### Split Commits (Large Changesets Only)

Split when distinct, unrelated areas are modified:
- API endpoint + unrelated UI refactor → two commits
- Database migration + CI workflow change → two commits

### Staging

- Stage all related files together
- Use specific file paths, not `git add .`
- Review staged changes with `git diff --staged` before committing
