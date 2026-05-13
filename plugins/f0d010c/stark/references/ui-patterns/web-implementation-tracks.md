# Web implementation tracks

Use this before choosing a frontend stack. Pick the smallest stack that can execute the design well.

Do not default every page to React. Do not avoid React when the interaction model clearly needs component state, animation orchestration, routing, or reusable product surfaces.

## Track choices

| Track | Use when | Avoid when |
|---|---|---|
| Static HTML/CSS/JS | simple landing page, docs fragment, one-off prototype, small animation, no persistent state | complex interactive UI, many reusable sections, rich animation state |
| Vite + React | advanced landing page, animated campaign, dashboard, command palette, filters, inspectors, app shell, stateful demo | content-heavy SEO site that needs server/rendering decisions |
| Next.js | marketing + app hybrid, SEO, routing, server data, auth, docs/product pages at scale | static one-pager or local prototype where framework weight adds little |
| Astro | content/editorial site, docs, mostly static pages with islands of interactivity | dense app UI, complex client-side state everywhere |
| SvelteKit/Solid/Qwik | user explicitly asks, existing project uses it, or performance/interaction model fits | when the agent would choose it just to be novel |

## React is worth it when

- Components repeat across sections or screens.
- UI state changes frequently: filters, selection, tabs, sheets, command palettes, inspectors, forms.
- Animation depends on component state, layout continuity, or route/detail transitions.
- The page includes interactive product demos or simulated app UI.
- The work will grow into an app, dashboard, or reusable design system.
- Libraries such as Motion, GSAP React integration, React Three Fiber, shadcn, or TanStack are central to the plan.

## React is not worth it when

- The page is mostly static copy and imagery.
- The only interaction is hover, focus, disclosure, or simple scroll reveal.
- A plain CSS/JS solution is clearer, faster, and easier to audit.
- The design is a small embed or isolated static artifact.
- Adding npm dependencies increases risk without buying real behavior.

## Stack decision brief

Before coding a web surface, state:

```md
Implementation track
- Track: static / Vite React / Next / Astro / other
- Why this track fits:
- Why the simpler track was rejected:
- Required dependencies:
- Dependency risk notes:
- Lockfile/audit plan:
```

## Dependency safety

When installing dependencies, especially during active npm supply-chain incidents:

- Prefer existing project dependencies and lockfiles.
- Pin versions instead of floating to latest when risk is high.
- Run package-manager audit checks after install when available.
- Avoid install-time scripts unless a dependency truly requires them.
- Do not add large dependency chains for decorative effects.
- Treat newly published, typosquatted, deprecated, or surprise-maintainer packages as suspicious.
- Prefer CSS/native APIs before adding a library for one small interaction.
- If a package ecosystem is under active incident response, wait or choose an existing/local stack.

## Motion library fit

- Static track: CSS transitions, native scroll-driven CSS, small vanilla JS.
- Vite React: Motion for component/layout state, GSAP for timeline/pinned storytelling, CSS for simple feedback.
- Next: same as React, plus be careful with client/server boundaries.
- Astro: islands for isolated interactive parts; keep most content static.

## Self-audit

- Did the stack match the product surface, not the agent's habit?
- Did React buy real state/composition/animation value?
- Could static CSS/JS have done the same job with less risk?
- Are dependencies named, justified, and pinned/audited?
- Does the generated code still work if JavaScript loads slowly?
