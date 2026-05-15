# UI audit rubric

Use this before final delivery or when auditing a screen.

## High severity

- Primary action is unclear or visually buried.
- Surface type is wrong: marketing composition used for an operations tool, or dense admin UI used for conversion.
- Dashboard or admin UI has no operational thesis and could belong to any product after replacing labels.
- Native platform idioms are violated: wrong icons, type, navigation, materials, or controls.
- Text overlaps, overflows, or cannot fit in controls at common viewport sizes.
- Page-level horizontal overflow appears on mobile or tablet because a nav, table, toolbar, inspector, or code block is not contained.
- Loading/error/permission/success visuals are missing for a real workflow.
- Visual asset is fake, placeholder, blurred beyond usefulness, or unrelated.

## Medium severity

- Too many competing accents or hierarchy levels.
- Repeated cards where tables/lists/panes are needed.
- Dense tables or filter rows use accidental page overflow instead of a bounded scroll region or responsive replacement.
- Motion is decorative and slows repeated use.
- Component spacing is one-note and makes scanning harder.
- Empty state explains features instead of the next action.
- Icons are generic, mismatched, or manually drawn when a platform icon exists.

## Low severity

- Copy can be more concrete.
- Minor color/token drift.
- Hover/focus states are present but bland.
- Section rhythm could be more varied.

Fix high severity issues before polish. A beautiful screen with the wrong surface type is still wrong.
