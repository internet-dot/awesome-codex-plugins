# Pattern — Page-load curtain

Paper-colored mask slides off, contents reveal beneath. Sets tone before scroll.

**When to deploy**: editorial, type-as-hero, glow+grain. Skip on brutalist (raw start) and industrial-mono (terminal already starts with intent).

```tsx
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export function Curtain() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-paper origin-bottom"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: [0.85, 0, 0.15, 1] }}
        >
          <div className="absolute bottom-8 left-12 flex items-center gap-3">
            <span className="block w-2 h-2 rounded-full bg-oxblood animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.32em] uppercase">Loading</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Variants:
- Slide up (origin-bottom, scaleY: 0)
- Slide down (origin-top)
- Diagonal wipe (clip-path inset)
- Split: two halves slide opposite directions
- Letter mask: viewport-filling letterform that scales out

Pair with Hero `<motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.9}}>` so content fades in as curtain leaves.
