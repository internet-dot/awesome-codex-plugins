# stark — Core Philosophy

This document is loaded by SKILL.md files when a generation needs grounding. Read it when the user asks "why do you keep saying X" or when a generation feels generic.

## Thesis

Most AI-generated UI looks the same because LLMs converge on the math-average of design. The math-average is purple, indigo, Inter, Tailwind, shadcn, three-card grid, hero-with-two-buttons. It is technically correct and aesthetically dead.

This skill exists to refuse the average.

## Three principles

### 1. Idiom over pixel

A Settings screen is not a Settings screen. On iOS it is a grouped Form with switch toggles inside Liquid Glass Sections. On Android it is a `LargeTopAppBar` over a `LazyColumn`. On Windows it is a `NavigationView` with `SettingsCard` rows over Mica. On the web it is whatever the brand demands.

Same product. Different pixels. The idiom is what makes a Mac app feel Mac and an Android app feel Android. Cloning iOS onto Android is the most common cross-platform failure mode and it's why Flutter apps always feel slightly wrong.

### 2. Commit to a direction, then execute it precisely

Maximalist works. Minimalist works. Refined editorial works. Tactile brutalism works. The middle does not work.

The middle is what AI generates by default — a soft consensus of trends with no point of view. Refuse it. Pick one direction, state it explicitly at the top of the response, then execute every detail through that lens.

If the brief says "playful," do not deliver "professional with a hint of warmth." Deliver playful. If it says "luxury minimal," do not add a single decorative flourish. Restraint is the work.

### 3. Currency matters

Material 3 from 2023 is not Material 3 Expressive from 2025. iOS 17 Materials are not Liquid Glass. Tailwind v3 patterns are not Tailwind v4. WinUI 2 is not WinUI 3 + WinAppSDK 1.8. Framer Motion is the legacy brand; the package is now `motion` from motion.dev.

Generated UI from training data drift quietly toward the median version of each technology. Override that. State the version explicitly. Use the new APIs. The user did not install this skill to ship a 2023 app in 2026.

## What "AI slop" actually means in 2026

The 2024 critique was about purple gradients and Inter. The 2026 critique is broader. Designers spot AI output by:

- **Rhythm dies** — every section has identical `py-20` padding. Real design varies rhythm intentionally.
- **No risk** — every choice is the safe one. No type that surprises. No layout that breaks.
- **Component-shopping** — feels assembled from shadcn/ui defaults rather than designed
- **Confused dark mode** — slate-950 backgrounds with slate-300 text and one indigo accent (the "VS Code-as-product" aesthetic)
- **Centered everything** — no asymmetry, no diagonal, no overlap
- **Glass without intent** — glassmorphism applied because it's a vibe, not because it serves the content
- **Hero + 3-column features + CTA + footer** — the universal SaaS landing skeleton

Output that avoids all of these will already place above 95% of AI-generated UI. The remaining 5% comes from picking a real direction and committing.

## On platform-native vs cross-platform

Cross-platform is a delivery strategy, not an aesthetic. A great product team picks one canonical platform, designs the product idiomatically for that platform, then translates to others — adjusting navigation, materials, motion, typography, and chrome to fit each host.

A bad product team picks Flutter, designs once, and ships a Material-on-iOS hybrid that feels foreign on every platform.

Idiom-design defaults to single-platform per skill, with an explicit `cross-platform-design` skill for the translation layer. This is the opposite of what v0/Lovable/Bolt/Subframe do. They all default to "web everywhere." This is wrong on Apple, wrong on Windows, wrong on Android. Defaulting to native is the wedge.

## On taste

Taste is not a magic property. Taste is reading the references — Awwwards SOTY 2025, Microsoft Fluent 2, Apple HIG, Material 3 Expressive — and absorbing the patterns until they become defaults. Every platform has a canonical reading list. Every reading list is finite. Read it.

If a generation feels off, the fix is almost always: go look at how Things 3, Linear, Files, or Pixel Camera solve the same surface. Then do that.

## Self-check before shipping

Before delivering any generation, ask:
1. Did I pick a real direction and commit to it?
2. Does this fit alongside the platform's reference apps?
3. Did I avoid every item on the platform's ban list?
4. Is the typography distinctive (not Inter / Space Grotesk / system-ui)?
5. Does the motion feel intentional, not added?
6. If cross-platform: did I translate idiom, not pixels?

If any answer is no, restart the choice that failed. Do not ship near-misses.
