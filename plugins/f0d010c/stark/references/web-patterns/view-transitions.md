# Pattern — View Transitions API

Native browser API for SPA route transitions + shared element animations. Replaces FLIP / many JS animation patterns.

**Browser**: Chrome, Edge, Safari 18.2+, Firefox 142+. Wide support 2026.

## Basic route transition

```tsx
const navigate = (href: string) => {
  if (!document.startViewTransition) {
    location.href = href;
    return;
  }
  document.startViewTransition(() => {
    history.pushState({}, "", href);
    // trigger React state update or routing
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
};
```

## Customize transition

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 600ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

@keyframes slide-from-right {
  from { transform: translateX(100%); }
}
::view-transition-new(root) {
  animation-name: slide-from-right;
}
::view-transition-old(root) {
  animation-name: slide-from-right;
  animation-direction: reverse;
}
```

## Shared element transition

Mark elements w/ unique `view-transition-name`:

```css
.album-cover {
  view-transition-name: album-cover;
}
```

When you click a list tile + navigate to detail page where same element exists with same `view-transition-name`, browser interpolates between them. Hero animation for free.

## Next 15 integration

```tsx
"use client";
import { unstable_ViewTransition as ViewTransition } from "react";

<ViewTransition>
  <div>your route content</div>
</ViewTransition>
```

Or use `next/transition` (Next 15.2+):

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/detail", { scroll: false });
// View Transition fires automatically on route change
```

## Tradeoffs

- **Pros**: native, declarative, zero-JS for the animation, shared-element automatic
- **Cons**: limited customization beyond CSS, no spring physics (use Motion for those)
- **Use for**: route changes, list-to-detail, tab switches
- **Don't use for**: continuous interactions (hover, drag, scroll-tied) — use Motion instead
