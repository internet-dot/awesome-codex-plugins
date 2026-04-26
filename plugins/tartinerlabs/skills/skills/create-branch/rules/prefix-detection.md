---
title: Auto-Prefix Detection
impact: MEDIUM
tags: prefix, keyword, detection, branch
---

**Rule**: Detect keywords in user input and apply the appropriate branch prefix automatically.

### Keyword Mapping

| Prefix | Keywords |
|--------|----------|
| `feature/` | add, implement, create, new, feature |
| `bugfix/` | fix, bug, resolve, patch, repair |
| `hotfix/` | hotfix, urgent, critical, emergency |
| `chore/` | chore, refactor, update, upgrade, maintain |
| `docs/` | docs, documentation, readme, guide |

### Behaviour

- If user input already starts with a recognised prefix, keep it as-is
- If multiple keywords match, prefer the first match in priority order above
- Apply prefix before kebab-case conversion

### Examples

```
"fix login bug"        → bugfix/login-bug
"add user search"      → feature/user-search
"docs/update readme"   → docs/update-readme  (prefix kept)
```
