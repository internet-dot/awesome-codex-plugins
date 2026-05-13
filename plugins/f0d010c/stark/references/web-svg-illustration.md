# Web SVG / CSS Illustration — No-Image Asset Generation

The model must NEVER write `<img src="placeholder.png">` or `via.placeholder.com` URLs. Instead generate visuals.

## Strategy 1 — Generated SVG illustration

For products / objects (watches, devices, abstract forms):

```tsx
// See examples/web-resonance-fm/src/components/WatchFace.tsx
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="98" fill="..." />
  {/* layered shapes */}
</svg>
```

Examples of CSS/SVG-rendered objects:
- **Watches** — case + dial + hands as concentric circles + lines
- **Phones / devices** — rounded-rect frames + screen + speakers
- **Cars** — silhouette path + wheel circles + accent lines
- **Coffee cups** — curved paths + handle ellipse + shadow
- **Type specimens** — single mega-letter with frame

## Strategy 2 — Mesh gradient as hero

When hero needs atmospheric visual but not an object:

```tsx
<div className="absolute inset-0 -z-10">
  <div className="absolute -top-40 -right-40 w-[55%] aspect-square rounded-full blur-3xl opacity-40"
    style={{ backgroundImage: "radial-gradient(circle, #A78BFA 0%, transparent 65%)" }} />
  <div className="absolute -bottom-40 -left-40 w-[50%] aspect-square rounded-full blur-3xl opacity-30"
    style={{ backgroundImage: "radial-gradient(circle, #FB923C 0%, transparent 65%)" }} />
</div>
```

## Strategy 3 — Type-as-image

Treat large characters as primary visual:

```tsx
<div className="relative">
  <span className="font-display text-[clamp(120px,22vw,320px)] leading-none text-ink/8">
    R
  </span>
  <div className="absolute inset-0 flex items-end justify-center pb-12">
    <span className="font-mono text-[10px] tracking-[0.32em] uppercase">Reference</span>
  </div>
</div>
```

## Strategy 4 — Geometric abstract layered shapes

For tech / abstract / non-representational:

```tsx
<div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-200 to-stone-700">
  {/* Big circle */}
  <div className="absolute -top-12 -right-16 w-3/5 aspect-square rounded-full blur-xl bg-white/30" />
  {/* Orbital ring */}
  <div className="absolute top-12 right-12 w-20 h-20 rounded-full border border-white/40" />
  {/* Diagonal stripe */}
  <div className="absolute left-[-15%] right-[-15%] top-1/2 h-32 -translate-y-1/2 -rotate-[14deg] bg-white/[0.10]" />
  {/* Grain */}
  <div className="noise-overlay" />
</div>
```

## Strategy 5 — Procedural patterns

For backgrounds:

```tsx
{/* Repeating paper texture */}
<div className="absolute inset-0"
  style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"4\" height=\"4\"><circle cx=\"1\" cy=\"1\" r=\"0.5\" fill=\"%23000\" opacity=\"0.05\"/></svg>')" }}
/>
```

```tsx
{/* Diagonal stripe pattern */}
<div className="absolute inset-0 opacity-5"
  style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 12px)" }}
/>
```

## Strategy 6 — Inline SVG noise

```tsx
<div className="noise-overlay" />
```

```css
.noise-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2'/></filter><rect width='400' height='400' filter='url(%23n)' opacity='0.65'/></svg>");
}
```

## When you absolutely need an image

If the user provides actual product photos or insists on imagery:
- Use user-provided, licensed, generated, or code-rendered imagery that supports the product job.
- Add `loading="lazy"` always
- Use `<picture>` w/ multiple sources for art-direction
- ALT text mandatory

But default = generate the visual yourself.

## Don'ts

- `<img src="placeholder.png">` — show what you can't deliver
- `via.placeholder.com/600x400` — visible filler
- `https://images.unsplash.com/photo-...` — generic stock that screams template
- "Image goes here" — placeholder text
- Empty divs with `bg-gray-200` named "image" — give it character

## Reference example

The `examples/web-resonance-fm/src/components/WatchFace.tsx` is a full no-image illustration: layered SVG circles, hour markers, hands, sub-dial, gradients, noise filter. ~200 lines, no external images, fully designed product visual.
