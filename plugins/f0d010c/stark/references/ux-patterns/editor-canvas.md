# Editor and canvas tool pattern

Use for creative tools, document editors, image/video editors, builders, design surfaces, diagramming apps, IDE-like tools, and no-code builders.

## Applies when

- The user's main object is a canvas, document, timeline, board, or editable artifact.
- Users need direct manipulation, undo/redo, preview, and stable controls.
- Tool discovery matters, but the canvas must remain primary.

## Wrong when

- The main job is record triage, analytics, or checkout.
- The product is mostly static content or marketing.

## Shipped-product signals to look for

- Canvas is visually dominant and not trapped in decorative cards.
- Toolbars are stable, icon-led, and grouped by task.
- Selection state exposes contextual controls near the object or in a predictable inspector.
- Undo/redo is always available for destructive edits.
- Empty canvas suggests the first object/action.
- Autosave/saved state is visible but not noisy.
- Keyboard shortcuts exist for repeated expert actions.

## Failure prevented

Tool chrome overpowering creation. Editors fail when users fight panels instead of manipulating the artifact.

## UX decision brief fields

- Pattern: canvas + stable toolbar + inspector + undo/redo
- Primary action: create or edit the artifact
- Secondary actions: select, preview, undo, export, share, inspect properties
- Required states: blank canvas, selected object, unsaved/saving/saved, export running, edit conflict, permission blocked
- Handoff constraints: canvas must dominate; controls must not cause layout shift; destructive actions need undo
