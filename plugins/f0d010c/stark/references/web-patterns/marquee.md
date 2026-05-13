# Pattern — Marquee band

Horizontal scrolling text band. Pure CSS, no JS needed.

**When to deploy**: editorial (philosophical statements), brutalist (manifesto fragments), type-as-hero (specimen showcase), industrial-mono (log stream).

## CSS-only

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 60s linear infinite;
  display: flex;
  width: max-content;
}
```

```tsx
const items = ["Hand finished", "27 pieces a year", "Made to outlast us"];

<div className="overflow-hidden border-y border-rule py-12">
  <div className="marquee-track">
    {[0, 1].map((dup) => (
      <div key={dup} className="flex items-center gap-16 px-8 shrink-0">
        {items.map((it, i) => (
          <div key={`${dup}-${i}`} className="flex items-center gap-16 shrink-0">
            <span className="font-display whitespace-nowrap text-[64px]">
              <em className="italic">{it}</em>
            </span>
            <span className="block w-2 h-2 rounded-full bg-accent shrink-0" />
          </div>
        ))}
      </div>
    ))}
  </div>
</div>
```

Duplicate the items twice in track. Animate translateX(-50%). Loop hides the seam.

## Pause on hover

```css
.marquee-track:hover { animation-play-state: paused; }
```

## Reverse direction

```css
.marquee-track-reverse {
  animation: marquee 60s linear infinite reverse;
}
```

## Multi-speed parallax marquees

Stack 3 marquees at different speeds for editorial depth:

```tsx
<div>
  <Marquee items={A} speed={40} />
  <Marquee items={B} speed={60} reverse />
  <Marquee items={C} speed={80} />
</div>
```

## Speed via duration

`60s` for slow contemplative (editorial). `15-25s` for energetic (active bento).

## Avoid

- JS-driven marquees (too heavy, native CSS handles it)
- Very fast marquees (under 10s) — looks twitchy
- Marquees on mobile without `prefers-reduced-motion` respect
