# Web Motion — Library + Technique Inventory (2026)

The model has wide motion vocabulary. Pick 2-4 signature moments per project, not all at once.

## Library landscape

| Library | Use for | Notes |
|---|---|---|
| **motion** (motion.dev) | React component motion, springs, layout animation, `useScroll`, `useTransform` | Successor to Framer Motion. ~30M monthly npm. 2.5-6× faster than GSAP on key paths. MIT. **Default for React.** |
| **GSAP** | Timelines, complex sequencing, SVG morphing, ScrollTrigger, SplitText | Now 100% free including SplitText / MorphSVG / DrawSVG (Webflow acquisition). Best for scroll-tied complex sequences. |
| **Theatre.js** | Cinematic 3D / R3F sequences with visual editor | Pair with single rAF loop. Niche, when needed. |
| **Lenis** | Smooth scroll | De facto on award sites. Use sparingly — native scroll fine for most. |
| **View Transitions API** | Native route transitions, shared element | Chrome/Edge/Safari 18.2+/Firefox 142+. Replaces FLIP for most cases. **Use for SPA navigation.** |
| **Native CSS scroll-driven** | `animation-timeline: view()` / `scroll()` | Chrome 115+ / Safari 26+ / Firefox 142+. Zero-JS reveals + progress bars. |

## Technique inventory (bookmark per pattern)

Each has dedicated reference at `web-patterns/<name>.md`. Don't deploy all on one project.

| Technique | Direction fit | Reference |
|---|---|---|
| Page-load curtain reveal | editorial, type-as-hero, glow-grain | `web-patterns/page-load-curtain.md` |
| Custom cursor | editorial, type-as-hero, glow-grain, active-bento | `web-patterns/custom-cursor.md` |
| Magnetic CTA | editorial, glow-grain, type-as-hero | `web-patterns/magnetic-button.md` |
| Scroll-pinned section | all (1 per page max) | `web-patterns/scroll-pinned-section.md` |
| View Transitions (route) | all w/ multi-page | `web-patterns/view-transitions.md` |
| Letter / word stagger | editorial, type-as-hero, glow-grain | `web-patterns/letter-stagger.md` |
| Variable-font hover | editorial (subtle), type-as-hero (signature) | `web-patterns/variable-font-hover.md` |
| Marquee band | editorial, brutalist, type-as-hero, industrial-mono | `web-patterns/marquee.md` |
| Layered parallax | editorial, type-as-hero, glow-grain | `web-patterns/parallax-layers.md` |
| 3D tilt card | editorial (interactive), active-bento, glow-grain | `web-patterns/3d-tilt-card.md` |
| Sticky § markers | editorial, type-as-hero, industrial-mono | `web-patterns/sticky-section-markers.md` |
| Native scroll-driven CSS | editorial, all | `web-patterns/scroll-driven-css.md` |
| Lenis smooth scroll | editorial, type-as-hero, glow-grain | `web-patterns/lenis-smooth-scroll.md` |
| Asymmetric grid | editorial, type-as-hero, glow-grain | `web-patterns/asymmetric-grid.md` |
| Symbol / glyph cycling | editorial, industrial-mono | `web-patterns/symbol-cycling-hover.md` |
| Connected animation (`layoutId`) | active-bento, editorial gallery→detail | `web-patterns/connected-animation.md` |
| Mesh gradient atmosphere | glow-grain (signature), type-as-hero, active-bento | `web-patterns/mesh-gradient.md` |
| Command palette | app shells, docs, devtools | `web-patterns/command-palette.md` |
| Inspector split pane | devtools, editors, audit tools | `web-patterns/inspector-split-pane.md` |
| Annotated product proof | SaaS, AI tools, security products | `web-patterns/annotated-product-proof.md` |
| Before/after slider | migrations, optimization, design systems | `web-patterns/before-after-slider.md` |
| Timeline / run replay | agents, CI, deploys, automations | `web-patterns/timeline-run-replay.md` |
| Permission / trust matrix | security, admin, enterprise settings | `web-patterns/permission-trust-matrix.md` |
| Empty state gallery | dashboards, onboarding, data apps | `web-patterns/empty-state-gallery.md` |
| Pricing comparison table | SaaS, developer tools, marketplaces | `web-patterns/pricing-comparison-table.md` |
| Docs / API reference layout | SDKs, CLIs, platform products | `web-patterns/docs-api-reference-layout.md` |
| Keyboard shortcut overlay | editors, command surfaces, power tools | `web-patterns/keyboard-shortcut-overlay.md` |

## When to deploy how many

- **1-2 motion moments** — minimum. Anything less = boring.
- **2-4 motion moments** — sweet spot for awwwards-tier. Each reinforces direction.
- **5+ motion moments** — usually over-motion. Becomes its own AI-tell.

## Signature moments per direction

- **Editorial**: letter stagger + reveal-on-scroll + var-font hover + Lenis
- **Brutalist**: instant render + cursor snap + marquee + mix-blend-difference
- **Type-as-hero**: page-load curtain + scroll-pinned headline morph + var-axis cursor-Y + mesh atmosphere
- **Glow + grain**: page-load curtain + mesh drift + scroll-driven glow shift + magnetic CTAs
- **Industrial mono**: typewriter intro + log marquee + monospace tickers + glyph cycle hover
- **Active bento**: layoutId connected + tile-expand hover + scroll-snap + custom cursor "VIEW"
- **Product proof**: annotated product preview + command palette + timeline/run replay + trust matrix

## Default page-load reveal sequence (editorial)

1. Initial mask/curtain animates off (200-400ms)
2. Background grain/glow fades in (300ms, eased)
3. Hero type reveals via stagger — line-by-line (50ms stagger between lines, spring physics)
4. Above-fold visual elements settle on spring (400-600ms)

Total: under 1.2s. Longer = over-animated.

## Spring physics defaults

```ts
// Restrained editorial
{ type: "spring", stiffness: 130, damping: 20 }

// Snappy active-bento
{ type: "spring", stiffness: 300, damping: 25 }

// Slow cinematic
{ type: "spring", stiffness: 80, damping: 22 }

// Bouncy fun
{ type: "spring", stiffness: 200, damping: 12 }
```

## Easing defaults (when not spring)

- Snappy mechanical: `cubic-bezier(0.85, 0, 0.15, 1)` — brutalist, industrial
- Soft considered: `cubic-bezier(0.2, 0, 0, 1)` — editorial, glow
- Custom flourish: `cubic-bezier(0.65, 0.05, 0.36, 1)` — type-as-hero

## prefers-reduced-motion (always honor)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In Motion:
```tsx
import { useReducedMotion } from "motion/react";
const reduce = useReducedMotion();
<motion.div
  animate={{ y: reduce ? 0 : -8 }}
  transition={reduce ? { duration: 0 } : { type: "spring" }}
/>
```

Failing this is an accessibility violation, not a stylistic choice.

## Sources

- motion docs: https://motion.dev/docs
- GSAP docs: https://gsap.com/docs
- View Transitions: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- Native scroll-driven: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- Lenis: https://lenis.darkroom.engineering
