---
title: Reduce Tight Coupling
impact: HIGH
tags: coupling, dependencies, boundaries
---

**Rule**: Modules that import many siblings or reach across layers indicate coupling issues. Introduce interfaces or reorganise boundaries.

### Incorrect

```ts
// features/dashboard/stats.ts — reaches into many sibling features
import { getUser } from "../auth/get-user";
import { getOrders } from "../orders/get-orders";
import { getProducts } from "../products/get-products";
import { getPayments } from "../payments/get-payments";
import { getShipments } from "../shipping/get-shipments";
import { getReviews } from "../reviews/get-reviews";
```

### Correct

```ts
// features/dashboard/stats.ts — depends on an abstraction
import type { DashboardDataSource } from "./types";

export function buildStats(data: DashboardDataSource) {
  // works with the data it receives, not fetching it directly
}
```
