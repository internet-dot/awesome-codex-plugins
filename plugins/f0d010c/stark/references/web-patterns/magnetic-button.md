# Pattern — Magnetic button

Button attracts cursor within radius. Micro-luxury detail.

**When to deploy**: editorial, glow+grain, type-as-hero. Use sparingly — 1-2 magnetic CTAs per page. More feels gimmicky.

```tsx
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const handleMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const radius = 80;
    if (dist < radius) {
      x.set(dx * 0.3);
      y.set(dy * 0.3);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className="px-6 py-3 rounded-full bg-ink text-paper text-[13px] tracking-wide hover:bg-oxblood transition-colors"
    >
      {children}
    </motion.button>
  );
}
```

Tweak `radius` (60-100px), `0.3` strength (0.15-0.4). Inner content can also magnetize independently (multiplied + smaller strength).
