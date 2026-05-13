# Material 3 Expressive — Reference (May 2026)

Launched at Google I/O 2025. Default for Pixel 10 / Android 16 QPR1. Generated UI must adopt M3 Expressive — **not** baseline M3 from 2023.

## What changed vs baseline M3 (2023)

| Surface | Baseline M3 (2023) | M3 Expressive (2025+) |
|---|---|---|
| Motion | Easing curves (`FastOutSlowIn`) | Spring physics (`MotionScheme.expressive()`) |
| Shapes | 5 fixed corner radii | 35 morphable shapes (squircle, pill, cookie, clover, etc.) |
| Typography | Roboto Flex baseline ramp | Emphasized scale — bigger, heavier display |
| Buttons | One size | Small / Default / Large / Extra-large |
| Loading | Linear / circular indicators | Wavy progress (variable amplitude), contained loading indicator (cycles M3E shapes) |
| Floating actions | Standard FAB | Floating toolbar, FAB menu, button group, split button |
| Elevation | Tonal + drop shadow | **Tonal only** (drop shadow on M3E surfaces is wrong) |

## Compose adoption

```kotlin
// Gradle (BOM 2026.04.01)
implementation(platform("androidx.compose:compose-bom:2026.04.01"))
implementation("androidx.compose.material3:material3:1.4.0")

// For shape-morphing chips:
implementation("androidx.compose.material3:material3:1.5.0-alpha18")
```

### Spring physics

```kotlin
val motion = MotionScheme.expressive()

// On any animation:
animateFloatAsState(
    targetValue = if (selected) 1f else 0f,
    animationSpec = motion.fastSpatialSpec()
)
```

Spec variants: `defaultSpatialSpec`, `fastSpatialSpec`, `slowSpatialSpec`, `defaultEffectsSpec` (for color/alpha), `fastEffectsSpec`, `slowEffectsSpec`.

### Shape morphing

```kotlin
import androidx.compose.material3.MaterialShapes

// Available shapes (35 in M3E):
MaterialShapes.Cookie4Sided
MaterialShapes.Cookie6Sided
MaterialShapes.Cookie7Sided
MaterialShapes.Cookie9Sided
MaterialShapes.Cookie12Sided
MaterialShapes.Pill
MaterialShapes.Pixel
MaterialShapes.Boom
MaterialShapes.Bun
MaterialShapes.Burst
MaterialShapes.Clamshell
MaterialShapes.Clover4Leaf
MaterialShapes.Clover8Leaf
// ... and more

// Apply:
Surface(shape = MaterialShapes.Cookie6Sided.toShape()) { ... }

// Morph between shapes:
val morph = remember { Morph(MaterialShapes.Pill, MaterialShapes.Cookie6Sided) }
val progress = animateFloatAsState(if (pressed) 1f else 0f)
Box(modifier = Modifier.clip(morph.toPath(progress.value).asAndroidPath().toComposeShape()))
```

### Wavy progress

```kotlin
LinearWavyProgressIndicator(
    progress = { 0.7f },
    amplitude = WavyProgressIndicatorDefaults.indicatorAmplitude
)

CircularWavyProgressIndicator(
    progress = { 0.4f }
)
```

### Floating toolbar

```kotlin
HorizontalFloatingToolbar(
    expanded = true,
    leadingContent = { /* ... */ },
    trailingContent = { /* ... */ },
    content = {
        IconButton(onClick = {}) { Icon(Icons.Default.Edit, null) }
        IconButton(onClick = {}) { Icon(Icons.Default.Share, null) }
    }
)
```

### Button sizes

```kotlin
Button(onClick = {}, contentPadding = ButtonDefaults.SmallContentPadding) { ... }
Button(onClick = {}) { ... }   // default
Button(onClick = {}, contentPadding = ButtonDefaults.LargeContentPadding) { ... }
Button(onClick = {}, contentPadding = ButtonDefaults.ExtraLargeContentPadding) { ... }

// Or use new component:
SplitButton(
    onClick = {},
    onMenuClick = {},
    label = "Save",
    menuContent = { /* ... */ }
)
```

## Dynamic color (Material You)

```kotlin
val colorScheme = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    if (darkTheme) dynamicDarkColorScheme(LocalContext.current)
    else dynamicLightColorScheme(LocalContext.current)
} else {
    if (darkTheme) darkColorScheme() else lightColorScheme()
}

MaterialTheme(colorScheme = colorScheme, content = content)
```

## Adaptive layouts (mandatory on tablets/foldables)

```kotlin
val adaptiveInfo = currentWindowAdaptiveInfo()

NavigationSuiteScaffold(
    navigationSuiteItems = {
        items.forEach { item ->
            item(
                selected = item == selected,
                onClick = { /* ... */ },
                icon = { Icon(item.icon, null) },
                label = { Text(item.label) }
            )
        }
    }
) {
    // content — auto-adapts: NavigationBar (Compact), NavigationRail (Medium), NavigationDrawer (Expanded)
}
```

For list/detail:

```kotlin
NavigableListDetailPaneScaffold(
    navigator = scaffoldNavigator,
    listPane = { /* ... */ },
    detailPane = { /* ... */ }
)
```

## Edge-to-edge (mandatory Android 16+)

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent { /* ... */ }
    }
}

// In Composables:
Scaffold(
    contentWindowInsets = WindowInsets.systemBars
) { padding ->
    Column(modifier = Modifier.padding(padding)) { /* ... */ }
}
```

`windowOptOutEdgeToEdgeEnforcement` is deprecated — do not use it.

## Predictive back (mandatory Android 16+)

```kotlin
PredictiveBackHandler(enabled = canGoBack) { backEvent ->
    // backEvent: BackEventCompat with progress 0..1
    // animate based on progress
    try {
        backEvent.collect { event ->
            animateProgress(event.progress)
        }
        // gesture confirmed
        navigateBack()
    } catch (e: CancellationException) {
        // gesture canceled — animate back to rest
    }
}
```

## Reference apps

- **Pixel Launcher / Android 16 System UI** — shape morph + springs
- **Google Calendar** — floating toolbar + tonal surfaces
- **Fitbit (2025 redesign)** — `ContainedLoadingIndicator` cycling shapes
- **Pixel Camera 10.1** — wavy progress in capture
- **Androidify** sample — official Compose M3E reference: https://github.com/android/compose-samples/tree/main/Androidify

## Sources

- M3E deep dive: https://supercharge.design/blog/material-3-expressive
- Compose April '26 release: https://android-developers.googleblog.com/2026/04/jetpack-compose-april-2026-updates.html
- M3 site: https://m3.material.io
- Theme Builder: https://m3.material.io/theme-builder
