---
title: Use size-* for Equal Dimensions
impact: HIGH
tags: size, width, height, dimensions
---

**Rule**: When width and height are equal, always use `size-*` instead of separate `h-*` and `w-*` classes.

### Incorrect

```tsx
<div className="h-8 w-8">
<div className="h-12 w-12">
<div className="h-full w-full">
<div className="w-6 h-6">
```

### Correct

```tsx
<div className="size-8">
<div className="size-12">
<div className="size-full">
<div className="size-6">
```

Only use separate utilities when dimensions differ:

```tsx
<!-- Correct — dimensions are different -->
<div className="h-8 w-12">
<div className="h-full w-screen">
```
