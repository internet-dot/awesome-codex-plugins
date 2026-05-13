---
description: Translate a UI from one platform's idiom to another's — same product, different idiom — respecting target platform's HIG/Material/Fluent rather than pixel-cloning. e.g., "translate this iOS Settings screen to Windows".
argument-hint: "[from-platform] [to-platform] <file or description>"
---

# /stark-translate

Legacy Claude Code command.
In Codex, ask:

> Translate this Apple UI to Windows using stark.

Translate UI from `$1` (source platform) to `$2` (target platform), preserving product semantics but using the target platform's idiom.

Source/target must each be one of: `web`, `windows`, `apple`, `android`.

## Process

1. **Read the source** — file content or description from `$ARGUMENTS` after the platform args.

2. **Identify the product semantics** — what is this UI doing? Settings? List-detail? Onboarding? Tab nav? Modal flow?

3. **Translate idiom, not pixels**. Reference the translation rules in `skills/cross-platform-design/SKILL.md` step 3.

   Example: an iOS grouped Form with switch toggles becomes:
   - On Windows → `NavigationView` + scrollable stack of `SettingsCard` over Mica
   - On Android → `LargeTopAppBar` + `LazyColumn` with `ListItem` rows + M3 switches
   - On web → asymmetric layout with sidebar nav and editorial section headers

4. **Apply target platform's anti-slop ban list** as you generate. Read the target's SKILL.md step 6.

5. **State the translation choices** at the top of the response in 2–3 lines:
   - "iOS grouped Form → Windows NavigationView + SettingsCard stack with Mica backdrop"
   - "iOS Toggle → WinUI ToggleSwitch with ThemeResource brushes"
   - "iOS section headers → Windows muted text headers, no row separators"

6. **Implement** working code in the target stack.

Refuse to pixel-clone. If the user insists on identical pixels across platforms, push back once with the rationale: every platform has reference apps that nail their idiom; users notice when a Mac app feels Android.
