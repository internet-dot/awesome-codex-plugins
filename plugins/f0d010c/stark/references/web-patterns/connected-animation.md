# Pattern — Connected / shared element animation

Hero element morphs from gallery tile to detail page. Native `View Transitions API` or Motion `layoutId`.

**When to deploy**: active-bento (essential), editorial (gallery → detail), type-as-hero (specimen click).

## Motion `layoutId`

```tsx
import { motion, AnimatePresence } from "motion/react";

function Gallery({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map((item) => (
        <motion.div
          key={item.id}
          layoutId={`tile-${item.id}`}
          onClick={() => onPick(item.id)}
          className="aspect-square rounded-xl bg-stone-200 cursor-pointer"
        >
          <motion.h3 layoutId={`title-${item.id}`}>{item.title}</motion.h3>
        </motion.div>
      ))}
    </div>
  );
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const item = items.find((i) => i.id === id)!;
  return (
    <motion.div
      layoutId={`tile-${id}`}
      onClick={onClose}
      className="fixed inset-8 rounded-3xl bg-stone-200"
    >
      <motion.h1 layoutId={`title-${id}`}>{item.title}</motion.h1>
    </motion.div>
  );
}

// Wrap with <AnimatePresence>
<AnimatePresence>
  {selected ? <Detail id={selected} onClose={() => setSelected(null)} /> : null}
</AnimatePresence>
```

Same `layoutId` on tile and detail = Motion interpolates position, size, transforms automatically.

## View Transitions (route-based)

```css
.tile-cover {
  view-transition-name: cover;
}
```

When you click + navigate, browser shares element automatically (must have unique `view-transition-name`).

## Tradeoffs

| | Motion `layoutId` | View Transitions API |
|---|---|---|
| In-page modal-like | ✅ | Need route |
| Route-based | ❌ | ✅ |
| Spring physics | ✅ | ❌ (CSS animation only) |
| Customization | Full | CSS-only |
| Browser support | All | Chrome/Edge/Safari 18.2+ |
| Performance | JS layout | Native compositor |

For SPAs with route changes — View Transitions. For in-page detail expansions — Motion `layoutId`.
