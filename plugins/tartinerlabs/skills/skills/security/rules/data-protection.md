---
title: Data Protection
impact: MEDIUM
tags: logging, validation, input, sensitive-data
---

**Rule**: Prevent sensitive data leakage and validate input at system boundaries.

### What to Check

- Sensitive data (passwords, tokens, PII) logged in console output or error messages
- Missing input validation at API boundaries (request body, query params, headers)
- Sensitive data stored in plain text (localStorage, cookies without Secure/HttpOnly)

### Incorrect

```ts
// Logging sensitive data
console.log('User login:', { email, password });

// No input validation
app.post('/api/users', async (req, res) => {
  const user = await db.users.create({ data: req.body });
});
```

### Correct

```ts
// Redact sensitive fields
console.log('User login:', { email, password: '[REDACTED]' });

// Validate input at boundary
app.post('/api/users', async (req, res) => {
  const parsed = createUserSchema.parse(req.body);
  const user = await db.users.create({ data: parsed });
});
```
