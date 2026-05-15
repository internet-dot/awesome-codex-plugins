# Apple HIG — Quick Reference (May 2026)

Source of truth: https://developer.apple.com/design/human-interface-guidelines

This file extracts the rules that most affect generated UI. Read for grounding when output feels "non-Apple."

## Foundations

### Layout
- Base grid: **8 pt**, half-step **4 pt**
- Never use 10/15/20 spacing magic numbers — they break the system
- Use `.padding()` defaults — they encode the system grid
- Wrap every screen with safe area handling: `.safeAreaInset(edge:)` for content bars

### Typography
- Default face: **SF Pro** (Display + Text variants), **SF Pro Rounded**, **SF Mono**, **New York** (serif)
- Use `Font.TextStyle`, never hard-coded points:
  - `.largeTitle` (34pt)
  - `.title` (28pt)
  - `.title2` (22pt)
  - `.title3` (20pt)
  - `.headline` (17pt semibold)
  - `.body` (17pt)
  - `.callout` (16pt)
  - `.subheadline` (15pt)
  - `.footnote` (13pt)
  - `.caption` (12pt)
  - `.caption2` (11pt)
- **Dynamic Type**: support `xSmall` → `AX5`. Test at AX5. If layout breaks, redesign.

### Color
- **Use system semantic colors**, not raw hex:
  - `.primary` (label)
  - `.secondary`
  - `.tint` (app accent)
  - `Color(.systemBackground)`, `.systemGray`, `.systemGray2`...`.systemGray6`
  - `Color(.systemRed)`, `.systemBlue`, etc.
- These adapt automatically to light/dark and accessibility contrast settings.
- For brand color: define a single `accentColor` in the asset catalog, reference via `.tint(.accentColor)`.

### SF Symbols 7
- ~6,900 glyphs, 9 weights × 3 scales
- New in SF Symbols 7: Draw On/Off, Variable Draw, gradients, enhanced Magic Replace
- Use `Image(systemName: "...")`, never custom icon files when an SF Symbol exists
- Symbol effects: `.symbolEffect(.bounce)`, `.pulse`, `.variableColor`, `.replace.byLayer`, `.appear`, `.disappear`

### Materials
- `.regularMaterial` — default toolbar/sidebar
- `.ultraThinMaterial`, `.thinMaterial`, `.thickMaterial`, `.ultraThickMaterial`
- On iOS 26+, add Liquid Glass via `.glassEffect()` (see `liquid-glass.md`)

### Motion
- **Spring physics only** for UI motion
- `.animation(.spring(response:dampingFraction:), value:)`
- Never linear / easeIn / easeOut on UI surfaces
- Respect `@Environment(\.accessibilityReduceMotion)` — disable non-essential motion

### Accessibility (mandatory)
- `.accessibilityLabel("...")`, `.accessibilityHint("...")`, `.accessibilityValue("...")`
- `.accessibilityElement(children: .combine)` to group
- Traits: `.isButton`, `.isHeader`, `.isImage`, `.isLink`, `.isSelected`, `.updatesFrequently`
- VoiceOver test pass mandatory
- Support **Dynamic Type AX5**, **Reduce Motion**, **Increase Contrast**, **Reduce Transparency**

## Patterns

### Navigation
- **Hierarchy**: `NavigationStack { ... }` (push-pop)
- **Tabs**: `TabView { ... }` (5 max on iOS, 7 on iPad/Mac)
- **Split**: `NavigationSplitView { sidebar } content: { ... } detail: { ... }` for iPad/Mac
- **Inspector** (Mac/iPad): `.inspector { ... }` trailing pane
- **Modal**: `.sheet(isPresented:)` with `.presentationDetents([.medium, .large])`
- **Popover** (iPad/Mac): `.popover(isPresented:)`
- **Menu Bar Extra** (Mac): `MenuBarExtra("Name", systemImage: ...) { ... }`
- **Settings scene** (Mac): `Settings { TabView { ... } }`

### Lists & Forms
- `List { ... }` with `.listStyle(.insetGrouped)` for grouped (iOS Settings pattern)
- `Form { Section("Header") { ... } }` for settings/forms
- `Toggle("Label", isOn: $value)` — never custom switches
- `Picker(...)` for selection — system handles iOS wheel, Mac dropdown automatically

### Search
- `.searchable(text: $query, prompt: "...")` — morphs into Liquid Glass pill on iOS 26
- `.searchSuggestions { ... }` for autocomplete

## Inputs

- `TextField`, `SecureField`, `TextEditor` — wrap in `.textFieldStyle(.roundedBorder)` only outside Form
- Inside Form, default style is correct
- `.keyboardType(.emailAddress)`, `.textContentType(.emailAddress)`, `.autocapitalization(.never)`
- `.submitLabel(.search)` for keyboard return-key customization

## macOS specifics

- Window styles via `.windowStyle(.titleBar)`, `.hiddenTitleBar`, `.plain`
- Toolbar customization: `.toolbar { ToolbarItem(placement: .primaryAction) { ... } }`
- Sidebar: list with `.listStyle(.sidebar)` inside `NavigationSplitView`
- Inspector pane: `.inspector { ... }` (Craft, Notes, Reminders pattern)
- Drop into AppKit only for: `NSTextView` rich text, Quick Look extensions, `NSToolbar` items, `NSOpenPanel` extensions

## Reference apps to emulate

| App | What it nails |
|---|---|
| Things 3 | Typography restraint, magic-plus, perfect Dynamic Type |
| Reeder Classic / 5 | NavigationSplitView on iPad/Mac |
| Ivory | HIG-correct + bespoke; haptic + symbolEffect |
| Mela | Text-first, native share sheets |
| Craft | Multi-pane Mac, inspector, vibrancy |
| NetNewsWire | Open-source HIG textbook |
| Soulver 3 | Mac typography + sidebar |
| CARROT Weather | System materials + variable color symbols |
| Overcast | Type hierarchy, Dynamic Type, accessibility |
| Fantastical | Sidebar + inspector + menu-bar mode |

## Tokens & assets

- iOS 26 Figma kit: https://www.figma.com/community/file/1527721578857867021/ios-and-ipados-26
- macOS 26 Figma kit: https://www.figma.com/community/file/1543337041090580818/apple-design-resources-macos-26
- SF Symbols 7 app: https://developer.apple.com/sf-symbols
- Apple Design Resources: https://developer.apple.com/design/resources
- HIG: https://developer.apple.com/design/human-interface-guidelines

Token JSON: `assets/tokens/apple-system.json`
