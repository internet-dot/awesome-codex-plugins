---
title: Remove Dead Code
impact: HIGH
tags: dead-code, unused, commented-out
---

**Rule**: Remove unused variables, unreachable branches, and commented-out code.

### Incorrect

```ts
function getUser(id: string) {
  // const cache = new Map();
  // if (cache.has(id)) return cache.get(id);
  return db.users.findUnique({ where: { id } });
}
```

### Correct

```ts
function getUser(id: string) {
  return db.users.findUnique({ where: { id } });
}
```
