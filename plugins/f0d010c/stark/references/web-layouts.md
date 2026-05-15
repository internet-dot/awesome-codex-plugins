# Web Layout Pattern Catalog

When to use which layout. Pair with direction picked.

## 1. Hero + Rail (editorial standard)

```
┌─────────────────────────────────────────────┐
│ NAV                                          │
├──────┬──────────────────────────────────────┤
│      │                                      │
│ § 01 │  Hero text (8 cols)                  │
│ Meta │  Subtitle                            │
│ rail │  CTAs                                │
│ (2)  │                                      │
│      │                                      │
└──────┴──────────────────────────────────────┘
```

Sticky `§ 01` rail on left. Content takes 8-10 cols. Best for editorial, manifesto pages.

## 2. Manifesto + Specs

Two-column body. Long-form text on left (7 cols), spec list on right (5 cols).

```
┌──────────────────────────┬──────────────────┐
│ Long-form prose          │ Production: 27/yr│
│ paragraph paragraph      │ Atelier: CH      │
│ paragraph paragraph      │ Founded: 2019    │
│ paragraph                │ Calibers: HC.7…  │
└──────────────────────────┴──────────────────┘
```

## 3. Featured asymmetric (alternating sides)

```
┌─────────┬───────────────────────────────────┐
│ Image 1 │ Title 1, copy, specs              │
└─────────┴───────────────────────────────────┘
┌───────────────────────────────────┬─────────┐
│ Title 2, copy, specs              │ Image 2 │
└───────────────────────────────────┴─────────┘
┌─────────┬───────────────────────────────────┐
│ Image 3 │ Title 3, copy, specs              │
└─────────┴───────────────────────────────────┘
```

Alternating L/R sides break the SaaS template. 5/7 col split.

## 4. Bento gallery (active)

```
┌──────────────┬────────┬────────┐
│              │  Tile  │  Tile  │
│  Big tile    ├────────┴────────┤
│   (2x2)      │   Tile (2x1)   │
├────────┬─────┴────────────────┤
│ Tile   │       Tile (3x1)     │
└────────┴────────────────────────┘
```

Irregular tile spans. Featured tile 2× others.

## 5. Magazine spread

Multi-column body w/ large display headline at top. Drop caps. Hanging punctuation.

## 6. Type-as-Hero (single mega-word)

```
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
│         RESONANCE                            │
│                                              │
│                                              │
│  Small body text below                       │
└─────────────────────────────────────────────┘
```

Single word fills viewport. All other content scaled smaller.

## 7. Marquee divider

Full-width text band between sections. Slow horizontal scroll. Editorial transition.

## 8. Index / Archive list

```
─────────────────────────────────────────────
Mar 14 2026 | Title of entry          | Read →
─────────────────────────────────────────────
Feb 02 2026 | Title of entry          | Read →
─────────────────────────────────────────────
```

Date | Title | Action. Hover-weight title transition.

## 9. Footer mega-wordmark

```
─────────────────────────────────────────────
                                              
   HAYES & Co.                                
                                              
   Independent watchmaker.                    
                                              
─────────────────────────────────────────────
© 2026 · Made to outlast us · All rights reserved
```

Mega wordmark fills viewport width. Lusion / Studio Freight signature closer.

## 10. Pinned scroll-tied section

Pin viewport, content advances frame-by-frame as scroll progresses. See `web-patterns/scroll-pinned-section.md`.

## 11. Product proof workbench

Hero or first app section centered on a believable product surface: annotated UI preview, command palette, timeline replay, inspector pane, or trust matrix. Use for developer tools, AI products, security products, and workflow automation.

Keep the product proof inspectable: real labels, stateful rows, visible errors, permissions, or run steps. Avoid dark blurred screenshots and generic dashboards.

## 12. Docs + console split

Docs or API reference layout with a stable left nav, readable content column, sticky right rail, and an optional live console/code sample pane. Use for SDKs, CLIs, plugin docs, and platform products.

On mobile, collapse nav to a sheet and keep code samples copyable without horizontal layout breakage.

## 13. Trust and permissions surface

Matrix, comparison, or settings layout that makes risk legible: actor, scope, action, approval state, audit trail, and recovery path. Use for auth, admin, enterprise, marketplace, and plugin-install flows.

Prefer dense but calm tables over decorative cards. Show empty, warning, denied, inherited, and pending states.

## 14. Interactive comparison

Before/after slider, pricing comparison table, or state gallery that helps users compare tradeoffs directly. Use when the decision is not obvious from prose alone.

Keep comparison axes stable. Do not move labels, totals, or primary actions between states.

## Avoid these layouts

- Hero + 3-column features + CTA + footer (universal SaaS)
- Centered-everything (max-w-3xl mx-auto)
- Equal-span uniform grids
- Sidebar nav on marketing site (use top nav unless app)
- Sticky table-of-contents (unless docs)
- Marketing pages pretending to be apps without product proof

## Composition rules

- Vary section padding intentionally — `py-32`, `py-44`, `py-56` mix
- Break out of constraint mid-page (one section full-bleed, others contained)
- Mix wide and narrow content (one section `max-w-prose`, next `max-w-7xl`)
- Asymmetric wins over symmetric — center is the AI-slop default
