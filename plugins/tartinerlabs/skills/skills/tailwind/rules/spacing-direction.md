---
title: Spacing Direction — Bottom Only
impact: HIGH
tags: spacing, margin, padding, gap
---

**Rule**: Never use `mt-*` or `pt-*` classes. Use `mb-*`, `pb-*`, or `gap` instead. Consistent bottom-only spacing prevents margin collapse issues and creates predictable vertical rhythm.

### Incorrect

```tsx
<div className="mt-4 pt-4">
  <h2 className="mt-6">Title</h2>
  <p className="mt-2">Content</p>
</div>
```

### Correct

```tsx
<div className="mb-4 pb-4">
  <h2 className="mb-2">Title</h2>
  <p>Content</p>
</div>

<!-- Or use gap on parent -->
<div className="flex flex-col gap-4">
  <h2>Title</h2>
  <p>Content</p>
</div>
```
