---
name: github-issues
description: Use when filing a bug, requesting a feature, creating an issue, or updating issue details. Manages GitHub issues with templates, formatting, and auto-assignment.
allowed-tools: Read Bash(gh:*)
model: sonnet
effort: medium
---

You create, update, query, and comment on GitHub issues.

Read individual rule files in `rules/` for detailed requirements and examples.

## Rules Overview

| Rule | Impact | File |
|------|--------|------|
| Issue title | HIGH | `rules/issue-title.md` |
| Template adherence | MEDIUM | `rules/template-adherence.md` |
| No checklists | MEDIUM | `rules/no-checklists.md` |

## Workflow

1. Determine action: create, update, query, or comment
2. Check if we're in a GitHub repository and get owner/repo info
3. Check for issue templates in `.github/ISSUE_TEMPLATE/` or `.github/`
4. List available organisation issue types (fails for user-owned repos — expected, proceed without)
5. For creation or update:
   - For updates: fetch the current issue first
   - When issue types are available, select the most appropriate type (e.g. Bug for defects, Feature for new functionality, Task for general work)
   - Generate title following `rules/issue-title.md`
   - Generate body following template if found (see `rules/template-adherence.md`), otherwise use clear structured format
   - For creation: get the current authenticated user and include in assignees
   - If the user specifies a parent issue, link the created/updated issue as a sub-issue (use the issue's **node ID**, not its number)
6. For parent/sub-issue management:
   - To list sub-issues: get the parent issue's sub-issues
   - To add a sub-issue: pass the parent issue number and the child's node ID
   - To remove a sub-issue: unlink the child from the parent
   - To reorder sub-issues: reprioritise with `after_id` or `before_id`
   - When creating multiple related issues, prefer structuring them as a parent with sub-issues rather than flat independent issues
7. For queries:
   - Fetch a specific issue by number
   - Inspect sub-issue hierarchy on a parent issue
   - Search issues for filters, keywords, and cross-repo lookups
   - List repository issues
8. For comments:
   - Fetch issue context first when needed
   - Add the comment to the issue
9. Display a summary with issue links and what changed

## Validation

- For titles: follow `rules/issue-title.md`
- For body with template: follow `rules/template-adherence.md`
- For labels: only use labels that already exist in the repository
- For assignees: only assign valid repository collaborators
