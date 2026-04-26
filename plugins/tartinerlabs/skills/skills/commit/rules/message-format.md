---
title: Commit Message Format
impact: HIGH
tags: commit, message, format, 50-char
---

**Rule**: Subject line maximum 72 characters. Use present tense verbs. Be specific but concise.

### Detect commitlint

Before formatting the message, check for commitlint in the project:

1. Look for any of the following (commitlint resolves via cosmiconfig):
   - `commitlint.config.{ts,cts,mts,js,cjs,mjs}`
   - `.commitlintrc` or `.commitlintrc.{ts,cts,mts,js,cjs,mjs,json,yaml,yml}`
   - `commitlint` key in `package.json` or `package.yaml`
2. If found, use **conventional commit** format: `type: description` (or `type(scope): description`)
3. If not found, use **plain** format (no prefix)

### Conventional Commit Format (when commitlint is present)

```
fix: handle auth redirect for expired tokens
```

```
feat: add user search endpoint
```

```
docs: update API usage examples
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

- The 72-character limit includes the `type: ` prefix
- Use scope only when it adds clarity: `fix(auth): handle expired token redirect`
- Description starts with lowercase verb

### Plain Format (when no commitlint)

```
fix auth redirect for expired tokens
```

```
add user search endpoint
```

- Start with a verb: add, fix, update, remove, refactor
- No conventional commit prefixes

### Incorrect (either format)

```
Updated the authentication flow to handle edge cases with expired tokens and added retry logic
```

### Commit Body

**Default to a single subject line — no body.** The vast majority of commits should be subject-only. Only add a body for:
- Breaking changes
- Non-obvious design decisions
- Security-related context that shouldn't be lost

```
feat(payments): switch from Stripe v2 to v3 SDK

v2 is deprecated and loses security patches in Q3.
The new SDK uses a promise-based API and removes the
manual webhook signature workaround in utils/stripe.ts.

Closes #412
```

- Separate subject from body with a blank line
- Wrap body at 72 characters
- Explain *why*, not *how* — the diff shows the how

### Guidelines

- No trailing period
- Subject describes the *what*; body explains the *why*
- Present tense: "add" not "added", "fix" not "fixed"
