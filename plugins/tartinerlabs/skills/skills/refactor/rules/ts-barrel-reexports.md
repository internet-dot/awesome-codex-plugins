---
title: Avoid Barrel Re-exports
impact: HIGH
tags: barrel-files, imports, bundle-size, tree-shaking
---

**Rule**: Avoid barrel `index.ts` files that re-export from other modules. They hurt tree-shaking, slow down TypeScript and bundlers, and create circular dependency risks. Import directly from source files instead.

### Incorrect

```ts
// components/index.ts — re-exports from many modules
export * from "./button";
export * from "./input";
export * from "./modal";

// consumer
import { Button } from "./components";
```

```ts
// utils/index.ts — trivial single-module re-export
export * from "./format";
```

### Correct

```ts
// Import directly from the source module
import { Button } from "./components/button";
import { formatDate } from "./utils/format";
```

### Exception

Package entry points where a deliberate public API boundary is needed are acceptable:

```ts
// packages/ui/index.ts — intentional public API
export { Button } from "./components/button";
export { Input } from "./components/input";
```
