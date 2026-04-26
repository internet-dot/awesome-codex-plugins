---
title: Prefer Logical Shorthands
impact: MEDIUM
tags: shorthand, margin, padding, verbose
---

**Rule**: Use shorthand classes (`m-*`, `p-*`, `px-*`, `py-*`) instead of specifying all individual sides when values are equal.

### Incorrect

```tsx
<div className="mt-4 mr-4 mb-4 ml-4">
<div className="pt-2 pb-2">
<div className="pl-4 pr-4">
```

### Correct

```tsx
<div className="m-4">
<div className="py-2">
<div className="px-4">
```
