---
title: Async/Await over .then() Chains
impact: MEDIUM
tags: async-await, promises, readability
---

**Rule**: Replace `.then()` chains with async/await for readability.

### Incorrect

```ts
function fetchUser(id: string) {
  return fetch(`/api/users/${id}`)
    .then((res) => res.json())
    .then((data) => transformUser(data))
    .catch((err) => handleError(err));
}
```

### Correct

```ts
async function fetchUser(id: string) {
  try {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    return transformUser(data);
  } catch (err) {
    handleError(err);
  }
}
```
