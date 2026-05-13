# Asset selection

Use this after the UI decision brief and before implementation when a design needs icons, screenshots, product previews, references, typography, textures, diagrams, or generated imagery.

## Principle

Assets are design evidence, not decoration. Each asset should help the user understand the product, trust the interface, or complete the job.

## Ask before pulling

- Do we need icons?
- Do we need real product screenshots?
- Do we need reference UI patterns?
- Do we need typography?
- Do we need brand assets?
- Do we need generated bitmap visuals because the agent stack supports image generation?

If the answer is no, do not add the asset category.

## Asset plan

```md
Asset plan
- Needed assets: product UI mock, icons, texture, typeface
- Source: local Stark library, lucide, generated CSS/SVG mock, imagegen, external reference
- License risk: none / low / needs attribution / avoid
- Usage: hero product preview, warning states, workflow diagram
- Reference extraction: structure only, not copied visuals
- Bans: stock hero photos, random blobs, placeholder images
```

## Source choices

| Need | Prefer | Avoid |
|---|---|---|
| Icons | platform icons, lucide, existing app icon set | mismatched icon packs, handmade generic SVG icons |
| Product proof | real app screenshots with permission, generated UI mock, code-rendered preview | placeholder images, blurred stock mockups |
| Fictional hero imagery | imagegen when available, custom CSS/SVG, product UI composition | random stock photos, abstract AI blobs |
| Typography | curated font pair, platform type, installed project fonts | default Inter/system-only unless native platform calls for it |
| UX references | proven flow screenshots or product references used as structure | copying exact visual style or brand assets |
| Texture/material | local generated texture, CSS noise/grid/material | decorative orbs, irrelevant atmospheric backgrounds |

## Image generation

When the user is using GPT/Codex and image generation is available, Stark may recommend generated bitmap assets for:

- editorial hero imagery
- product concept scenes
- empty-state illustrations
- brand campaign visuals
- texture/material studies
- realistic product/device mockups

Generated images must still fit the product job. Do not use imagegen to hide weak layout, missing state design, or generic copy. Prefer generated images when they add specific context that CSS/SVG would not communicate well.

## Real-world UI references

For flows such as onboarding, settings, permissions, checkout, dashboards, empty states, and mobile navigation, inspect 3-5 proven references when available. Read `reference-analysis.md` and extract:

- information architecture
- hierarchy
- state coverage
- interaction pattern
- density and progressive disclosure
- recovery path

Do not copy:

- brand identity
- exact layout
- proprietary screenshots
- paid/reference-library assets into public output

The rule is: extract structure, not visuals.

## Security and privacy

- Never include private/local screenshots unless the user explicitly allows it.
- No copyrighted brand assets in public output.
- No random stock filler when the product needs inspectable proof.
- Store source and attribution when using external assets.
- Prefer generated CSS/SVG/product mockups for fictional products.
- Reject assets that do not support the product job.
