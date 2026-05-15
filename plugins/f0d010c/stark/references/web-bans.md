# Web — Anti-Slop Ban List (2026)

Reject every item below by default. If the user explicitly requests one, push back once before complying. State why it's banned.

## Color

- `bg-gradient-to-r from-purple-500 to-pink-500` — the most-flagged AI tell. Adam Wathan apologized publicly.
- `from-indigo-500`, `bg-indigo-600`, "trust-blue" accents
- Slate-950 / zinc-950 backgrounds with no warmth/coolness bias (the "dark mode VS Code" look)
- Default shadcn theme untouched (the new Bootstrap)
- Pure `#000` backgrounds (use `oklch(0.18 0.02 280)` or warm-tinted near-black)
- Pure `#fff` backgrounds (use `#fafaf7` warm off-white)
- Confused dark mode: slate-950 + slate-300 text + one indigo accent

## Typography

- Inter (most common AI default)
- Space Grotesk (the second most common)
- Roboto, Arial, system-ui as primary face
- Identical font-weight throughout (use 400/500/600 sparingly, 700/800 for emphasis)
- Default Tailwind type scale untouched (the give-away)

## Layout

- Three feature cards in a row with Lucide icons + "Built for modern teams" copy
- Hero: H1 + sub + indigo primary button + ghost button (the universal SaaS skeleton)
- Hero + 3-column features + CTA strip + footer (the universal SaaS landing)
- Centered everything, no asymmetry
- Identical 80px section padding throughout — kills rhythm
- `rounded-2xl` everywhere uniformly
- Full-width sections with no overlap, no diagonal flow, no grid-breaking
- Bento grid that's static (every tile flat) — 2026 bento is interactive

## Components

- Glassmorphism cards over mesh gradient (without intent)
- Stock "AI sparkle" iconography
- Emoji bullets in feature lists
- Default shadcn `<Card>` with no reskin
- `border border-slate-200` everywhere with no variation
- Tabler / Heroicons as primary icon set with no curation

## Motion

- No motion at all (boring) OR scattered micro-interactions (noisy)
- Default Framer Motion `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` (the universal AI motion)
- Linear / ease-in-out curves on UI (use spring physics or custom cubic-bezier)
- Hover states that just lift+shadow with no surprise

## Stack tells

- Tailwind v3 patterns when v4 is current (use `@theme` not `tailwind.config.js`)
- `bg-white` / `text-black` raw classes everywhere (use semantic tokens)
- `framer-motion` package (the package is now `motion` from motion.dev)
- Hardcoded responsive breakpoints when container queries fit
- `useState` for dark mode when `prefers-color-scheme` + `data-theme` works
- shadcn add-everything install — pick the components actually needed

## Copy patterns

- "Built for modern teams"
- "10x faster"
- "Reimagined" / "Redefining" / "The new way to"
- "Powered by AI" sparkle badge
- "Try free for 14 days" with no other CTA variation

## What to do instead

For every banned pattern, the alternative is in `references/awwwards-ceiling.md` and `references/web-fonts.md`. The default move is: pick a real aesthetic direction first, then let the direction dictate every choice.
