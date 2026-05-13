# Pattern - Keyboard shortcut overlay

Use for expert tools, editors, desktop-like web apps, dashboards, and command surfaces.

## Structure

- Launch with `?` or from help/menu.
- Group shortcuts by task: navigation, creation, selection, editing, view, command menu.
- Show platform-specific modifiers: `Cmd` on macOS, `Ctrl` on Windows/Linux.
- Include context labels when shortcuts only work in a specific surface.
- Search/filter shortcuts when the list is long.

## Interaction

- Overlay is dismissible with Escape.
- Shortcuts are discoverable near matching controls when useful.
- Disabled shortcuts explain why they are unavailable.
- Do not trap focus.

## Responsive

- Desktop: modal or side sheet.
- Mobile/tablet: use gesture/help sheet; do not imply keyboard-only use.

## Avoid

- Shortcut wall with no grouping.
- Keyboard-only features with no mouse/touch path.
- Showing shortcuts that do not exist.
