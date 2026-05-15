# Web Typography — Curated Pairs (2026)

Use one of these pairs unless the brief demands otherwise. All are battle-tested on 2025–2026 award sites.

## Tier 1: distinctive defaults

| Display | Body | Mono | Vibe | Source |
|---|---|---|---|---|
| PP Editorial New | PP Neue Montreal | PP Neue Montreal Mono | Magazine + grotesque | Pangram Pangram |
| PP Editorial Old | PP Formula | PP Formula Mono | '70s serif + geometric | Pangram Pangram |
| Söhne | Tiempos Text | Söhne Mono | Klim workhorse | Klim Type Foundry |
| Newsreader | JetBrains Mono | JetBrains Mono | Neo-serif + dev mono | Google Fonts + JetBrains |
| GT Sectra | GT America | GT America Mono | Grilli Type | Grilli Type |
| Söhne Mono | Söhne | Söhne Mono | Tech-brand mono-driven | Klim |
| ABC Diatype | ABC Diatype Mono | ABC Diatype Mono | Dinamo, design-tool aesthetic | Dinamo |
| Cabinet Grotesk | Satoshi | JetBrains Mono | Indie Pangram alt | Indie/Fontshare |

## Tier 2: when something specific is needed

| Use case | Font | Why |
|---|---|---|
| Editorial / luxury | New Edge 666, Saol, Apoc Revelations | Strong contrast serif faces |
| Brutalist / utilitarian | Authentic Sans, Neue Haas Grotesk Mono | Raw character |
| Playful / consumer | Migra, Reckless, Paradigm | Bouncy, opinionated |
| Cyber / industrial | NB Akademie, Nuze, FK Grotesk | Sharp angles |
| Editorial / type-as-hero | Migra, Reckless Neue, NaN Holo | Big-set characterful display |
| Variable axis play | Roboto Flex, Inter (axis-flex variant), Satoshi Variable | Allow `font-variation-settings` hover micro-interactions |

## Tier 3: free / Google Fonts only

If the project must use only Google Fonts (no licensed faces):

| Display | Body | Mono |
|---|---|---|
| Bricolage Grotesque | Inter Tight | JetBrains Mono |
| Fraunces (variable) | Inter Tight | JetBrains Mono |
| Instrument Serif | Geist | Geist Mono |
| Newsreader | Geist | Geist Mono |
| Boldonse | Manrope | Geist Mono |

`Geist` (from Vercel) is acceptable; it's not Inter and not Space Grotesk. Use it as a body face, not a display.

## Banned outright

- **Inter** — the most common AI default
- **Space Grotesk** — the second most common
- **Roboto, Arial, system-ui as primary face**
- **Poppins** — overused 2018-2022 default
- Default Tailwind type scale untouched (50/60/72 — pick something else)

## Variable axis tricks

Pair a variable display face with body for hover micro-interactions:

```css
.headline {
  font-family: 'Söhne Variable', sans-serif;
  font-variation-settings: "wght" 400, "opsz" 96;
  transition: font-variation-settings 400ms cubic-bezier(0.2, 0, 0, 1);
}
.headline:hover {
  font-variation-settings: "wght" 700, "opsz" 144;
}
```

This is the kind of detail that distinguishes designed-by-a-person output from generated output. Use it sparingly.

## Self-host in 2026

Use [Fontsource](https://fontsource.org) for Google Fonts and Pangram Pangram licenses for paid faces. Self-hosting is faster than Google Fonts CDN and gives full control over font-display and unicode-range subsetting.

```css
@font-face {
  font-family: 'PP Editorial New';
  src: url('/fonts/PPEditorialNew-Regular.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```
