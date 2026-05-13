# Liquid Glass — Apple's Unified Material (May 2026)

Apple's design language since WWDC 2025. Unified across iOS 26, iPadOS 26, macOS 26 (Tahoe), watchOS 26, tvOS 26, visionOS 26.

## Concept

A digital meta-material that:
- **Refracts** underlying content (lensing effect)
- Adapts **multi-layer tint, shadow, dynamic-range** based on what's beneath
- Adapts **size-aware** — small surfaces get tighter blur, large surfaces get softer

Lineage: Aqua (1999) → iOS 7 blurs (2013) → Dynamic Island (2022) → visionOS materials (2023) → Liquid Glass (2025).

## Adoption checklist

For an app to adopt Liquid Glass on iOS 26+:

- [ ] **Build with Xcode 26 / Swift 6.2 / iOS 26 SDK**
- [ ] Toolbars use the system `.toolbar { ... }` modifier (auto-lifts to glass)
- [ ] Tab bars use `TabView` (not custom) — gain glass automatically
- [ ] Navigation uses `NavigationStack` / `NavigationSplitView`
- [ ] Buttons that should glass adopt `.buttonStyle(.glass)`
- [ ] Custom surfaces apply `.glassEffect()` modifier
- [ ] Multi-glass layouts wrap in `GlassEffectContainer` to coordinate refraction
- [ ] Scroll edges use `.scrollEdgeEffectStyle(.soft)` instead of hard chrome
- [ ] App icon rebuilt in **Icon Composer** (WWDC25 session 361) for Liquid Glass treatment
- [ ] Search bar uses `.searchable` (morphs into glass pill)

## API surfaces

```swift
// Single glass surface
Rectangle()
    .glassEffect()

// Coordinated glass (avoids overlapping refraction artifacts)
GlassEffectContainer {
    HStack {
        Capsule().glassEffect()
        Capsule().glassEffect()
    }
}

// Glass button
Button("Sign In") { /* ... */ }
    .buttonStyle(.glass)

// Toolbar auto-glass
.toolbar {
    ToolbarItem(placement: .primaryAction) {
        Button("Save") { /* ... */ }
    }
}
// → toolbar lifts to Liquid Glass automatically on iOS 26+

// Soft scroll edge instead of hard chrome
ScrollView { /* ... */ }
    .scrollEdgeEffectStyle(.soft)

// Glass-morphing search
.searchable(text: $query)
// → on iOS 26, search field morphs into a Liquid Glass pill when active
```

## When NOT to apply glass

- On surfaces that should feel solid/grounded (e.g. error states, destructive confirmations)
- When the underlying content is already busy — glass refraction will compound noise
- On macOS sidebars (use `.background(.regularMaterial)` and `NSVisualEffectView` `.sidebar` instead)
- On surfaces smaller than ~44pt — glass needs space to breathe

## Cross-platform adoption status (May 2026)

| Stack | Liquid Glass support |
|---|---|
| **SwiftUI / UIKit native** | Full automatic adoption |
| **React Native** | Partial — `expo-glass-effect` and a few native modules expose `.glassEffect()`. Toolbar/tab integration weaker. |
| **Flutter Cupertino** | None — Flutter paints with Skia; can fake blur but not Liquid Glass refraction |
| **.NET MAUI iOS** | None |
| **React Native New Architecture + Fabric** | Better than old arch but still partial |

If the user wants Liquid Glass and is asking about non-Swift: route to SwiftUI or warn explicitly that fidelity will be reduced.

## Materials hierarchy on Apple (still relevant alongside Glass)

For non-Liquid-Glass surfaces — still use materials:

```swift
.background(.ultraThinMaterial)    // most see-through
.background(.thinMaterial)
.background(.regularMaterial)      // default sidebar / toolbar
.background(.thickMaterial)
.background(.ultraThickMaterial)   // most opaque
```

On macOS, drop into `NSVisualEffectView` for specific contexts: `.sidebar`, `.headerView`, `.hudWindow`, `.underWindowBackground`, `.contentBackground`, `.titlebar`, `.menu`, `.popover`, `.windowBackground`.

## Sources

- WWDC 25 session 219: https://developer.apple.com/videos/play/wwdc2025/219/
- Adopting Liquid Glass: https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- HIG materials: https://developer.apple.com/design/human-interface-guidelines/materials
