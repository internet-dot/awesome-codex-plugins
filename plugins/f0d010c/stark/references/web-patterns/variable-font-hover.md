# Pattern — Variable-font axis hover

`font-variation-settings` shifts on hover (or scroll, or cursor position). Awwwards-tier detail.

**When to deploy**: editorial (subtle), type-as-hero (signature), industrial-mono (axis play). Pair with variable font that supports axes.

## Axes by font

| Font | Axes |
|---|---|
| Newsreader | wght 200-800, opsz 6-72 |
| Inter | wght, slnt |
| Roboto Flex | wght, wdth, opsz, GRAD, slnt, XOPQ, XTRA, YOPQ, YTLC, YTUC, YTAS, YTDE, YTFI |
| Söhne Variable | wght 100-900, opsz |
| Bricolage Grotesque | wdth 75-100, wght 200-800, opsz 12-96 |

## CSS hover

```css
.headline {
  font-family: "Newsreader", serif;
  font-variation-settings: "wght" 400, "opsz" 96;
  transition: font-variation-settings 600ms cubic-bezier(0.2, 0, 0, 1);
}
.headline:hover {
  font-variation-settings: "wght" 800, "opsz" 144;
}
```

## Cursor-Y axis (advanced)

Map mouse Y position to weight:

```tsx
import { useEffect, useState } from "react";

export function CursorAxisHeadline({ children }: { children: React.ReactNode }) {
  const [wght, setWght] = useState(400);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const v = (e.clientY / window.innerHeight) * 600 + 200; // 200-800
      setWght(Math.round(v));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <h1
      style={{ fontVariationSettings: `"wght" ${wght}, "opsz" 96` }}
      className="font-display transition-[font-variation-settings] duration-100"
    >
      {children}
    </h1>
  );
}
```

## Scroll-driven axis

```tsx
const { scrollYProgress } = useScroll();
const wght = useTransform(scrollYProgress, [0, 1], [400, 800]);

<motion.h1
  style={{ fontVariationSettings: useTransform(wght, (w) => `"wght" ${w}`) }}
>
  {children}
</motion.h1>
```

## Caveat

- Variable axes only work if font file supports them — check via Wakamai Fondue (https://wakamaifondue.com)
- Test in Safari (slowest var-axis rendering)
- Don't transition `font-variation-settings` more than 200ms on body text — hurts readability
