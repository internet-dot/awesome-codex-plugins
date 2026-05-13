# Direction — Tactile Brutalism

Visible grids. Harsh type. Color clashes. Raw seams. Mono-driven. Anti-polish, intentional friction. "Human-made" reaction signal.

## Reference apps

- werkstatt.fyi — brutalist editorial
- fram.io — DIY/tape aesthetic
- off-brand.work — design studio brutalism
- dinamo.us — type foundry brutalist
- pentagram.com (selected projects) — restrained brutalism
- read.cv (early versions) — terminal-meets-resume
- ableton.com (loop sections) — Swiss brutalism

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Display | Söhne Mono / Neue Haas Grotesk Mono / Authentic Sans | `clamp(40px, 7vw, 96px)` UPPERCASE |
| Headline | Neue Haas Grotesk Display / Authentic Sans | `clamp(28px, 4vw, 56px)` |
| Body | Neue Haas Grotesk Text / Söhne | 16px / 1.45 line-height |
| Mono | Söhne Mono / JetBrains Mono | 13px |

Heavy weights (700-900). Tight tracking on display (`-0.04em`). All-caps acceptable.

## Palette

- Paper: `#F0F0EB` warm off-white OR pure `#000` (brutalist allows pure black)
- Ink: `#000` — pure black
- Accent 1 (hi-vis): `#FF3B00` orange OR `#FFE600` hi-vis yellow
- Accent 2 (clash): `#0066FF` industrial blue OR `#22FF00` digital green
- Mid: `#888` only

Color clashes intentional. Pair `#FF3B00` w/ `#0066FF` for full brutalist signal.

## Layout grid

- Strict 8px grid, **visible** (background grid lines acceptable)
- Sharp corners (`border-radius: 0`) everywhere
- Thick borders (`2px-4px solid #000`)
- Block-level layout, no float / no flex magic
- Negative margins acceptable (overlap intentional)
- Skewed/rotated elements OK if grid still readable

## Motion language

- Snappy timing `cubic-bezier(0.85, 0, 0.15, 1)` 200ms — NO soft springs
- Mechanical, not organic
- Cursor-following SNAP to grid (not magnetic-soft)
- Scroll-snap sections
- `mix-blend-mode: difference` highlights
- No page-load curtain (instant render, raw start)

Avoid: spring physics, slow easings, smooth scroll (Lenis), parallax (too soft).

## Copy voice

- Direct, blunt, declarative
- All-caps for headlines acceptable
- Numbered lists, log entries
- Short sentences. Period.
- Avoid: friendly tone, marketing softeners ("we believe", "we craft")

## Sample structure

```
1. Raw nav (no border, no chrome — just text links + grid lines)
2. Hero (massive uppercase mono display + thick rule + log-style metadata)
3. Index / contents — list of sections with monospace dot leaders
4. Selected work (numbered, dense grid, no padding)
5. Process (numbered steps, mono, no animation)
6. Contact (block of text, no form polish)
7. Colophon (specs of the page itself — fonts, build, year)
```

## Direction-specific bans

- Soft drop shadows (use thick borders)
- Rounded corners
- Spring/easeInOut motion
- Lenis smooth scroll (use raw native scroll)
- Glassmorphism / backdrop-filter
- Gradient backgrounds (solid color blocks only)
- Soft serif body text (mono / heavy grotesque only)
- Pastel palettes

## Sample tokens

```css
@theme {
  --color-paper:    #F0F0EB;
  --color-ink:      #000;
  --color-rule:     #000;
  --color-accent:   #FF3B00;
  --color-accent-2: #FFE600;

  --font-display: "Söhne Mono", "Neue Haas Grotesk Mono", monospace;
  --font-body:    "Neue Haas Grotesk Text", "Söhne", system-ui, sans-serif;
  --font-mono:    "Söhne Mono", "JetBrains Mono", monospace;
}
```
