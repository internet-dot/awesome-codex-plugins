---
title: Authentication & Access Control
impact: HIGH
tags: auth, authorization, session, jwt
---

**Rule**: Verify authentication and authorisation checks on all protected routes and resources.

### What to Check

- Missing authentication middleware on protected endpoints
- Broken access control (no authorisation check after authentication)
- Insecure session management (predictable session IDs, missing expiry)
- JWT misconfigurations (weak algorithms like `none` or `HS256` with weak secrets, missing expiry)

### Incorrect

```ts
// No auth check on sensitive endpoint
app.get('/api/admin/users', async (req, res) => {
  const users = await db.users.findMany();
  return res.json(users);
});

// Weak JWT config
jwt.sign(payload, 'secret', { algorithm: 'HS256' });
```

### Correct

```ts
// Auth + authorisation middleware
app.get('/api/admin/users', authenticate, authorise('admin'), async (req, res) => {
  const users = await db.users.findMany();
  return res.json(users);
});

// Strong JWT config
jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'RS256', expiresIn: '1h' });
```
