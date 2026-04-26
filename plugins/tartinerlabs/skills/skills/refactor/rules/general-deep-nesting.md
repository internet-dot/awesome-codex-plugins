---
title: Flatten Deep Nesting
impact: HIGH
tags: nesting, guard-clauses, early-return
---

**Rule**: Flatten logic beyond 3 levels of indentation using early returns and guard clauses.

### Incorrect

```ts
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === "pending") {
        if (order.total > 0) {
          return submitOrder(order);
        }
      }
    }
  }
  return null;
}
```

### Correct

```ts
function processOrder(order: Order) {
  if (!order) return null;
  if (order.items.length === 0) return null;
  if (order.status !== "pending") return null;
  if (order.total <= 0) return null;

  return submitOrder(order);
}
```
