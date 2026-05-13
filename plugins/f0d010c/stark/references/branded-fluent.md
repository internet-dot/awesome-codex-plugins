# Branded Fluent — When and How to Look Original on Windows

The most common failure of Windows-design AI output is shipping apps that look exactly like Settings. Fluent is a *system*, not a *visual style*. You can theme it heavily and still be canonically native.

The opposite failure is going Electron — rejecting the platform. Mica gone, ThemeResource gone, Snap Layouts broken, accessibility broken. Foreign.

This doc covers the middle path: branded Fluent. Apple Music for Windows, Files (community), PowerToys redesign, Notepad rewrite, Microsoft Store, DevHome — all use WinUI 3 + Mica + ThemeResource discipline, but feel like distinct products.

## Decide: branded or system-like?

| Build branded if | Build system-like if |
|---|---|
| Consumer / media / creative app | Productivity / system utility |
| Brand identity is a deliverable | Settings panel, control panel-style tool |
| Marketing site exists | Internal tool |
| Has a name + logo | "Just works" tool |
| User picks vibe | User picks function |

Examples branded: Files, Apple Music for Windows, Spotify (if they used WinUI), a markdown editor, a music player, a photo viewer, a chat client.

Examples system-like: PowerToys (intentionally — its identity *is* "official Microsoft utility"), Snipping Tool, Notepad, Sound Recorder.

## What branding IS allowed within Fluent

### 1. Custom accent color
Override `SystemAccentColor` (or `SystemAccentColorLight*`/`Dark*`) in `App.xaml`. Stake out a brand color. Example: Resonance uses deep red `#C53030`. Cards/buttons/sliders/toggles all pick it up automatically.

```xml
<!-- App.xaml -->
<Application.Resources>
  <ResourceDictionary>
    <ResourceDictionary.ThemeDictionaries>
      <ResourceDictionary x:Key="Default">
        <Color x:Key="SystemAccentColor">#C53030</Color>
        <Color x:Key="SystemAccentColorLight1">#E53E3E</Color>
        <Color x:Key="SystemAccentColorLight2">#FC8181</Color>
        <Color x:Key="SystemAccentColorDark1">#9B2C2C</Color>
        <Color x:Key="SystemAccentColorDark2">#742A2A</Color>
      </ResourceDictionary>
      <ResourceDictionary x:Key="Light">
        <Color x:Key="SystemAccentColor">#C53030</Color>
      </ResourceDictionary>
      <ResourceDictionary x:Key="Dark">
        <Color x:Key="SystemAccentColor">#FC8181</Color>
      </ResourceDictionary>
    </ResourceDictionary.ThemeDictionaries>
  </ResourceDictionary>
</Application.Resources>
```

### 2. Custom display typography (alongside Segoe)
Keep Segoe UI Variable for **system surfaces** (settings rows, dialogs, menus, captions) — those need to feel native. Add a brand display face for **hero content** — page titles, album/article/post hero, marketing surfaces.

```xml
<TextBlock Text="Apricot Princess"
           FontFamily="ms-appx:///Assets/Fonts/Newsreader.ttf#Newsreader"
           FontSize="80"
           FontWeight="SemiBold" />
```

Pairings that work on Windows:
- **Newsreader** (Google Fonts, free) — neo-serif, editorial restraint
- **Bricolage Grotesque** (Google Fonts) — bold display grotesque, distinctive
- **Söhne** (Klim, paid) — gold-standard workhorse
- **PP Editorial New** (Pangram Pangram, paid) — magazine display
- **Inter Display** + Segoe body — modest improvement, common
- **Cascadia Code** — already shipped with Win11; great for monospace hero

Never replace Segoe UI Variable in dialogs/menus/captions/system rows. Brand layer is for **content hero only**.

### 3. Hero atmospheres
Default WinUI Settings = Mica + plain text. Branded apps add a hero atmosphere on the *content* surface (not the chrome):
- Mesh gradient backdrop (full-bleed, large, slow)
- Grain/noise overlay (`Image` of noise.png at 6–10% opacity)
- Glow/light streaks (radial gradients with low opacity)
- Layered material: Mica (window) + custom hero (content) — both can coexist

```xml
<!-- Hero pattern: gradient + grain + content -->
<Grid>
  <!-- Gradient mesh -->
  <Rectangle>
    <Rectangle.Fill>
      <RadialGradientBrush ... />
    </Rectangle.Fill>
  </Rectangle>
  <!-- Grain overlay -->
  <Image Source="/Assets/grain.png" Opacity="0.08" Stretch="UniformToFill" />
  <!-- Hero content -->
  <StackPanel ... />
</Grid>
```

Apple Music for Windows does this brilliantly: full-bleed art-derived gradient under each track's hero, grain overlay, content typography on top.

### 4. Custom card chrome
Default `SettingsCard` is the Settings-app give-away. Replace with custom card style for branded surfaces — keep it for actual settings rows.

```xml
<Style x:Key="BrandedCardStyle" TargetType="Border">
  <Setter Property="Background" Value="{ThemeResource CardBackgroundFillColorDefaultBrush}" />
  <Setter Property="BorderBrush" Value="{ThemeResource CardStrokeColorDefaultBrush}" />
  <Setter Property="BorderThickness" Value="1" />
  <Setter Property="CornerRadius" Value="16" />  <!-- 16, not the standard 4-8 -->
  <Setter Property="Padding" Value="20,16" />
  <!-- Hover: brand-tinted shift, not generic gray -->
</Style>
```

### 5. Custom NavigationView selection indicator
Default rail uses pill-shaped accent indicator. Override:

```xml
<NavigationView.Resources>
  <!-- Override the selection-indicator pill -->
  <SolidColorBrush x:Key="NavigationViewSelectionIndicatorForeground" Color="{StaticResource SystemAccentColor}" />
  <Thickness x:Key="NavigationViewItemBorderThickness">0,0,0,0</Thickness>
  <CornerRadius x:Key="NavigationViewItemCornerRadius">10</CornerRadius>
</NavigationView.Resources>
```

Or replace `NavigationView` with a fully custom rail — Files community does this, gets a distinctive sidebar with playlists/locations/tags layered.

### 6. Custom motion language
Beyond ThemeResource transitions, add:
- **ConnectedAnimationService** for hero transitions (tap album in grid → it grows into NowPlaying hero — canonical Fluent connected animation)
- **Composition API** (`Microsoft.UI.Composition`) for blur, drop-shadow, parallax scroll
- **Implicit animations** on visibility/offset/opacity property changes
- Custom `TransitionCollection` on `Frame` (`SuppressNavigationTransitionInfo` + your own)

### 7. Magazine / asymmetric layouts
Default WinUI = stacked rows / uniform grids. Branded = editorial. Album grid with hero tile + smaller tiles, asymmetric playlist covers, scroll-driven reveal.

Use `ItemsRepeater` with `StackLayout` / `UniformGridLayout` / custom `Layout` subclass. Or absolute `Canvas` for art-direction-style heros.

### 8. Custom illustration / iconography
- **Keep Segoe Fluent Icons** for system idioms (chevrons, settings gear, file glyph) — users know what they mean
- **Add brand iconography** for product surfaces — custom SVGs, illustration, photography
- Don't go FontAwesome / Material — those telegraph "this dev imported web assets"

Apple Music for Windows uses Segoe Fluent for system + bespoke artwork for content.

## Anti-patterns within branded Fluent

- Replacing Segoe UI Variable globally with a custom font (breaks dialog/menu legibility, breaks accessibility)
- Removing ThemeResource brushes (breaks dark/light/HC)
- Custom title bar that breaks Snap Layouts hover
- Glassmorphism cards stacked over Mica (Mica is already a material — adding glass on top muddies)
- Drop shadows for elevation (use tonal elevation; only use shadow for hero modals)
- Removing focus rings (accessibility)
- Hardcoded hex everywhere (breaks dark mode adaptation)
- Replacing system controls with custom-painted ones (breaks accessibility, gestures, IME)

## Branded Fluent reference apps

Study these to see what "native but original" looks like in 2026:

| App | What's branded | What stays native |
|---|---|---|
| **Files (community)** | Custom layout, brand color, custom sidebar, custom thumbnails | Mica, ThemeResource, Snap, accessibility, command bar |
| **Apple Music for Windows** | Hero atmospheres, art-driven gradients, custom typography, custom playback bar | Mica, NavigationView, ThemeResource, dialogs |
| **Spotify (web-wrapper, but architecturally similar)** | Brand green accent, custom sidebar, custom card chrome, image-rich content | (Not native — example of what NOT to do) |
| **PowerToys (Niels Laute redesign)** | Refined hierarchy, brand color subtly | Stays system-like — that's the intentional ID |
| **Notepad (rewrite)** | Minimal restraint, custom AI sidebar | Strict native everywhere else |
| **DevHome** | Dashboard widgets, branded cards | Native chrome |

## Step-by-step: rebrand a Settings clone

1. Pick a brand color (warm/cool, saturated, distinct from system blue). Override `SystemAccentColor`.
2. Pick a display font for hero content. Embed in `Assets/Fonts/`. Use ONLY for page titles + heroes.
3. Replace the default top-of-page "title + caption" pattern with a hero atmosphere (gradient + grain + bigger custom-font title).
4. Replace `SettingsCard` chrome on **non-settings** pages — only keep it on actual Settings.
5. Add a brand logo in the title bar (custom path, custom icon, or wordmark).
6. Customize NavigationView selection indicator (corner radius, color, hover effect).
7. Add at least one ConnectedAnimation between two pages.
8. Verify in dark mode, high contrast, and Narrator. None of the above should break those.

## When to stop branding

If your "branded" app stops feeling like it belongs on Windows, you've gone too far. Test:
- Title bar still respects Snap Layouts hover?
- Dark mode toggles correctly?
- High contrast still legible?
- Right-click context menus still native?
- Keyboard navigation works?
- Narrator reads the surface correctly?

If any "no", pull branding back until they're "yes".
