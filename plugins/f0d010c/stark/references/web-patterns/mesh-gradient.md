# Pattern — Mesh gradient atmosphere

Multi-stop SVG/CSS radial gradients layered. Creates atmospheric backdrop.

**When to deploy**: glow+grain (signature), type-as-hero (atmospheric), editorial (subtle), active-bento (per tile).

## Pure CSS (3-glow stack)

```tsx
<div className="absolute inset-0 -z-10 overflow-hidden">
  <div
    className="absolute -top-40 -left-40 w-[60vw] aspect-square rounded-full blur-3xl opacity-40"
    style={{ backgroundImage: "radial-gradient(circle, #A78BFA 0%, transparent 65%)" }}
  />
  <div
    className="absolute -bottom-40 -right-40 w-[55vw] aspect-square rounded-full blur-3xl opacity-30"
    style={{ backgroundImage: "radial-gradient(circle, #22D3EE 0%, transparent 65%)" }}
  />
  <div
    className="absolute top-1/3 left-1/3 w-[40vw] aspect-square rounded-full blur-3xl opacity-25"
    style={{ backgroundImage: "radial-gradient(circle, #FB923C 0%, transparent 65%)" }}
  />
  <div className="noise-overlay" />
</div>
```

## Animated drift (Motion)

```tsx
<motion.div
  animate={{ x: [0, 100, 0], y: [0, -60, 0] }}
  transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
  className="absolute -top-40 -left-40 w-[60vw] aspect-square rounded-full blur-3xl opacity-40"
  style={{ backgroundImage: "radial-gradient(circle, #A78BFA 0%, transparent 65%)" }}
/>
```

## SVG mesh (more control)

```tsx
<svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g1" cx="20%" cy="20%" r="50%">
      <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.45" />
      <stop offset="100%" stopColor="transparent" />
    </radialGradient>
    <radialGradient id="g2" cx="80%" cy="80%" r="60%">
      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
      <stop offset="100%" stopColor="transparent" />
    </radialGradient>
  </defs>
  <rect width="1000" height="600" fill="url(#g1)" />
  <rect width="1000" height="600" fill="url(#g2)" />
</svg>
```

## Track-extracted accent

For media app (album → page atmosphere derived from cover):

```tsx
<div
  className="absolute inset-0 -z-10"
  style={{
    backgroundImage: `radial-gradient(circle at 30% 20%, ${track.from}40 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, ${track.to}40 0%, transparent 65%)`,
  }}
/>
```

## Don'ts

- Avoid bright saturated colors (atmosphere needs softness — use `opacity-30` to `opacity-50` + `blur-3xl`)
- Don't stack 5+ glows (3-4 max — more = muddy)
- Don't animate too fast (slow drift 20-40s, not 5s pulse)
