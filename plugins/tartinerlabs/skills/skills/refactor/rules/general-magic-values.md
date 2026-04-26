---
title: Replace Magic Values
impact: MEDIUM
tags: magic-numbers, constants, readability
---

**Rule**: Replace hardcoded numbers and strings with named constants.

### Incorrect

```ts
if (retries > 3) throw new Error("Failed");
setTimeout(callback, 86400000);
```

### Correct

```ts
const MAX_RETRIES = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (retries > MAX_RETRIES) throw new Error("Failed");
setTimeout(callback, ONE_DAY_MS);
```
