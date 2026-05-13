# Pattern — Lenis smooth scroll

Eased momentum scroll. De facto on award sites.

**When to deploy**: editorial (slow contemplative), type-as-hero (cinematic), glow+grain (atmospheric). **Skip** on brutalist (raw native), industrial-mono (snap), accessibility-first (motion-sensitive users).

## Install + use

```bash
npm install lenis
```

```tsx
import Lenis from "lenis";
import { useEffect } from "react";

export function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  // ...
}
```

## Tuning

| Param | Range | Effect |
|---|---|---|
| `duration` | 0.6-1.6 | Total ease time. 1.2 = considered, 0.8 = responsive |
| `lerp` | 0.05-0.15 | Lower = smoother but laggy. Default 0.1 |
| `wheelMultiplier` | 0.8-1.2 | Scroll input scaling |
| `easing` | function | Custom easing |

## Sync with Motion `useScroll`

Motion's `useScroll` uses native scroll position, which Lenis hijacks. Use Lenis's events instead:

```tsx
import { useMotionValue } from "motion/react";

const scrollY = useMotionValue(0);
useEffect(() => {
  lenis.on("scroll", ({ scroll }) => scrollY.set(scroll));
}, []);
```

## Sync with GSAP ScrollTrigger

```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## prefers-reduced-motion

```tsx
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = new Lenis({
  duration: reduce ? 0 : 1.2,
  smoothWheel: !reduce,
});
```

## Tradeoffs

- **Pros**: cinematic feel, eases scroll input naturally
- **Cons**: hijacks native scroll, can feel laggy on low-end devices, breaks accessibility for some users, breaks `scroll-snap` and CSS `animation-timeline: view()`
- **Recommendation**: ship with toggle, default off, enable for editorial/cinematic projects only
