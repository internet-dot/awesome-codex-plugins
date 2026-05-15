# Motion budget

Motion should explain state, continuity, or brand. It should not decorate every interaction.

| Product type | Motion budget | Good motion | Avoid |
|---|---|---|---|
| Operational dashboard | subtle | row expansion, filter transition, inline loading | scroll theatrics, card float on every hover |
| Marketing page | signature | hero reveal, scroll-tied proof, product demo transitions | every section animating the same way |
| Native settings | minimal | system transitions, disclosure, focus movement | custom easing that fights OS expectations |
| Editor/canvas | functional | selection, drag, resize, undo feedback | panel motion that shifts the canvas |
| Checkout/upgrade | reassuring | plan selection, price update, success confirmation | playful delays near payment |
| Agent/tool run | informative | progress, step changes, artifact arrival | spinner-only indefinite waiting |

Always respect reduced motion:

- Disable parallax and scroll-tied motion.
- Keep opacity/position transitions short.
- Preserve information changes without animation dependency.

## Budget levels

Choose the motion budget before choosing a library:

| Budget | Max motion surface | Use for | Reject |
|---|---|---|---|
| none | state changes only | docs, legal, simple forms, high-risk admin | decorative reveal, parallax, custom cursor |
| subtle | 1-3 short transitions | dashboards, settings, checkout, native-like apps | pinned scroll, smooth scroll, repeated card float |
| functional | 2-4 workflow interactions | command palettes, split panes, editors, agent runs | brand-only motion that slows the task |
| signature | 1 hero moment + 2-3 support moments | product pages, launches, case studies | every section using a different trick |
| expressive | 2-4 coordinated sequences | campaign, portfolio, type-led editorial | risky checkout/admin/docs flows |

If the product is used daily, the default budget is subtle or functional. If the product is a one-off brand surface, the default can be signature.

## Library fit

| Choice | Pick it for | Do not pick it for |
|---|---|---|
| CSS transitions | hover, focus, tabs, disclosure, feedback | complex sequencing |
| CSS keyframes | small loops, loaders, ambient texture | large lists or dense dashboards |
| Motion for React | component state, layout continuity, modals, sheets, route/detail transitions | complex pinned scroll choreography |
| GSAP ScrollTrigger | scrubbed timelines, pinned product stories, SVG/text choreography | ordinary SaaS dashboards, docs, checkout |
| Native scroll-driven CSS | progress, reveal-on-view, progressive enhancement | critical interactions without fallback |
| Lenis | branded editorial scroll feel | dashboards, docs, forms, editors, admin |
| none | stability, speed, reading, copying, comparing, recovery | brand campaign surfaces |

## Required output

For non-trivial interaction, add:

```md
Interaction decision
- Budget: ...
- Techniques: ...
- Library: ...
- Why this fits: ...
- Reduced-motion behavior: ...
- Rejected: ...
```
