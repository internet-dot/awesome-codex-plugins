# Frontend technique selector

Use this before implementation when the design calls for animation, scrolling, transitions, or rich interaction.

## First choose the surface

| Surface | Default motion level | Good techniques | Avoid |
|---|---|---|---|
| Marketing page | signature | hero transition, scroll reveal, pinned story, before/after, parallax, marquee | dense dashboard controls |
| SaaS dashboard | subtle | split pane, command palette, skeletons, inline feedback, shortcut overlay | smooth scroll, heavy pinned sections |
| Docs/API | subtle | sticky nav, search, copy buttons, active section marker, code tabs | parallax, custom cursor, scroll hijacking |
| Checkout/pricing | restrained | comparison table, inline validation, progress stepper, trust matrix | playful motion near payment risk |
| Editor/canvas | minimal | stable panels, drag handles, command palette, undo/redo, inspector | layout-shifting animation |
| Agent run/tool execution | informative | timeline replay, progress, logs, artifacts, retry/cancel/resume | vague spinner-only loading |

## Technique choices

### CSS transitions

Use for:

- hover/focus states
- buttons
- tabs
- cards
- disclosure panels
- tiny feedback moments

Choose when the interaction is simple and should be lightweight.

### CSS keyframes

Use for:

- loading indicators
- subtle background movement
- repeating attention cues
- small decorative loops

Keep loops slow and low contrast. Respect `prefers-reduced-motion`.

### Motion for React

Use for:

- page/section reveal
- card expansion
- modal/sheet entrance
- layout transitions
- command palette animation
- scroll-linked progress

Best default for React apps when motion should support product behavior.

### GSAP ScrollTrigger

Use for:

- pinned storytelling
- scrubbed hero sequences
- text and SVG choreography
- Awwwards-style launch pages

Require a clear reason. Do not add it to ordinary product screens.

### Native scroll-driven CSS

Use for:

- progress indicators
- reveal-on-view
- lightweight scroll-linked styling

Add fallbacks or avoid if browser support is uncertain for the target audience.

### Lenis or smooth scroll

Use for:

- editorial pages
- immersive brand pages
- portfolio-like sites

Avoid for:

- dashboards
- docs
- forms
- admin tools
- code/editor surfaces

### View Transitions API

Use for:

- route transitions
- gallery/detail transitions
- document-like navigation
- SPA page continuity

Do not use when it hides loading, error, or state changes the user needs to notice.

## Product rules

- Motion should explain hierarchy, continuity, or progress.
- Scrolling effects should serve the story, not trap the user.
- Repeated-use tools should feel fast and stable.
- Marketing pages can be more expressive, but only around one or two signature moments.
- Every motion-heavy page needs a reduced-motion fallback.
- Never animate so much that the user cannot scan, copy, select, compare, or recover.
