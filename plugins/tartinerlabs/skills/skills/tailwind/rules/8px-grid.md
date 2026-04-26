---
title: Follow 8px Grid System
impact: HIGH
tags: spacing, grid, 8px, consistency
---

**Rule**: Use spacing classes that are multiples of 8px. This is the industry standard (Material Design, Apple HIG). Avoid odd values and arbitrary pixel values.

Valid 8px scale classes: `2` (8px), `4` (16px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `14` (56px), `16` (64px), `20` (80px), `24` (96px), `32` (128px)

### Incorrect

```tsx
<div className="p-1 gap-3 m-5">
<div className="p-[13px]">
<div className="mt-7 py-9">
```

### Correct

```tsx
<div className="p-2 gap-4 m-4">
<div className="p-4">
<div className="mt-8 py-8">
```

When fixing, round to the nearest valid value: `3` → `2` or `4`, `5` → `4` or `6`, `7` → `6` or `8`.
