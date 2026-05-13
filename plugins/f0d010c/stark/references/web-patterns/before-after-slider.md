# Pattern - Before / after slider

Use for visual diffs, design audits, image tools, cleanup products, performance before/after, accessibility improvements, and UX redesign proof.

## Structure

- Two aligned states with identical dimensions.
- Draggable divider with visible handle and keyboard alternative.
- Labels: before and after, plus what changed.
- Optional issue markers or annotations.
- Text summary below for accessibility and non-pointer users.

## Implementation notes

- Use pointer events and keyboard controls for the divider.
- Keep alt text or textual comparison nearby.
- Avoid relying on color alone to show improvement.
- If comparing UI, align baseline, viewport, and data state.

## Responsive

- Desktop: horizontal slider works well.
- Mobile: slider can work, but stacked before/after cards are often clearer.

## Avoid

- Comparing different content so the improvement is misleading.
- Slider as a gimmick when a simple annotated diff is clearer.
- No keyboard fallback.
