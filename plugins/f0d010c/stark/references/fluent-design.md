# Fluent Design 2 — Reference (Windows 11/12, May 2026)

## Stack

- **Windows App SDK 1.8** (stable, serviced through Mar 2026)
- **WinUI 3** (decoupled from OS release)
- **Windows App SDK 2.0** in preview, targeting .NET 10
- **Native AOT** in preview

Sources:
- https://learn.microsoft.com/windows/apps/winui/winui3
- https://github.com/microsoft/WindowsAppSDK
- https://github.com/microsoft/microsoft-ui-xaml
- https://fluent2.microsoft.design

## Materials

### Mica
- Opaque, desktop-tinted backdrop
- Apply to **long-lived windows** (top-level)
- API: `<Window><Window.SystemBackdrop><MicaBackdrop/></Window.SystemBackdrop></Window>` or `Window.SystemBackdrop = new MicaBackdrop()`
- Variants: `Mica` (default) and `Mica Alt` (stronger desktop tint, for tabbed apps like Terminal/Edge/Files)

### Acrylic
- Translucent blur
- Apply ONLY to **transient surfaces**: flyouts, command bars, menus, tooltips
- Never on long-lived window backgrounds — use Mica there
- API: `<MenuFlyout><MenuFlyout.SystemBackdrop><DesktopAcrylicBackdrop/></MenuFlyout.SystemBackdrop></MenuFlyout>`

### Tonal elevation (replaces drop shadows)
- Surfaces gain prominence by shifting background brush, not adding shadow
- Use `LayerFillColorDefaultBrush`, `LayerOnAcrylicFillColorDefaultBrush`, `CardBackgroundFillColorDefaultBrush`
- All `ThemeResource` — automatic dark/light/high-contrast handling

### Reveal
- **Deprecated** in Win11 styling
- Do not generate `RevealBackgroundBrush` or `RevealBorderBrush` in new code

## Spacing & sizing

- Base grid: **4 epx**
- Common increments: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Window corner radius: **8 epx**
- Control corner radius: **4 epx**
- Tight grid corner radius: **0 epx**
- Icon grid: 48×48 with 2px exterior radius, 1px interior

## Typography

- **Segoe UI Variable** (only correct face for new code)
- Variable axes: `wght` 100–700, optical-size axis (auto-adjusts to size)
- Never `Segoe UI` plain — that's the legacy face

Type ramp (in epx):
- Caption: 12 / 16 line height, weight 400
- Body: 14 / 20, weight 400
- Body Strong: 14 / 20, weight 600
- Body Large: 18 / 24, weight 400
- Subtitle: 20 / 28, weight 600
- Title: 28 / 36, weight 600
- Title Large: 40 / 52, weight 600
- Display: 68 / 92, weight 600

## Iconography

- **Segoe Fluent Icons** font (1 epx monoline stroke)
- Sizes: 16, 20, 24, 32, 40, 48, 64
- Cheatsheet: https://learn.microsoft.com/windows/apps/design/iconography/segoe-fluent-icons-font
- Never FontAwesome / Material Symbols / Lucide on Windows native

## Title bar

Every Win11 app **must** extend the client area:

```csharp
// In App.xaml.cs or window code-behind
m_window.ExtendsContentIntoTitleBar = true;
m_window.SetTitleBar(AppTitleBar);

// AppTitleBar should respect:
// - Caption buttons (min/max/close at right)
// - Snap Layouts hover (Win11: hover-on-maximize triggers snap groups)
// - Drag region for moving the window
```

Use `AppWindow.TitleBar` API for color customization. Never hand-roll caption buttons.

## Canonical components

| Need | Use |
|---|---|
| Top-level navigation | `NavigationView` (Left, LeftCompact, Top modes) |
| Settings rows | `SettingsCard`, `SettingsExpander` (CommunityToolkit.WinUI.Controls.SettingsControls) |
| Inline alert | `InfoBar` (Severity: Informational/Success/Warning/Error) |
| Coachmark | `TeachingTip` |
| Disclosure | `Expander` |
| Path / breadcrumb | `BreadcrumbBar` |
| Segmented toggle | `SelectorBar` (NEVER iOS-style sliding pill) |
| Picker | `DatePicker`, `TimePicker`, `PickerFlyout` |
| Command surface | `CommandBar`, `CommandBarFlyout` |

Refer to **WinUI Gallery** for canonical control usage: https://github.com/microsoft/WinUI-Gallery — when generating, mirror its patterns exactly.

## Architecture defaults

- **CommunityToolkit.Mvvm** with `[ObservableProperty]`, `[RelayCommand]` source generators
- DI via `Microsoft.Extensions.Hosting`
- Settings persistence via `Windows.Storage.ApplicationData.Current.LocalSettings` or community Settings library
- Localization via `.resw` resource files

## Win11/12 system integrations

- **Snap Layouts** (Win11): hover on maximize button triggers; preserve via correct title bar implementation
- **Dynamic Lighting** (Win11 23H2+): `LampArray` API for RGB peripherals
- **Widgets** (Win11): `WidgetProvider` interface + `Widget` JSON schema
- **File Explorer context menu** (Win11): `IExplorerCommand` COM interface (sparse-package model in 11+)
- **Windows Hello / Passkeys**: `Microsoft.Web.WebAuthN` and platform credential APIs

## Tokens

- Token pipeline (W3C DTCG format): https://github.com/microsoft/fluentui-token-pipeline
- Reference token JSON shipped at `assets/tokens/fluent-2.json`

## Win design downloads

- Fluent 2 site: https://fluent2.microsoft.design
- Win design downloads (Figma, icons, Segoe): https://learn.microsoft.com/windows/apps/design/downloads
- Win11 Figma: https://www.figma.com/community/file/836828295772957889
