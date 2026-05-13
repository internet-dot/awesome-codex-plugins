# Reference analysis

Use this when Stark inspects shipped products, Mobbin/Figma/reference screenshots, product docs, or public app examples before designing.

## Principle

References are evidence of decisions, not source material to clone. Extract the structure behind the design, then adapt it to the user's product, platform, constraints, and visual direction.

## Extract

For every reference, capture:

- Product context: category, user mode, frequency, risk, and platform.
- User job: what the screen helps the user finish.
- Information architecture: primary object, navigation model, grouping, and depth.
- Hierarchy: primary visual, primary action, secondary actions, status, and metadata.
- Density: sparse, balanced, dense, operational, or expert.
- State coverage: empty, loading, partial, permission, error, success, stale, long-running.
- Interaction model: mouse, keyboard, command palette, drag/drop, bulk actions, inline edit, undo, drilldown, inspector.
- Recovery path: where the user goes when access, payment, deployment, sync, or validation fails.
- Responsive behavior: collapse, stack, split pane, drawer, horizontal containment, or mobile-specific pattern.
- Asset usage: icons, product screenshots, generated visuals, diagrams, photography, data viz, typography, texture.
- Trust signals: source, timestamp, permissions, audit trail, cost, ownership, and irreversible action warnings.

For cinematic landing references, also capture:

- First viewport composition: title placement, key art placement, nav weight, CTA placement.
- Key art system: subject, material, crop, lighting, depth, and how it repeats.
- Typography composition: display face, line breaks, scale jumps, metadata treatment.
- Section rhythm: full-bleed, contained, pinned, gallery, index, quiet sections.
- Motion pacing: title reveal, parallax, mask, pinned sequence, carousel, video scrub, final close.
- Mobile simplification: what gets removed, stacked, or reframed.

## Do not copy

- Brand identity, exact layout, proprietary screenshots, distinctive illustrations, copy, or trade dress.
- Paid reference-library assets into public output.
- Platform-specific idioms onto the wrong platform.
- A pattern just because it appears in a respected product.

## Reference comparison

Inspect 3-5 references when possible. Use this table:

| Reference | Job | IA pattern | Interaction | State lesson | Responsive lesson | Keep | Avoid |
|---|---|---|---|---|---|---|---|
| Product / screen | ... | ... | ... | ... | ... | structural decision | visual identity |

Then write:

```md
Reference extraction brief
- Pattern chosen: ...
- Why it fits this user's job: ...
- Structural decisions to borrow: ...
- Decisions to reject: ...
- State/responsive requirements: ...
- Asset/source constraints: ...
```

## Source quality

- Strong: official product docs, live app inspection, first-party screenshots, user-tested design systems, current platform guidelines.
- Useful but limited: marketing screenshots, blog breakdowns, public videos, Mobbin-style reference libraries.
- Weak: Dribbble shots, unlabeled screenshots, screenshots without workflow context, trend galleries.

## Shipped-product heuristics

- A shipped screen proves a real product team made a decision. It does not prove the decision is optimal.
- Repeated patterns across several products are stronger evidence than one beautiful screen.
- Workflow screens teach more than hero pages.
- Error, permission, empty, and settings screens teach more about product maturity than polished marketing screenshots.
- The more risky the action, the closer cost, permission, undo, and recovery copy should be to the action.
- Expert tools should expose shortcuts and command surfaces without hiding primary mouse paths.
- High-craft landing pages usually look clean because assets, type, palette, and section rhythm are constrained together. Motion reveals that system; it does not replace the system.
