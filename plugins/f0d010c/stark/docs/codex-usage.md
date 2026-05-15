# Codex Usage

`stark` is a Codex plugin made of skills.
Use natural-language requests instead of slash commands.

## Main Entry

Ask for the UI or UX you want:

```text
Design a landing page for a type foundry that does not look like generic SaaS.
Make a Win11 settings app with NavigationView and Mica.
Create an iOS 26 Liquid Glass settings screen.
Build a Compose Material 3 Expressive workout tracker.
Improve the checkout UX and define empty/loading/error/success states.
```

If the platform is unclear, `design-router` asks one question and then routes to the right skill.

## Command Mapping

| Old Claude command | Codex request |
|---|---|
| `/stark ux <brief>` | `Use stark ux-design for <brief>` |
| `/stark web <brief>` | `Use stark web-design for <brief>` |
| `/stark windows <brief>` | `Use stark windows-design for <brief>` |
| `/stark apple <brief>` | `Use stark apple-design for <brief>` |
| `/stark android <brief>` | `Use stark android-design for <brief>` |
| `/stark auto <brief>` | Ask normally and let `design-router` route |
| `/stark-audit <path>` | `Audit <path> with stark for UX problems and AI design slop` |
| `/stark-translate apple windows <path>` | `Translate this Apple UI to Windows using stark` |

## Expected Flow

Most skills ask one upfront question before code:

- UX asks for the product job and user mode when unclear.
- UX produces a compact decision brief before platform implementation.
- UX can load contextual briefs for agent runs, operational dashboards, onboarding, checkout, and editor/canvas products.
- UI produces a compact visual decision brief before code.
- Web asks for an aesthetic direction.
- Windows asks for a track: system WinUI, branded WinUI, Tauri, or Electron.
- Apple asks for a track: SwiftUI, branded SwiftUI, React Native, Flutter, or desktop shell.
- Android asks for a track: Compose, branded Compose, React Native, Flutter, or Compose Multiplatform.

This is intentional.
The plugin is designed to avoid silent defaults.

## Static Checks

```bash
npx agent-skillforge lint . --format text
npx agent-skillforge smoke .
```
