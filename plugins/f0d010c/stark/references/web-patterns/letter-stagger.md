# Pattern — Letter / word stagger reveal

Hero text drops in word-by-word or letter-by-letter w/ spring physics. Default page-load motion.

**When to deploy**: editorial, type-as-hero, glow+grain. Skip on brutalist (instant render).

## Word-stagger (Motion)

```tsx
import { motion } from "motion/react";

export function StaggerHeadline({ lines }: { lines: string[] }) {
  return (
    <h1 className="font-display font-medium text-ink leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(48px, 8.5vw, 144px)" }}>
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden">
          {line.split(" ").map((word, wi, arr) => (
            <motion.span
              key={`${li}-${wi}`}
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 130,
                damping: 20,
                delay: 0.1 + li * 0.18 + wi * 0.04,
              }}
              style={{ marginRight: wi < arr.length - 1 ? "0.25em" : 0 }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}
```

Key: parent `block overflow-hidden` clips letterforms during reveal — Awwwards-tier detail.

## Letter-stagger (heavy)

```tsx
{word.split("").map((char, ci) => (
  <motion.span
    key={ci}
    initial={{ y: "100%", opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: ci * 0.02 + wi * 0.05, type: "spring", stiffness: 200, damping: 22 }}
    style={{ display: "inline-block" }}
  >
    {char}
  </motion.span>
))}
```

Letter-stagger only on short hero (5-10 chars). Word-stagger for longer.

## GSAP SplitText (commercial-grade)

```tsx
import gsap from "gsap";
import { SplitText } from "gsap/SplitText"; // free since Webflow acquisition
gsap.registerPlugin(SplitText);

useEffect(() => {
  const split = new SplitText(".headline", { type: "lines, words" });
  gsap.from(split.words, {
    y: 100, opacity: 0,
    stagger: 0.04, duration: 0.8,
    ease: "power3.out",
  });
}, []);
```

Use SplitText for: balanced lines, kerning preservation, RTL, complex stacking.
