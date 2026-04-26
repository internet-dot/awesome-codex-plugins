---
title: No Checklists
impact: MEDIUM
tags: issue, format, checklist
---

**Rule**: Never generate checkbox lists (`- [ ]` items) in issue bodies unless the template explicitly includes them or the user specifically requests them.

### Incorrect

```markdown
## Tasks
- [ ] Review requirements
- [ ] Implement solution
- [ ] Add tests
```

### Correct

```markdown
## Steps
1. Review requirements
2. Implement solution
3. Add tests
```

### Why

Checkboxes create task-tracking UI in GitHub that is inappropriate for issue documentation. Use numbered lists for sequential steps and bullet lists for non-sequential items.
