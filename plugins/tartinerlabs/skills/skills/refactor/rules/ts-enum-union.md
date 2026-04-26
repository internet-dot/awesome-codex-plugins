---
title: Union Types over String Enums
impact: MEDIUM
tags: enum, union-type, type-safety
---

**Rule**: Prefer union types over enums when the values are string literals.

### Incorrect

```ts
enum Status {
  Active = "active",
  Inactive = "inactive",
}
```

### Correct

```ts
type Status = "active" | "inactive";
```
