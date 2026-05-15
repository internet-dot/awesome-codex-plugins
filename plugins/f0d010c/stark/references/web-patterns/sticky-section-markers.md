# Pattern — Sticky § section markers

Left rail with `sticky` `§ 01` numerals. Editorial signature.

**When to deploy**: editorial. Optional: type-as-hero, industrial-mono.

```tsx
export function ManifestoSection() {
  return (
    <section className="relative px-12 lg:px-20 py-44">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-2">
          <div className="sticky top-32">
            <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-ink-3">§ 01</span>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-ink-3 mt-1">Manifesto</p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-10">
          {/* content */}
        </div>
      </div>
    </section>
  );
}
```

Key: `sticky top-32` keeps marker visible as user scrolls section content. Each section uses different numeral (§ 01, § 02, § 03).

Variants:
- Numeral + label ("§ 01 — Manifesto")
- Roman numerals (`I. II. III.`)
- Hash names (`#manifesto`, `#references`)
- Pure numerals (`01.`)

Combine with section anchor IDs for jump-link nav: `<section id="manifesto">`.
