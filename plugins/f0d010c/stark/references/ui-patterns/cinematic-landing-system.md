# Cinematic landing system

Use this for landing pages that should feel like a polished campaign, launch page, editorial brand page, or high-craft interactive site.

Do not use this as the default for dashboards, docs, checkout, forms, admin tools, or repeated-use product surfaces.

## Surface modes

Choose one mode before designing:

| Mode | Use for | Page behavior |
|---|---|---|
| Campaign page | brand/product launch, event, food, fashion, culture, music, games | key art first, strong atmosphere, simple story, memorable motion |
| Editorial scroll story | museum, science, report, case study, manifesto | large type, measured sections, scroll-choreographed narrative |
| Product proof page | developer tools, security, AI, workflow products | product/key visual plus proof panels, fewer decorative scenes |
| Immersive brand page | luxury, hospitality, entertainment, studio, portfolio | material language, large imagery, signature transitions |

If the page is mostly conversion or product education, use product proof. If the page is mostly mood and desire, use campaign or immersive brand.

## Key art versus page design

Do not confuse a strong hero visual with a finished page.

First define the key art:

- Subject: the product, object, character, artifact, specimen, machine, place, or visual metaphor.
- Material: glass, paper, metal, liquid, fabric, grain, light, shadow, scan, map, device, botanical, orbital, etc.
- Framing: centered object, oversized crop, diagonal object, floating plate, full-bleed scene, split text/object.
- Depth: foreground, midground, background, atmospheric layer.
- Reuse: how the same visual language returns later without repeating the hero.

Then define the page system:

- Grid: centered, asymmetric, hero+rail, editorial spread, pinned stage, gallery, index.
- Section rhythm: which sections are full-bleed, contained, narrow, split, or pinned.
- Typography: one headline system, one body system, one metadata system.
- Motion language: reveal, scrub, mask, parallax, carousel, route transition, or none.
- Restraint: one primary visual metaphor and one primary accent family.

## Campaign page anatomy

Use this sequence unless the user gives a stronger structure:

1. Hero/key art: one oversized title or short phrase, one dominant visual, minimal supporting copy, one action or scroll cue.
2. Context/menu/index: introduce the world, collection, or offer with simple scannable content.
3. Proof or craft: explain why the object/service is special through process, detail, material, data, or artifact.
4. Collection/variations: carousel, gallery, cards, index list, or comparison with real names and attributes.
5. Human/trust/place: origin, makers, operators, customers, venue, map, schedule, or credibility.
6. Final brand close: large wordmark, repeated key art element, or simple CTA.

Avoid stacking unrelated feature sections. Campaign pages should feel composed, not assembled.

## Typography discipline

Premium campaign pages usually use fewer type decisions:

- One display face with a distinctive shape.
- One clean body face.
- One small metadata/caption treatment.
- Giant hero text must be manually line-broken.
- Do not let huge text clip accidentally on mobile.
- Use 2-3 headline sizes across the whole page, not a new size per section.
- Body copy should be short and purposeful.

Good campaign copy is concrete: object names, materials, times, places, process details, sensory detail, risk, or transformation.

Weak campaign copy is generic: "crafted for modern teams", "unlock your potential", "seamless experience", "powered by AI".

## Section rhythm

Use a deliberate rhythm instead of equal sections:

| Section | Typical rhythm |
|---|---|
| Hero | full viewport, dominant title/visual |
| Context | shorter, text/list based |
| Craft/proof | full viewport or pinned |
| Collection | medium/tall, interactive or gallery |
| Trust/place | quieter, grounded |
| Final CTA | large, simple, memorable |

Vary section height, width, and density. Avoid identical blocks from top to bottom.

## Art direction constraints

Before coding, state:

```md
Art direction
- Visual metaphor:
- Key art:
- Material language:
- Typography system:
- Palette:
- Motion language:
- Repeated motif:
- Bans:
```

Rules:

- One visual metaphor is enough.
- One material language is enough.
- One accent family is enough.
- Reuse motifs instead of inventing new decoration every section.
- If using images, they should look art-directed, not like random stock.
- If no real images are available, generate/code one strong visual system rather than many weak placeholders.

## Motion choreography

Cinematic pages may use expressive motion, but each motion needs a role:

- Title reveal: introduces voice.
- Parallax: creates depth around key art.
- Pinned section: explains a transformation or sequence.
- Mask reveal: turns one image/state into another.
- Carousel: lets the user explore a collection.
- Scroll-synced video: shows process over time.

Use 2-4 signature moments total. If every section has its own unrelated trick, the page feels noisy.

## Reference extraction

When using a high-craft reference site, extract:

- first viewport composition
- key art framing
- type scale and line breaks
- section sequence
- asset reuse
- motion pacing
- mobile simplification

Do not copy subject, exact layout, assets, copy, brand colors, or distinctive trade dress.

## Common failure modes

- Cool hero visual, weak rest of page.
- Each section has a different visual idea.
- Typography is large but not composed.
- Text clips on mobile.
- GSAP is used for movement but not storytelling.
- Generated assets are atmospheric but not tied to the subject.
- Page feels like a dashboard wearing a marketing skin.
- Page has no final memorable close.
