# Operational dashboard pattern

Use for SaaS dashboards, admin panels, CRM views, support tools, analytics workspaces, moderation queues, inventory systems, and internal tools used repeatedly.

## Applies when

- Users return often and need speed more than delight.
- The product contains lists, filters, statuses, assignments, or alerts.
- Users compare, triage, bulk edit, or drill into records.

## Wrong when

- The screen is mainly a marketing hero or first-run onboarding.
- The product only has one or two simple actions and no repeated workflow.

## Shipped-product signals to look for

- A clear operational thesis: what is at risk, what queue is being worked, and what decision the operator should make next.
- Dense but readable tables or lists with persistent filters.
- Saved views for repeated jobs.
- Priority stack: what needs attention first.
- Master/detail or side panel to avoid losing list position.
- Bulk selection, batch actions, undo or confirmation for destructive actions.
- Inline status, ownership, timestamps, and audit trail.
- Empty state that teaches how data gets into the system.

## Failure prevented

Pretty-but-slow internal tools. Large cards, hidden filters, and decorative spacing make repeated work feel expensive.

Generic dashboards are also a failure. If the screen could belong to any CRM, support desk, or admin panel after swapping the logo, the design has not understood the work. Use domain-specific signals, labels, states, and actions so the surface feels like a tool built for one job.

## UX decision brief fields

- Pattern: command surface + saved views, or master/detail + filters + bulk actions
- Primary action: the repeated task users do most
- Secondary actions: filter, save view, bulk action, drilldown, export
- Required states: empty, loading skeleton, partial data, permission blocked, stale data, bulk action in progress
- Handoff constraints: preserve scan speed; do not use landing-page spacing; keep table/list position stable; make the operational thesis visible in the first viewport
