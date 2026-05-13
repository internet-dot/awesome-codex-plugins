---
description: Generate or improve UI/UX for the specified platform - ux, web, windows, apple, android, or cross-platform. Routes to matching skill which then asks the user which product flow, track, or aesthetic direction before generating code.
argument-hint: "[platform] <description>"
---

# /stark

Legacy Claude Code command.
In Codex, use natural language instead:

> Use stark ux-design to improve the onboarding flow.
> Use stark web-design for a developer-tool landing page.
> Use stark windows-design for a WinUI music app.

Generate or improve UI/UX for the platform specified by `$1` and the description in the rest of the arguments.

`$1` must be one of: `ux`, `web`, `windows`, `apple`, `ios`, `macos`, `android`, `cross-platform`, or `auto` (let the router pick).

Then read the matching SKILL.md from `skills/`:

- `ux` -> `skills/ux-design/SKILL.md` - maps product flow, states, IA, forms, onboarding, dashboards, and repeated-use ergonomics
- `web` -> `skills/web-design/SKILL.md` - asks aesthetic direction + stack first
- `windows` -> `skills/windows-design/SKILL.md` - asks track first (system / branded / Tauri / Electron)
- `apple` / `ios` / `macos` -> `skills/apple-design/SKILL.md` - asks track first (SwiftUI / RN / Flutter / Tauri / Electron)
- `android` -> `skills/android-design/SKILL.md` - asks track first (Compose / RN / Flutter / CMP)
- `cross-platform` -> `skills/cross-platform-design/SKILL.md`
- `auto` -> `skills/design-router/SKILL.md`

Follow that SKILL.md's full process. Do not skip the upfront decisions. Ask product job, track, or direction before any code when unclear. If UX applies, produce the UX decision brief first and preserve it through platform implementation. For build/redesign work, also produce the UI decision brief from `references/ui-patterns/ui-decision-brief.md`. If assets matter, read `commands/stark-assets.md` and produce an asset plan. If shipped references matter, read `commands/stark-reference.md` and produce a reference extraction brief. State the chosen route at the top of the response. Then implement.

If the user did not specify enough context (audience, tone, constraints), ask one clarifying question before generating. Do not assume defaults silently.
