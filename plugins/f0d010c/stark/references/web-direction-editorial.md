# Direction — Editorial Swiss Revival

Reading-room vibe. Considered restraint. Magazine spread digital. Generous whitespace.

## Reference apps (study these)

- rauchg.com — tech blog ceiling, restraint as the work
- are.na — editorial network, monospace metadata, generous whitespace
- robinrendle.com — letterforms, words.are.fluid
- Hayes & Co (`stark/examples/web-resonance-fm`) — our sample
- the-pudding.cool — long-form editorial w/ data
- editorialnew.com (Pangram Pangram) — reference for the typeface itself
- shauninman.com — paragraph-driven blog
- maggieappleton.com — illustration + essay

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Display | Newsreader / PP Editorial New / Tiempos Headline | `clamp(48px, 8.5vw, 144px)` |
| Headline | Newsreader / PP Editorial New | `clamp(36px, 6vw, 96px)` |
| Body | Inter Tight / Söhne / Tiempos Text | 17–18px / line-height 1.55 |
| Mono eyebrow | JetBrains Mono / Söhne Mono | 10px / `tracking-[0.32em] uppercase` |

Italic emphasis within headline: `<em class="italic">word</em>`.

## Palette

- Paper: `#F1ECE2` warm off-white (never pure `#fff`)
- Paper-2 (sections): `#E7E1D4`
- Ink: `#1A1614` warm near-black (never pure `#000`)
- Ink-2 (secondary): `#4A4339`
- Ink-3 (tertiary): `#87796B`
- Rule (hairlines): `#C4BAA8`
- Single accent: oxblood `#6B1F1F` / coral `#C53030` / forest `#2D4A3F`

One accent per project. Rule lines for separators, not borders.

## Layout grid

- 12-col, 8px gutter, asymmetric content
- Hero takes 7-8 cols, supporting meta in 2-3 col left rail
- `§ 01` `§ 02` numbering for sections, sticky in left rail
- Generous section padding (`py-32` to `py-44`)
- Body width: `max-w-[68ch]` for paragraph (60-70 char rule)
- Asymmetric featured grid alternates left/right

## Motion language

Pick 2-4 from these:
- Letter-stagger reveal on hero (spring physics, ~50ms stagger)
- `reveal-on-scroll` fade-up (CSS `animation-timeline: view()`)
- Variable-font weight hover on headlines
- Lenis smooth scroll (subtle, 1.2 duration)
- Sweeping highlight bar on scroll-progress through manifesto text

Avoid: fast snappy timing (use `cubic-bezier(0.2, 0, 0, 1)` 600ms+). Editorial breathes.

## Copy voice

- Short editorial sentences. Plain-spoken. No marketing-speak.
- Manifesto: 2-3 line headline + 1-2 paragraph elaboration
- Italic for emphasis, not bold
- `§ 01 — Manifesto` section markers in mono caps
- Specs as definition lists (`<dt>` / `<dd>`)
- Avoid: "Built for modern teams", "10x faster", "Reimagined", "Powered by AI"

## Sample structure

```
1. Nav (minimal — wordmark + 4 nav items + meta indicator)
2. Hero (large headline + italic emphasis + body paragraph + CTAs + interactive visual)
3. Manifesto (§ 01 — sticky left rail + headline + body + specs)
4. Marquee band (philosophical statements, italic display, slow scroll)
5. References / Featured (§ 02 — alternating asymmetric, watch / product per row)
6. Journal / Archive (§ 03 — dated entries, hover-weight title)
7. Footer (mega-wordmark closer + columns + colophon)
```

## Direction-specific bans

- Bold sans-serif headlines (use serif display)
- Material elevation shadows (use rules + warm paper)
- Centered text columns (use asymmetric grid)
- Snappy motion (slow + spring)
- Pure white / pure black (warm tints)
- Decorative imagery for its own sake (let typography lead)
- "Hero + 3-cols-features + CTA + footer" SaaS skeleton

## Sample tokens (DTCG-ish)

```css
@theme {
  --color-paper:  #F1ECE2;
  --color-paper-2:#E7E1D4;
  --color-ink:    #1A1614;
  --color-ink-2:  #4A4339;
  --color-ink-3:  #87796B;
  --color-rule:   #C4BAA8;
  --color-accent: #6B1F1F;

  --font-display: "Newsreader", "Tiempos Headline", Georgia, serif;
  --font-body:    "Inter Tight", "Söhne", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", "Söhne Mono", ui-monospace, monospace;
}
```
