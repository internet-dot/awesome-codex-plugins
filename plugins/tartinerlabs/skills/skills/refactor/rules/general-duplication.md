---
title: Extract Duplicated Logic
impact: HIGH
tags: duplication, dry, extract
---

**Rule**: Extract repeated logic into a shared function when the same pattern appears 3+ times.

### Incorrect

```ts
// handler-a.ts
const user = await db.user.findUnique({ where: { id } });
if (!user) throw new NotFoundError("User not found");
if (!user.isActive) throw new ForbiddenError("User is inactive");

// handler-b.ts
const user = await db.user.findUnique({ where: { id } });
if (!user) throw new NotFoundError("User not found");
if (!user.isActive) throw new ForbiddenError("User is inactive");

// handler-c.ts
const user = await db.user.findUnique({ where: { id } });
if (!user) throw new NotFoundError("User not found");
if (!user.isActive) throw new ForbiddenError("User is inactive");
```

### Correct

```ts
// get-active-user.ts
async function getActiveUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User not found");
  if (!user.isActive) throw new ForbiddenError("User is inactive");
  return user;
}

// handler-a.ts
const user = await getActiveUser(id);
```
