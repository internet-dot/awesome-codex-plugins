---
title: GPU-Accelerated Animations
impact: MEDIUM
tags: animation, transition, transform, performance
---

**Rule**: Use `transition-transform` and transform utilities instead of `transition-all` with layout-triggering properties. GPU-accelerated properties (`transform`, `opacity`) avoid layout recalculation.

### Incorrect

```tsx
<div className="transition-all hover:ml-4">
<div className="transition-all duration-300 hover:w-64">
```

### Correct

```tsx
<div className="transition-transform hover:translate-x-4">
<div className="transition-[width] duration-300 hover:w-64">
```

Prefer animating `transform` and `opacity` over `width`, `height`, `margin`, or `padding`.
