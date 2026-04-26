---
title: Nullish Coalescing over Logical OR
impact: HIGH
tags: nullish-coalescing, falsy, defaults
---

**Rule**: Use `??` instead of `||` when the intent is to fall back only on `null`/`undefined`, not on falsy values like `0` or `""`.

### Incorrect

```ts
const port = config.port || 3000;
```

### Correct

```ts
const port = config.port ?? 3000;
```
