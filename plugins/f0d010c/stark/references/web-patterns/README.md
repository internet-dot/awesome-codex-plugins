# Web pattern index

Use this folder as a pattern palette, not a checklist. Pick two to four patterns that serve the surface type and product job.

## Marketing and brand pages

Use when the goal is memory, trust, and conversion.

- `annotated-product-proof.md` - strongest default for serious tools; shows the product instead of only claiming value.
- `before-after-slider.md` - useful when transformation is the value.
- `asymmetric-grid.md` - gives editorial rhythm without relying on decoration.
- `scroll-pinned-section.md` - good for step-by-step narratives, but keep it short.
- `letter-stagger.md` or `variable-font-hover.md` - one typographic signature move.
- `page-load-curtain.md` - only when the site has a deliberate editorial or launch feel.

Avoid using all motion patterns at once. A page with too many tricks feels less premium.

## SaaS dashboards and operational tools

Use when the product is used repeatedly.

- `inspector-split-pane.md` - best for list/detail workflows, alerts, tickets, runs, CRM records, and audits.
- `command-palette.md` - best for expert shortcuts without hiding mouse paths.
- `keyboard-shortcut-overlay.md` - useful once a tool has repeat workflows.
- `timeline-run-replay.md` - best for deploys, AI agent runs, background jobs, audits, and incident workflows.
- `permission-trust-matrix.md` - best for admin, team, billing, and security surfaces.
- `empty-state-gallery.md` - best for defining first-run and no-data states.

Prefer stable layout, visible filters, saved views, and clear state over spectacle.

## Docs, API, and developer tools

Use when comprehension speed matters.

- `docs-api-reference-layout.md` - docs with nav, content, code, and copyable examples.
- `command-palette.md` - quick navigation and actions.
- `annotated-product-proof.md` - show the API/workflow in context.
- `timeline-run-replay.md` - explain build, deploy, test, or agent execution.

## Pricing, checkout, and trust

Use when the user is making a cost or risk decision.

- `pricing-comparison-table.md` - plan clarity.
- `permission-trust-matrix.md` - access, data, compliance, and admin confidence.
- `before-after-slider.md` - value delta when upgrading.
- `empty-state-gallery.md` - explain what happens before data or access exists.

## Pattern choice rule

Choose patterns by failure mode:

| Failure risk | Prefer |
|---|---|
| User does not understand value | annotated product proof |
| User cannot compare options | pricing comparison table / before-after slider |
| User loses place in dense work | inspector split pane |
| User cannot trust action safety | permission/trust matrix |
| User cannot track background work | timeline/run replay |
| Power users are slowed down | command palette / shortcut overlay |
| First-run feels blank | empty-state gallery |
