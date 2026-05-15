# Pattern — Layered parallax

Multiple z-layers scroll at different speeds for depth. Editorial / type-as-hero / glow-grain.

```tsx
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function ParallaxHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Layer speeds
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yFg = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        {/* slowest — atmosphere */}
        <div className="w-full h-full bg-gradient-to-b from-stone-900 to-stone-800" />
      </motion.div>
      <motion.div style={{ y: yMid }} className="absolute inset-0 flex items-center justify-center">
        {/* mid — illustration */}
        <div className="w-96 h-96 rounded-full bg-gradient-to-br from-amber-200 to-stone-700 blur-2xl" />
      </motion.div>
      <motion.div style={{ y: yFg }} className="relative z-10 flex items-center justify-center h-full">
        {/* fastest — type / content */}
        <h1 className="text-6xl font-display">Foreground</h1>
      </motion.div>
    </section>
  );
}
```

## Watch / product layered breakdown

For product hero (e.g. watch), layer:
1. Background atmosphere (slowest)
2. Watch case (slow)
3. Watch dial (medium)
4. Watch hands (faster)
5. Wordmark (fastest, stays foregrounded)

## Native CSS scroll-linked (no JS)

```css
@keyframes parallax-bg {
  from { transform: translateY(0); }
  to { transform: translateY(20vh); }
}
.parallax-bg {
  animation: parallax-bg linear both;
  animation-timeline: scroll();
  animation-range: 0 100vh;
}
```

Modern browsers — no JS needed. Use for simple parallax. Use Motion `useScroll` for orchestrated multi-layer.
