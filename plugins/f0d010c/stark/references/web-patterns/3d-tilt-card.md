# Pattern — 3D tilt card

Perspective + rotateX/Y tracks cursor position. Adds depth to hero element / featured card.

**When to deploy**: editorial (interactive product), active-bento (tile interaction), glow+grain (atmospheric depth).

```tsx
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

export function TiltCard({ children, max = 8 }: { children: React.ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sy = useSpring(ry, { stiffness: 150, damping: 18 });

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        rx.set(-y * max);
        ry.set(x * max);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      style={{
        rotateX: sx,
        rotateY: sy,
        transformStyle: "preserve-3d",
        perspective: "1200px",
      }}
    >
      {children}
    </motion.div>
  );
}
```

## Inner depth

Children with `transform: translateZ(60px)` float above card surface — adds dramatic 3D feel.

```tsx
<TiltCard>
  <div className="relative" style={{ transformStyle: "preserve-3d" }}>
    <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-300 to-stone-900" />
    <div style={{ transform: "translateZ(40px)" }} className="absolute top-8 left-8">
      <h3 className="text-3xl font-display">Floats above</h3>
    </div>
  </div>
</TiltCard>
```

## Tradeoffs

- Tilt strength `max` — 4-8 for subtle, 8-15 for dramatic
- Spring stiffness 150-300, damping 18-25 (more damping = settles faster)
- Disable on touch devices (`@media (hover: none) { ... }`)
- Avoid on type-heavy cards (rotation hurts readability)
