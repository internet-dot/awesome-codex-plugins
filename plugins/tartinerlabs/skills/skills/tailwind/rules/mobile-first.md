---
title: Mobile-First Responsive Design
impact: MEDIUM
tags: responsive, breakpoints, mobile-first
---

**Rule**: Always write mobile-first, progressively enhancing for larger screens. Base classes are for mobile; add `md:`, `lg:`, `xl:` for larger screens.

### Incorrect

```tsx
<!-- Desktop-first — shrinking down -->
<div className="text-2xl md:text-xl sm:text-lg">
<div className="grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
```

### Correct

```tsx
<!-- Mobile-first — scaling up -->
<div className="text-lg md:text-xl lg:text-2xl">
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```
