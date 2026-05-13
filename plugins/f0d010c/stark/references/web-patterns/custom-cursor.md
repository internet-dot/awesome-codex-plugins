# Pattern — Custom cursor

Branded dot follows pointer, scales + labels on hoverable elements ("VIEW", "READ", "PLAY"). Studio-grade detail.

**When to deploy**: editorial (refined), type-as-hero (cinematic), glow+grain (atmospheric), active-bento (interaction-led). Skip on brutalist (raw) and mobile (no hover).

```tsx
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function Cursor() {
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 35 });
  const sy = useSpring(y, { stiffness: 500, damping: 35 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const lbl = t.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (lbl) { setLabel(lbl); scale.set(3); }
      else { setLabel(null); scale.set(1); }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, [x, y, scale]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-paper flex items-center justify-center"
        style={{ scale }}
      >
        {label && (
          <span className="font-mono text-[8px] tracking-[0.32em] uppercase text-ink whitespace-nowrap">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
```

Apply on hoverable elements: `<a data-cursor="VIEW" href="...">`.

Hide native cursor: `body { cursor: none }` (offer toggle for accessibility).
