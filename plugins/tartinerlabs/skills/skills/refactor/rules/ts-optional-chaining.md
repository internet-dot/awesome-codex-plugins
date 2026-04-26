---
title: Use Optional Chaining
impact: MEDIUM
tags: optional-chaining, null-checks, readability
---

**Rule**: Replace nested `&&` chains with optional chaining (`?.`).

### Incorrect

```ts
const city = user && user.address && user.address.city;
```

### Correct

```ts
const city = user?.address?.city;
```
