# Direction — Glow + Grain

Multicolor glowing backdrops with tactile grain. Atmospheric mesh gradients. Dark-mode editorial. Atmosphere-driven, mood over message.

## Reference apps

- stripe.com / stripe.com/sessions — gradient mastery, layered atmospheres
- openai.com — restrained atmospheric dark
- vercel.com hero — animated gradient + grid
- liveblocks.io — Awwwards-tier glow motion
- runwayml.com — generative atmosphere
- midjourney.com (landing) — soft glow, dreamy
- linear.app — restrained glow + craft
- arc.net (browser.company) — color-glow brand

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Display | Söhne / Inter Display / GT America | `clamp(48px, 8vw, 128px)` |
| Headline | Same | `clamp(32px, 5vw, 72px)` |
| Body | Söhne / Inter Tight | 16-17px / 1.55 line-height |
| Mono | JetBrains Mono / Söhne Mono | 11px / mono caps |

Restrained sans-serif — atmosphere carries the mood, type stays clean.

## Palette

- Background: warm-tinted near-black `oklch(0.18 0.02 280)` or `#0A0908`
- Mid: stone-700 / stone-800 grays
- Glow stops: 3-4 colors mixed, each with low alpha
  - Pink-purple `#A78BFA` / `#F472B6`
  - Teal-blue `#22D3EE` / `#3B82F6`
  - Orange-coral `#FB923C` / `#EC4899`
- Foreground text: paper white `#FAF8F3` (not pure white)
- One accent for CTAs

## Layout grid

- Standard 12-col asymmetric, content over atmosphere
- Hero is full-bleed atmospheric backdrop
- Sections layered with subtle gradient transitions
- Cards use `backdrop-filter: blur()` over glow background

## Motion language

- **Page-load curtain** — dark mask peels back, atmosphere reveals
- **Mesh gradient drift** — multi-stop radial gradients animate slowly (10-30s loops)
- **Scroll-driven glow shift** — atmosphere palette evolves down the page (different colors per section)
- **Magnetic CTAs** — atmospheric buttons with glow halo
- **Backdrop-filter scroll** — content blurs when scrolled past hero
- **Subtle particle / dust** — overlay texture for tactile grain

Avoid: too many discrete motion moments, atmosphere should feel continuous.

## Copy voice

- Mood-driven, slightly mysterious or technical
- Fragment headlines acceptable ("Made for the next decade")
- Plain-spoken body, restrained marketing voice
- Avoid: "We're excited to announce", over-explaining

## Sample structure

```
1. Atmospheric nav (transparent, blur-on-scroll)
2. Hero (mesh gradient backdrop + restrained type + single CTA)
3. Feature sections (each with own atmospheric tint shift)
4. Logo cloud / press (dimmed, atmosphere shows through)
5. Manifesto / vision (paragraph-driven, mood-led)
6. Footer (atmosphere fades, restrained type, contact)
```

## Direction-specific bans

- Pure white background (atmosphere needs depth)
- Hard solid color blocks (let gradients flow)
- Too-bright colors (saturation kills atmosphere — use soft, mid-tone glows)
- Stark drop shadows (use halos / glows instead)
- Sharp clashes (this direction is moody, not aggressive)

## Sample tokens

```css
@theme {
  --color-bg:        oklch(0.18 0.02 280);
  --color-bg-2:      oklch(0.22 0.02 280);
  --color-fg:        #FAF8F3;
  --color-fg-2:      #B8B0A4;
  --color-fg-3:      #6E665C;
  --color-accent:    #FB923C;

  --glow-1: #A78BFA; /* purple */
  --glow-2: #22D3EE; /* teal */
  --glow-3: #FB923C; /* orange */

  --font-display: "Söhne", "Inter Display", "GT America", system-ui, sans-serif;
  --font-body:    "Söhne", "Inter Tight", system-ui, sans-serif;
  --font-mono:    "Söhne Mono", "JetBrains Mono", monospace;
}
```

## Mesh gradient scaffold

```jsx
<div className="absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute -top-40 -left-40 w-[60vw] aspect-square rounded-full blur-3xl opacity-40"
    style={{ backgroundImage: `radial-gradient(circle, var(--glow-1) 0%, transparent 65%)` }} />
  <div className="absolute -bottom-40 -right-40 w-[55vw] aspect-square rounded-full blur-3xl opacity-30"
    style={{ backgroundImage: `radial-gradient(circle, var(--glow-2) 0%, transparent 65%)` }} />
  <div className="absolute top-1/3 left-1/3 w-[40vw] aspect-square rounded-full blur-3xl opacity-25"
    style={{ backgroundImage: `radial-gradient(circle, var(--glow-3) 0%, transparent 65%)` }} />
  <div className="noise-overlay" /> {/* svg grain at 4% opacity */}
</div>
```
