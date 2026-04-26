---
title: Type Guards over Type Assertions
impact: HIGH
tags: type-assertions, type-guards, narrowing
---

**Rule**: Replace `as` type assertions with proper type guards or narrowing.

### Incorrect

```ts
const user = data as User;
```

### Correct

```ts
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data;
}

if (isUser(data)) {
  // `data` is narrowed to User here
}
```
