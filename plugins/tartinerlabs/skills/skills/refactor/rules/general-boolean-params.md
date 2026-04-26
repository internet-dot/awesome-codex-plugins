---
title: Avoid Boolean Parameters
impact: MEDIUM
tags: boolean-params, options-object, readability
---

**Rule**: Functions with boolean flags often hide two distinct behaviours. Prefer splitting or using an options object.

### Incorrect

```ts
renderList(items, true);
```

### Correct

```ts
// Option 1: options object
renderList(items, { numbered: true });

// Option 2: separate functions when behaviour diverges significantly
renderNumberedList(items);
renderBulletList(items);
```
