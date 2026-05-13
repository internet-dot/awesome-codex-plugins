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
