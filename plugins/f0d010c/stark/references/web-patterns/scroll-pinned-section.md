# Pattern — Scroll-pinned section

Pin viewport, content advances frame-by-frame as scroll progresses. Signature horology / process / feature moment.

**When to deploy**: editorial (manifesto reveal), type-as-hero (headline morph), industrial-mono (process steps), active-bento (feature tour). 1 per page max.

## Motion (motion.dev) approach

```tsx
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function PinnedExplosion() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // 4-step assembly: each piece appears at progress 0.25, 0.5, 0.75, 1
  const piece1 = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const piece2 = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const piece3 = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const piece4 = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);

  return (
    <section ref={ref} className="relative h-[400vh]"> {/* tall = scroll budget */}
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="relative w-[480px] h-[480px]">
          <motion.div style={{ opacity: piece1 }} className="...">{/* base */}</motion.div>
          <motion.div style={{ opacity: piece2 }} className="...">{/* gear set */}</motion.div>
          <motion.div style={{ opacity: piece3 }} className="...">{/* hands */}</motion.div>
          <motion.div style={{ opacity: piece4 }} className="...">{/* case */}</motion.div>
        </div>
      </div>
    </section>
  );
}
```

## GSAP ScrollTrigger alternative (more complex sequences)

```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function GsapPinned() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=2000",
          scrub: 1,
          pin: true,
        },
      });
      tl.from(".piece-1", { opacity: 0, y: 100 })
        .from(".piece-2", { opacity: 0, y: 100 }, "+=0.5")
        .from(".piece-3", { opacity: 0, scale: 0.5 }, "+=0.5");
    }, ref);
    return () => ctx.revert();
  }, []);
  return <div ref={ref}>{/* pieces */}</div>;
}
```

Tradeoffs:
- **Motion (motion.dev)** — simpler, React-idiomatic. Best for 2-4 stage reveals.
- **GSAP ScrollTrigger** — best for complex sequences (5+ stages), morph paths, character splitting.
