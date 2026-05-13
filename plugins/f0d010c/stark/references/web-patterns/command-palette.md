# Pattern - Command palette

Use for expert web apps, devtools, dashboards, editors, admin tools, and desktop-like web surfaces where users need fast navigation and actions.

## Reference signals

Shipped products such as Linear and Vercel expose command menus so users can navigate and run common actions with the keyboard while keeping mouse paths available. The key lesson is not the exact modal styling; it is that actions become searchable, contextual, and repeatable.

## Structure

- Global shortcut: `Cmd/Ctrl+K`.
- Search input with visible focus and placeholder tied to the current scope.
- Result groups: recent, navigation, create, selected-item actions, settings.
- Each result has label, optional shortcut, icon, and short context.
- Empty state gives a next action, not a tutorial paragraph.
- Dangerous actions require confirmation or move to a secondary flow.

## Implementation notes

- Keep command data structured: `id`, `label`, `group`, `keywords`, `shortcut`, `disabledReason`, `run`.
- Support arrow keys, Enter, Escape, and typeahead.
- Show context-aware commands first when an item is selected.
- Do not hide the only path to an action inside the palette.

## Responsive

- Desktop: centered overlay or anchored command surface.
- Mobile: full-screen sheet with large hit targets and no hover-only states.

## Avoid

- Command palette as decoration on a marketing page.
- Unlabeled icon-only results.
- Fuzzy search that returns destructive actions before navigation.
- Copying Raycast/Linear visuals; borrow action architecture, not skin.
