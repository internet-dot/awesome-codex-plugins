# Interaction techniques

Use this before implementation when a web design needs animation, scrolling, route transitions, command surfaces, split panes, or advanced interaction. This is product guidance, not a learning roadmap.

## Principle

Interaction should communicate one of four things:

- Hierarchy: what matters now.
- Continuity: what changed and where it came from.
- Progress: what the system is doing.
- Control: how the user can act faster or recover.

If a motion or scrolling idea does not support one of those jobs, do not add it.

## Technique decision matrix

| Technique | Use when | Strong surfaces | Avoid when |
|---|---|---|---|
| CSS transitions | Simple hover, focus, disclosure, tab, button, or status changes | all surfaces | sequencing multiple dependent elements |
| CSS keyframes | Small repeating or entrance animations | loaders, subtle ambience, status pulses | high-frequency dashboards with many animated rows |
| Motion for React / motion.dev | React component motion, layout transitions, modals, sheets, command palettes, route/detail continuity | apps, dashboards, docs, product-led sites | complex pinned scroll stories or SVG choreography |
| GSAP ScrollTrigger | Complex timeline, pinned scroll, scrubbed hero, character/SVG choreography | launch pages, editorial product stories, portfolios | dashboards, docs, forms, checkout, admin tools |
| Native scroll-driven CSS | Lightweight scroll progress, reveal-on-view, subtle section effects | editorial pages, docs progress, simple landing pages | critical flows without fallback, nested scroll containers |
| Lenis smooth scroll | Branded scroll feel as part of an immersive page | editorial, type-led, portfolio, campaign pages | dashboards, docs, forms, editors, admin tools |
| View Transitions API | Shared-element route/detail transitions | galleries, docs, app shells, product catalogs | hiding loading/error/permission changes |
| Command palette | Fast access to actions and navigation | devtools, docs, editors, dense SaaS | simple marketing pages |
| Inspector split pane | Keep list context while inspecting detail | dashboards, queues, audits, CRM, CI/deploys | one-off forms or simple landing pages |
| Timeline/run replay | Explain long-running or multi-step work | AI agents, CI, deploys, imports, automations | static marketing proof without process |
| Before/after slider | Compare transformation | redesigns, migrations, optimization, image/product changes | abstract value claims without visible delta |
| Keyboard shortcut overlay | Teach expert paths | editors, dashboards, command surfaces | first-run onboarding before basic actions are clear |

## Surface defaults

### Marketing / brand page

Default: one signature moment plus restrained baseline.

Good:

- hero reveal
- annotated product proof
- one pinned product story
- before/after comparison
- parallax or scroll reveal when it supports the narrative

Avoid:

- every section animating the same way
- Lenis plus parallax plus custom cursor plus pinned scroll by default
- motion that delays the conversion action

### SaaS dashboard / admin / CRM

Default: subtle, fast, stable.

Good:

- split pane
- command palette
- inline loading
- row expansion
- saved-view transition
- skeletons
- keyboard shortcut overlay

Avoid:

- smooth scroll
- scroll hijacking
- hover floating on every card
- animated counters that distract from real status
- pinned marketing story sections inside work surfaces

### Docs / API reference

Default: navigational clarity.

Good:

- sticky nav
- active section marker
- search or command palette
- copy button feedback
- code tab transitions
- lightweight scroll progress

Avoid:

- custom cursor
- parallax
- slow page-load curtains
- animation that makes code harder to copy

### Checkout / pricing / upgrade

Default: reassuring and direct.

Good:

- plan selection feedback
- inline validation
- price recalculation
- comparison table highlighting
- success confirmation

Avoid:

- playful motion near payment risk
- delayed buttons
- scroll effects that hide price, trial, cancellation, or risk details

### Editor / canvas / builder

Default: functional.

Good:

- selection feedback
- drag/resize affordances
- inspector transitions
- command palette
- undo/redo confirmation

Avoid:

- panel motion that shifts the canvas
- animated controls that move away from the cursor
- scroll tricks inside the work area

### Agent run / tool execution

Default: informative.

Good:

- plan preview
- progress timeline
- logs
- artifact arrival
- retry/cancel/resume controls
- stale or blocked state

Avoid:

- spinner-only loading
- celebratory animation before artifacts are available
- hiding tool calls or error details behind decorative cards

## Library selection rules

- Start with CSS for simple transitions.
- Use Motion for React (motion.dev) when component state, layout continuity, command palettes, route/detail transitions, sheets, or modal animation matters.
- Use GSAP only when there is a clear timeline or scroll-story requirement.
- Use Lenis only when scroll feel is part of the brand surface.
- Use native scroll-driven CSS only when the effect is progressive enhancement or the target browser support is acceptable.
- Use no animation when stability, reading, copying, comparing, or recovering matters more.

## Interaction budget

Choose one budget before implementation:

| Budget | Limit | Good for |
|---|---|---|
| none | no decorative motion; state changes only | docs, forms, admin, accessibility-sensitive surfaces |
| subtle | 1-3 small transitions, under 200ms | dashboards, settings, checkout, editors |
| functional | 2-4 interaction behaviors tied to workflow | devtools, agent runs, split-pane apps |
| signature | 1 hero motion + 2-3 supporting moments | product pages, launch pages |
| expressive | 2-4 coordinated sequences, tested carefully | campaigns, portfolios, type-led editorial |

Do not exceed the budget unless the user explicitly asks for an expressive showcase.

## Output expectation

When interaction is non-trivial, include this in the UI decision brief:

```md
Interaction decision
- Budget: none / subtle / functional / signature / expressive
- Techniques: ...
- Library: CSS / Motion / GSAP / native scroll CSS / Lenis / none
- Why this fits: ...
- Reduced-motion behavior: ...
- What was rejected: ...
```

## Red flags

- GSAP added to a dashboard only for card reveal.
- Lenis added to docs or admin UI.
- Scroll hijacking on checkout.
- Custom cursor on dense forms.
- Motion that moves controls during pointer interaction.
- No `prefers-reduced-motion` behavior.
- Animation hiding loading, error, permission, or payment details.
- Five or more unrelated motion tricks on one page.
