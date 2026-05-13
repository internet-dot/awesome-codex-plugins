# Direction — Type-as-Hero

Oversized variable display fonts. Scroll-morphing letterforms. No decorative imagery. Type IS the design. Maximalist typography flex.

## Reference apps

- igloo.inc — Awwwards SOTY 2025 (3D + massive type)
- lehman.berlin — restraint + signature display
- Lando Norris official site (off-brand) — Awwwards SOTY-tier oversized type
- pangrampangram.com — type foundry, type IS the product
- ohnotype.co — display type w/ specimen heroes
- newedge.studio — display-driven brand
- monumentvalleygame.com — game site, type flex
- type.today — type foundry, type-led

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Mega-display | Variable serif (PP Editorial New, GT Sectra, Reckless Neue) OR variable grotesque (Söhne Variable, Bricolage Grotesque) | `clamp(120px, 22vw, 320px)` |
| Headline | Same family, smaller weight | `clamp(48px, 8vw, 128px)` |
| Body | Restrained grotesque (Söhne, Inter Tight) | 14-16px / 1.4 line-height |
| Metadata | Mono | 10-11px / `tracking-[0.32em] uppercase` |

Use variable axes aggressively — `wght`, `opsz`, `wdth`, `grade`, `slnt`.

## Palette

- Two-tone is standard — paper + ink only, type carries everything
- Optional: ONE accent for hover states
- Background gradients OK as atmospheric scaffold (not decoration)

## Layout grid

- Type fills viewport — letterforms become composition
- Mega-letters that crop intentionally at edges
- Asymmetric, type-led layout — body content fits where type allows
- Single hero word can fill entire viewport
- Specimen-style: letter A, letter B, letter C as anchors
- Vertical type acceptable

## Motion language

Heavy hitters in this direction:
- **Page-load curtain reveal** — letterforms emerge from masked layer
- **Scroll-pinned headline morph** — type scales / unscales / rotates as scroll progresses (via GSAP ScrollTrigger or Motion `useTransform`)
- **Variable-axis cursor-Y hover** — headline weight responds to mouse Y position
- **Letter-by-letter stagger** — slow, considered, dramatic
- **3D type extrusion** — perspective depth on letterforms
- **GSAP SplitText** — letter-by-letter or line-by-line entrance
- **Mesh gradient atmospheres** behind type — color picks up through letterforms via `mix-blend-mode: difference` or `screen`

## Copy voice

- Single-word heroes ("RESONANCE", "INDEPENDENT", "FORM")
- Manifestos in fragments
- Pull quotes treated as headlines
- Avoid: descriptive paragraphs (let type carry meaning)

## Sample structure

```
1. Nav (minimal — wordmark + 1-2 links, almost invisible)
2. Hero (mega-type filling viewport, single word OR short phrase)
3. Sub-hero (smaller type explaining, body width tight)
4. Specimen sections — character A, B, C with descriptions
5. Body content (small, restrained, lets specimen breathe)
6. Footer (mega-wordmark closer — full-viewport)
```

## Direction-specific bans

- Decorative imagery (illustrations, photos, icons distracting from type)
- Body text larger than 18px (type IS hero, body is supporting)
- Multiple accents (type carries; color is one tool)
- Heavy decoration (rules, gradients, etc) — type alone
- Centered everything — type-as-hero asymmetric

## Sample tokens

```css
@theme {
  --color-paper: #F1ECE2;
  --color-ink:   #0A0908;

  --font-display: "PP Editorial New", "GT Sectra", "Reckless Neue", serif;
  --font-body:    "Söhne", "Inter Tight", system-ui, sans-serif;
  --font-mono:    "Söhne Mono", "JetBrains Mono", monospace;
}
```

## Variable-axis trick

```css
.headline {
  font-family: var(--font-display);
  font-variation-settings: "wght" 400, "opsz" 72;
  transition: font-variation-settings 600ms cubic-bezier(0.2, 0, 0, 1);
}
.headline:hover {
  font-variation-settings: "wght" 800, "opsz" 144;
}
```
