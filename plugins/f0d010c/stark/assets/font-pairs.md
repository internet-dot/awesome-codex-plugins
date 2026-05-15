# Font Pairings — Quick Reference

## Web (paid licenses)

| # | Display | Body | Mono | Source |
|---|---|---|---|---|
| 1 | PP Editorial New | PP Neue Montreal | PP Neue Montreal Mono | Pangram Pangram |
| 2 | PP Editorial Old | PP Formula | PP Formula Mono | Pangram Pangram |
| 3 | Söhne | Tiempos Text | Söhne Mono | Klim |
| 4 | GT Sectra | GT America | GT America Mono | Grilli Type |
| 5 | ABC Diatype | ABC Diatype | ABC Diatype Mono | Dinamo |
| 6 | New Edge 666 | Söhne | Söhne Mono | Newglyph + Klim |
| 7 | Reckless Neue | Söhne | Söhne Mono | Displaay + Klim |
| 8 | Authentic Sans | Authentic Sans | Authentic Mono | abcdinamo |

## Web (free / Google Fonts)

| # | Display | Body | Mono |
|---|---|---|---|
| 1 | Bricolage Grotesque | Inter Tight | JetBrains Mono |
| 2 | Fraunces (variable) | Inter Tight | JetBrains Mono |
| 3 | Instrument Serif | Geist | Geist Mono |
| 4 | Newsreader | Geist | Geist Mono |
| 5 | Boldonse | Manrope | Geist Mono |

## Apple (system)

| Surface | Font |
|---|---|
| Default UI | SF Pro (Display + Text auto-switch) |
| Rounded contexts | SF Pro Rounded |
| Code / monospace | SF Mono |
| Editorial / serif | New York |

Never SF Pro replaced by web fonts. Use `.font(.body)` etc., not `.font(.system(size: 17))`.

## Windows (system)

| Surface | Font |
|---|---|
| All UI | Segoe UI Variable (axes: wght 100–700, opsz) |
| Code | Cascadia Mono / Cascadia Code |
| Iconography | Segoe Fluent Icons |

Never Segoe UI plain — that's the legacy face.

## Android (system + brand)

| Surface | Font |
|---|---|
| Default body | Roboto Flex (variable) |
| Brand display | Per-app — but stay within M3E weight/size scale |
| Code | Roboto Mono / JetBrains Mono |
| Iconography | Material Symbols (variable axes: wght/fill/grade/opsz) |

## Banned across all platforms

- Inter (most common AI default)
- Space Grotesk (second most common)
- Roboto on iOS (use SF Pro)
- SF Pro on Android (use Roboto Flex)
- Segoe UI on web (it's Windows system; web has no equivalent reason to use it)
- Default Tailwind font stack untouched
- FontAwesome on Apple (use SF Symbols)
- FontAwesome on Android (use Material Symbols)
- FontAwesome on Windows (use Segoe Fluent Icons)
