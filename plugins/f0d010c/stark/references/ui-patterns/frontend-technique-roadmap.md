# Frontend technique roadmap

Use this when Stark needs to choose concrete frontend techniques, or when a user wants to learn enough frontend design/development to guide better UI generation.

The goal is not to become a full frontend expert before designing. The goal is to know the names, tradeoffs, and right use cases for common layout, motion, scrolling, and interaction techniques.

## Phase 1 - Layout fundamentals

Learn these first because most "bad AI UI" is bad layout before it is bad styling.

- Box model: margin, padding, border, content size.
- Flexbox: one-dimensional alignment, nav rows, toolbars, button groups.
- Grid: two-dimensional layout, dashboards, galleries, editorial layouts.
- Positioning: relative, absolute, fixed, sticky.
- Responsive rules: breakpoints, fluid sizing, min/max widths, overflow containment.
- Visual hierarchy: spacing, type scale, contrast, grouping, primary/secondary actions.

Best starting sources:

- MDN Learn Web Development
- MDN CSS layout
- web.dev Learn CSS
- The Odin Project foundations
- roadmap.sh frontend roadmap for topic order

## Phase 2 - CSS interaction basics

Learn these before animation libraries:

- `transition`
- `transform`
- `opacity`
- `filter`
- `@keyframes`
- `:hover`, `:focus-visible`, `:active`, `:has()`
- `prefers-reduced-motion`

Performance rule: animate `transform` and `opacity` first. Avoid animating layout-heavy properties like width, height, top, left, margin, and box-shadow unless the surface is small and tested.

## Phase 3 - State-driven UI

Learn how interfaces respond to changing data:

- Empty states
- Loading skeletons
- Disabled states
- Error states
- Permission blocked states
- Optimistic updates
- Toasts and inline feedback
- Long-running progress
- Retry and undo

Stark should treat states as design features. A screen with only the happy path is not finished.

## Phase 4 - Motion for React

Use Motion when the project is React/Vite/Next and needs tasteful product motion.

Learn:

- `motion.div`
- `initial`, `animate`, `exit`
- `whileHover`, `whileTap`
- `whileInView`
- `useScroll`
- `useTransform`
- layout animations
- AnimatePresence

Good uses:

- card hover polish
- section reveal
- command palette open/close
- split-pane detail transitions
- route/page transitions
- scroll progress bars

Avoid:

- heavy pinned storytelling
- complex SVG timelines
- over-animated dashboards

## Phase 5 - GSAP and ScrollTrigger

Use GSAP when the site needs a high-end, sequenced, scroll-driven marketing experience.

Learn:

- `gsap.to()`, `gsap.from()`, `gsap.timeline()`
- ScrollTrigger start/end markers
- scrubbed animations
- pinned sections
- staggered text
- SVG and canvas sequencing
- cleanup on route changes

Good uses:

- launch pages
- interactive product stories
- portfolio/studio sites
- type-as-hero scenes
- hero-to-section morphs

Avoid:

- CRUD dashboards
- docs
- forms
- checkout
- admin tools

## Phase 6 - Native CSS scroll-driven animation

Use CSS scroll-driven animations for lightweight effects when browser support and layout constraints are acceptable.

Learn:

- `animation-timeline: scroll()`
- `animation-timeline: view()`
- `animation-range`
- `view-timeline`

Good uses:

- reading progress
- reveal-on-view
- subtle parallax
- decorative progress indicators

Avoid:

- critical interactions that must work everywhere
- deeply nested scroll containers unless tested
- mobile-heavy production work without fallback

## Phase 7 - Smooth scroll and scroll feel

Use Lenis or similar smooth-scroll tools only when the scroll feel is part of the brand.

Good uses:

- editorial sites
- Awwwards-style landing pages
- immersive portfolios
- product stories

Avoid:

- dashboards
- docs
- admin panels
- code editors
- long forms
- anything where precise scroll position matters

## Phase 8 - Pattern vocabulary

Learn the names and jobs of common web interactions:

- Sticky section
- Pinned scroll
- Reveal on scroll
- Parallax layers
- Scroll progress
- Marquee
- Command palette
- Split pane
- Drawer/sheet
- Inspector panel
- Before/after slider
- Timeline replay
- Keyboard shortcut overlay
- Magnetic button
- Hover tilt
- View transition
- Skeleton loading
- Optimistic update

Stark should choose these by failure mode, not trend:

| Need | Technique |
|---|---|
| Explain a sequence | pinned scroll / timeline replay |
| Compare old vs new | before-after slider |
| Help power users move faster | command palette / shortcut overlay |
| Keep list context while inspecting | split pane / inspector |
| Make first load feel stable | skeleton loading |
| Show background work | progress timeline + logs |
| Create brand memory | one signature motion moment |
| Improve trust | permission matrix / audit trail |

## Practice projects

Build these as tiny demos:

1. Responsive landing page with real type hierarchy and no animation.
2. Scroll reveal page using only CSS transitions.
3. React page using Motion for section reveals and layout transitions.
4. Product story using GSAP ScrollTrigger with one pinned section.
5. Dashboard with split pane, command palette, loading, empty, error, and permission states.
6. Agent run UI with timeline, logs, artifacts, retry, cancel, and resume.
7. Before/after slider for a redesign or upgrade flow.
8. Docs/API layout with sticky nav, code panel, copy buttons, and search.

Turn each demo into a screenshot and a short pattern note. Stark improves fastest when every visual trick is tied to a product job.
