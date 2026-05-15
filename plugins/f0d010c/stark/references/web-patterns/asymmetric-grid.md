# Pattern — Asymmetric grid

Content offset from center, alternating sides, magazine-spread style.

**When to deploy**: editorial, type-as-hero, glow+grain. Active-bento naturally asymmetric. Industrial-mono can use grid lines but stays uniform.

## 12-col w/ left rail

```tsx
<section className="grid grid-cols-12 gap-8 px-12 lg:px-20 py-32">
  <aside className="col-span-12 lg:col-span-2">
    <div className="sticky top-32">
      <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-ink-3">§ 02</span>
    </div>
  </aside>
  <main className="col-span-12 lg:col-span-10">
    {/* content */}
  </main>
</section>
```

## Alternating featured

```tsx
{items.map((item, i) => {
  const isAlt = i % 2 === 1;
  return (
    <article className="grid grid-cols-12 gap-8 items-center">
      <div className={`col-span-12 lg:col-span-5 ${isAlt ? "lg:col-start-8 order-1 lg:order-2" : ""}`}>
        {/* visual */}
      </div>
      <div className={`col-span-12 lg:col-span-6 ${isAlt ? "lg:col-start-1 lg:row-start-1 order-2 lg:order-1" : ""}`}>
        {/* copy */}
      </div>
    </article>
  );
})}
```

Key: `lg:col-start-N` with `row-start-1` to swap order without HTML reorder. Reading order preserved for screen readers.

## Off-center hero

```tsx
<section className="grid grid-cols-12 gap-8">
  <div className="col-span-12 lg:col-span-7 lg:col-start-2">
    <h1>Hero text starts at column 2, ends at 9</h1>
  </div>
</section>
```

Asymmetric == content NOT in cols 1-12 evenly. Pick 7/9 or 8/10 col span, offset into grid.

## Magazine multi-column body

```css
.editorial-body {
  column-count: 2;
  column-gap: 4rem;
  column-rule: 1px solid var(--color-rule);
  font-family: var(--font-display);
  font-size: 17px;
  line-height: 1.6;
}
```

Use sparingly — multi-col body rare on web (mobile breaks easily).

## Avoid

- Centered everything (max-w-3xl mx-auto)
- Uniform 3-col grids (boring)
- Equal column spans for all features (use 5/7, 4/8, 3/9 mixes)
