# Direction — Active Bento

Interactive bento tiles, expanding/morphing cards, autoplay video on hover, layered reveal. Not the static 2023 bento. Product-led, feature-driven.

## Reference apps

- linear.app/method — bento tiles that expand on hover
- vercel.com/templates — bento gallery
- arc.net — interactive feature tiles
- raycast.com (extensions section) — bento-style
- notion.com (features) — animated bento
- fly.io (architecture page) — technical bento
- replit.com (homepage) — feature tiles
- supabase.com (features grid) — animated bento

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Display | Söhne / Inter Display / GT America | `clamp(40px, 6vw, 88px)` |
| Tile headline | Same, smaller | 24-32px |
| Body | Söhne / Inter Tight | 14-16px |
| Mono labels | Söhne Mono / JetBrains Mono | 11-12px |

Restrained type — bento tiles ARE the visual content.

## Palette

- Per-tile distinct accents (each tile gets own color identity)
- Background: dark warm `#0A0907` or paper warm
- Tile borders: subtle (`border-white/[0.06]` on dark, `border-stone-200` on light)
- Strong accent per tile (extracted from content)

## Layout grid

- 12-col grid w/ irregular tile spans (tile A: 2x2, tile B: 1x2, tile C: 3x1, etc)
- Featured tile that's 2× others
- Magazine-asymmetric — not uniform 3-up
- `gap-4` to `gap-6` between tiles
- Tiles fill viewport on hover (View Transitions)

## Motion language

- **Layout animation** (Motion `layoutId`) — tile expands smoothly to detail view
- **Hover scale + lift** (`whileHover={{ y: -4, scale: 1.02 }}`)
- **Autoplay video on hover** — tile content morphs when interacted
- **Connected animation** — tile → detail page via shared `layoutId`
- **Scroll-snapping** — vertical bento sections snap-aligned
- **View Transitions** — bento → detail transition

## Copy voice

- Punchy tile titles ("Build faster", "Ship safer", "Scale wider")
- One-line subtitles per tile
- Body content lives in detail view, not tile
- Avoid: full paragraphs in tile (overflow kills hierarchy)

## Sample structure

```
1. Nav (standard, wordmark + nav + CTA)
2. Hero (restrained — tile gallery is the star)
3. Bento grid (8-12 tiles, varying sizes, alternating accents)
4. Tile-detail expansions (layoutId connected)
5. Customer / press logos
6. Footer (compact)
```

## Direction-specific bans

- Static identical 3-up grid (must vary)
- Same accent on every tile (per-tile distinct)
- Long body copy in tiles
- No interaction on tiles (bento must MOVE)
- Cards w/ generic shadow (use tonal elevation or border)

## Sample tile

```jsx
<motion.button
  layoutId={`tile-${id}`}
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  className="relative aspect-square rounded-2xl overflow-hidden p-6"
  style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
>
  <div className="absolute -top-12 -right-16 w-3/5 aspect-square rounded-full blur-2xl opacity-50"
    style={{ backgroundImage: `radial-gradient(circle, white 0%, ${from} 35%, transparent 70%)` }} />
  <div className="relative">
    <span className="font-mono text-[10px] tracking-[0.32em] uppercase opacity-70">{label}</span>
    <h3 className="font-display font-bold text-2xl mt-2">{title}</h3>
  </div>
</motion.button>
```

## Sample tokens

```css
@theme {
  --color-bg:     #0A0907;
  --color-bg-2:   #14130F;
  --color-fg:     #F5F4EE;
  --color-tile-1: #C53030; /* red */
  --color-tile-2: #7C3AED; /* purple */
  --color-tile-3: #0EA5E9; /* cyan */
  --color-tile-4: #10B981; /* green */
  --color-tile-5: #F59E0B; /* amber */
  --color-tile-6: #EC4899; /* pink */

  --font-display: "Söhne", "Inter Display", system-ui, sans-serif;
  --font-body:    "Söhne", "Inter Tight", system-ui, sans-serif;
  --font-mono:    "Söhne Mono", "JetBrains Mono", monospace;
}
```
