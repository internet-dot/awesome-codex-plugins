# Pattern — Native scroll-driven CSS animation

`animation-timeline: view()` / `scroll()` — modern browser API for scroll-tied animation w/ zero JS. Chrome 115+, Edge 115+, Safari 26+, Firefox 142+.

**Use over JS scroll listeners** for: simple reveals, parallax, progress indicators.

## View timeline (element enters viewport)

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(60px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

`animation-range`:
- `entry` — element starts entering viewport from bottom edge
- `exit` — element starts leaving viewport from top edge
- `cover` — distance element is fully in viewport
- `contain` — distance element is fully contained (small elements)

Common ranges:
- `entry 0% cover 30%` — fades in as element appears, completes within first 30% of view
- `entry 0% exit 100%` — animation runs entire time element is visible

## Scroll timeline (page progress)

```css
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: var(--color-accent);
  transform-origin: 0 50%;
  animation: progress linear both;
  animation-timeline: scroll(root block);
}
@keyframes progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

Page-wide scroll progress bar — no JS.

## Named timelines (advanced)

```css
.parent {
  scroll-timeline-name: --my-timeline;
  scroll-timeline-axis: block;
}
.child {
  animation: fade linear both;
  animation-timeline: --my-timeline;
}
```

## Fallback

Wrap in `@supports`:

```css
@supports (animation-timeline: view()) {
  .reveal-on-scroll { animation: fade-up linear both; ... }
}
@supports not (animation-timeline: view()) {
  /* IntersectionObserver fallback or always-visible */
  .reveal-on-scroll { opacity: 1; }
}
```

## When to use vs Motion / GSAP

| Need | Use |
|---|---|
| Element fades in on scroll | Native CSS — `view()` |
| Page scroll progress bar | Native CSS — `scroll()` |
| Scroll-tied complex sequence (5+ pieces) | GSAP ScrollTrigger |
| Spring physics on scroll | Motion `useScroll` |
| Layout animation tied to scroll | Motion `useTransform` |
