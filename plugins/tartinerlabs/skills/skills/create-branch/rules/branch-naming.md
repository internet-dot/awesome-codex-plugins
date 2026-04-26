---
title: Branch Naming
impact: HIGH
tags: branch, naming, kebab-case, validation
---

**Rule**: Use kebab-case with a prefix. Validate characters and length.

### Format

```
prefix/kebab-case-description
```

### Validation Rules

- Convert to lowercase
- Replace spaces and underscores with hyphens
- Reject: `~`, `^`, `:`, `?`, `*`, `[`, `]`, `\`, `@{`, `..`
- No leading or trailing slashes or hyphens
- Minimum: 3 characters (excluding prefix)
- Maximum: 100 characters total

### Examples

```
feature/add-user-search
bugfix/login-redirect
docs/update-readme
chore/upgrade-dependencies
```
