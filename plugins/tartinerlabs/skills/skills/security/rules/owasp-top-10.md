---
title: OWASP Top 10 Vulnerabilities
impact: HIGH
tags: owasp, injection, xss, ssrf, security
---

**Rule**: Scan for common web application vulnerabilities from the OWASP Top 10.

### What to Check

- **SQL injection**: Raw queries with string concatenation or template literals containing user input
- **XSS**: Unsanitised user input rendered in HTML/JSX, `dangerouslySetInnerHTML`, raw `innerHTML`
- **Command injection**: Shell commands constructed with user input (`exec`, `spawn`, `execSync`)
- **Path traversal**: User input in file paths without sanitisation (`../` sequences)
- **SSRF**: User-controlled URLs passed to server-side HTTP requests

### Incorrect

```ts
// SQL injection
const user = await db.query(`SELECT * FROM users WHERE id = '${req.params.id}'`);

// XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Command injection
exec(`convert ${userFilename} output.png`);
```

### Correct

```ts
// Parameterised query
const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

// Sanitised output
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// Safe argument passing
execFile('convert', [userFilename, 'output.png']);
```
