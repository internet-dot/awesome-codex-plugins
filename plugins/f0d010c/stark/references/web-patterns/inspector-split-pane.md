# Pattern - Inspector split pane

Use for editors, issue trackers, dashboards, agent run viewers, media libraries, and local-first tools where a user selects an object and edits or inspects details without losing list/canvas position.

## Structure

- Left or center: stable list, table, board, canvas, timeline, or artifact.
- Right: inspector with selected object title, status, primary action, metadata, state, and history.
- Selection state is visible in both regions.
- Inspector sections are grouped by task: summary, actions, properties, activity, permissions.
- Empty inspector state explains what selecting an item will reveal.

## Interaction

- Selecting an item updates the inspector without navigating away.
- Keyboard navigation changes selection.
- Inspector actions are scoped to the selected object.
- High-risk changes need confirmation, undo, or audit trail.

## Responsive

- Desktop: persistent right pane.
- Tablet: collapsible pane or resizable split.
- Mobile: detail sheet or route, with a clear back path to preserve list position.

## Avoid

- Replacing the list with a detail page for high-frequency triage.
- Putting every field in the inspector with equal weight.
- Decorative cards inside the inspector that slow scanning.
