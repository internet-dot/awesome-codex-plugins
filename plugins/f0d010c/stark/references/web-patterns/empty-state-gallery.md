# Pattern - Empty state gallery

Use for products with many surfaces, especially dashboards, settings, onboarding, integrations, editors, and agent tools.

## Required states

- Empty: how data arrives and the first useful action.
- Loading: skeleton that preserves layout shape.
- Partial: what is missing and what is still usable.
- Permission: what is blocked, why, and how to request/connect access.
- Error: what failed, whether data is safe, and the recovery action.
- Success: what happened and the next useful step.
- Stale: when data was last updated and how to refresh.

## Structure

- Keep the next action close to the state copy.
- Use domain language, not generic "No items yet".
- Make the state visually fit the surface density.
- For repeated-use tools, keep states compact.

## Avoid

- Empty states that explain every feature.
- Full-screen celebration for routine success.
- Error copy without a recovery path.
- Loading spinners that collapse the layout.
