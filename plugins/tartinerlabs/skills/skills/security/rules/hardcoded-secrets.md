---
title: Hardcoded Secrets & Credentials
impact: HIGH
tags: secrets, api-keys, tokens, credentials
---

**Rule**: Never commit API keys, tokens, passwords, or connection strings in source code.

### What to Check

- API keys, tokens, and passwords in source files
- Private keys or certificates committed to the repo
- Database connection strings with embedded credentials
- `.env` files or config files with secrets not in `.gitignore`

### Incorrect

```ts
const API_KEY = "your-api-key-here";
const DB_URL = "postgres://user:pass@host:5432/db";
```

### Correct

```ts
const API_KEY = process.env.API_KEY;
const DB_URL = process.env.DATABASE_URL;
```

Ensure `.env` is listed in `.gitignore`. Use `.env.example` with placeholder values for documentation.
