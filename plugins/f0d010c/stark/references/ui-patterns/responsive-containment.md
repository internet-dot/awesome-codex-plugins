# Responsive containment

Use this before shipping dense web apps, dashboards, editors, admin tools, tables, boards, and toolbars.

## Rule

Every surface must fit the viewport, but every data region does not have to collapse into cards. Dense tools can preserve tables, tab rows, filter chips, timelines, and inspectors when the overflow is intentionally contained.

## Required decisions

- Navigation: wrap, collapse, or make the nav row horizontally scrollable inside its own region.
- Tables: choose one of three patterns per breakpoint: contained horizontal scroll, priority-column list, or master/detail cards.
- Toolbars: keep primary actions visible; move rare filters into menus, drawers, or secondary rows.
- Inspectors: stack below the selected item on narrow screens, or use a sheet/drawer when the item must stay visible.
- Long labels: set wrapping or truncation rules before implementation.

## Acceptable overflow

- A table inside a clearly bounded scroll container with visible affordance.
- A chip/filter row that scrolls independently.
- A canvas/editor area that pans by design.

## Unacceptable overflow

- The whole page scrolls sideways because a nav, table, toolbar, code block, or inspector is wider than the viewport.
- Important actions are only reachable by accidental horizontal page scroll.
- A desktop dashboard is simply squeezed into a phone without changing navigation, table behavior, or detail panes.

## Implementation checks

- Test at 390px, 768px, and desktop width.
- Run a horizontal-overflow check on visible elements.
- Verify focus states remain reachable inside scroll containers.
- Prefer `overflow-x: auto` on the specific region, not `overflow-x: hidden` on the page as a cover-up.
