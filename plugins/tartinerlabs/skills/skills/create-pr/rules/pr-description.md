---
title: PR Description Format
impact: MEDIUM
tags: pr, description, concise
---

**Rule**: Concise bullet points summarising key changes. No verbose sections or heading templates.

### Incorrect

```markdown
## Summary
This PR adds user authentication using OAuth2...

## Changes
- Added login endpoint
- Added signup endpoint
- Added middleware
- Updated database schema

## Test Plan
- [ ] Test login flow
- [ ] Test signup flow
```

### Correct

```markdown
- Add OAuth2 login and signup endpoints with session middleware
- Update database schema with users and sessions tables
```

### Guidelines

- Focus on what changed and why
- No test plan, acceptance criteria, or additional sections
- Be direct and specific
