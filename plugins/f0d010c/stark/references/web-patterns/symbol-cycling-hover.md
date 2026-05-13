# Pattern — Symbol / glyph cycling on hover

Text cycles through related glyphs/symbols on hover. Editorial micro-detail.

**When to deploy**: editorial (numerals), type-as-hero (specimen), industrial-mono (glyph play).

```tsx
import { useState } from "react";

const cycleChars = "01234567ABCDEFGHIJKL";

export function GlyphCycle({ value }: { value: string }) {
  const [out, setOut] = useState(value);
  const [hovering, setHovering] = useState(false);

  const onEnter = () => {
    setHovering(true);
    let i = 0;
    const t = setInterval(() => {
      setOut(value.split("").map((c, idx) => {
        if (idx < i) return value[idx]; // settled
        return cycleChars[Math.floor(Math.random() * cycleChars.length)];
      }).join(""));
      if (i++ > value.length) {
        clearInterval(t);
        setOut(value);
      }
    }, 60);
  };
  const onLeave = () => { setHovering(false); setOut(value); };

  return (
    <span onPointerEnter={onEnter} onPointerLeave={onLeave} className="font-mono">
      {out}
    </span>
  );
}
```

Use on metadata: reference numbers (`HC.001.W`), dates, version strings. Adds satisfying micro-interaction.

## Variant — vertical glyph rotate

```tsx
<motion.span
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
>
  {char}
</motion.span>
```

Each char on hover does its own y reveal — cinematic for hero numbers.
