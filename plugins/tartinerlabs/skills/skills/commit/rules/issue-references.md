---
title: Issue References
impact: MEDIUM
tags: issues, github, closes, fixes, resolves, refs
---

**Rule**: When a GitHub issue is mentioned in conversation context, add a footer reference using a GitHub-recognised closing keyword.

### Closing Keywords (GitHub auto-closes the issue on merge)

```
Closes #123
Fixes #123
Resolves #123
```

Use whichever reads most naturally for the change:
- `Fixes` — for bug fixes
- `Closes` — for features or tasks
- `Resolves` — for anything else

### When to Use

- **Closes / Fixes / Resolves #N**: The changes fully resolve the issue — GitHub will auto-close it when merged to the default branch
- **No footer**: Changes are partial or no issue was mentioned in conversation context

### Format

Footer goes after a blank line following the body (or subject if no body):

```
fix login timeout bug

Fixes #123
```

```
feat(auth): add OAuth2 login

Adds Google and GitHub OAuth providers. Token refresh
is handled automatically via the session middleware.

Closes #89
```
