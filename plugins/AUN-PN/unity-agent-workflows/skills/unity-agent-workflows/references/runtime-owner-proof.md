# Runtime Owner Proof

Use when a visible fix may not show in Play mode, a screenshot target is ambiguous, an object may have duplicate names, or a previous change "did nothing".

## Owner Chain

Prove this before editing visible/runtime behavior:

```text
visible object
-> scene/prefab/reference
-> script/component
-> mutating method
-> serialized/runtime override
```

If one link is missing, search another direction before stopping.

## Runtime Visible Target Lock

Use when the user asks to move, focus, highlight, click, bind, align, dim around, brighten, select, inspect, or fix any visible UI/gameplay target.

Required proof before editing:

```text
user-visible target
-> runtime GameObject
-> runtime RectTransform/Transform
-> scene/prefab/source creator
-> script/component owner
-> runtime layout/movement writer
-> duplicate-name result
-> measurement coordinate space
-> validation method
```

If proof is incomplete, do not patch coordinates. Inspect deeper or ask one concise question if two live owners are equally plausible.

## Screenshot Text Owner Gate

Use when a screenshot, user wording, OCR, visible UI label, HUD text, menu text, tutorial text, localized string, TMP text, or runtime text styling points to a visible text target.

Do not patch by nearby class names, shared factories, style helpers, localization utilities, semantic UI guesses, or the first file that mentions a similar concept.

Before editing, prove:

```text
visible screenshot/user text
-> exact visible string / localization key / text setter searched
-> active UI text object name
-> scene/prefab/runtime source
-> creator method
-> refresh/update writer
-> owning presenter/controller/component
-> serialized/runtime override
-> validation method
```

If the exact text/key is not searchable, inspect candidate UI builders and report candidates first. Missing creator or refresh/update writer is a FAIL for visible text edits.

Closeout for visible text fixes must include:

```text
Why this owner is runtime-visible:
Why nearby candidates are not owners:
Exact text/key searched:
Refresh writer checked:
Factory/helper touched? yes/no, with proven callsite:
```

## Factory Is Not Owner Rule

Factories, builders, layout helpers, font/style helpers, localization providers, theme utilities, and shared UI primitives are dependencies by default.

Treat them as owners only after proving the visible runtime callsite uses them:

```text
visible target
-> owner presenter/controller/component
-> creator/update method
-> helper/factory callsite
-> helper output used by the visible object
```

If only the helper/factory is found, stay read-only or continue tracing callsites. Do not patch shared helpers to fix a single visible target until the target owner chain proves the helper participates in that runtime object.

## Runtime Visible Output Hard Stop

Use for runtime-visible output drawn, positioned, blocked, aimed, anchored, masked, followed, measured, or converted from a live Unity target. Broader than tutorial focus UI.

Examples include UI overlays, selection outlines, input blockers, drag targets, HUD markers, objective arrows, world-to-UI labels, damage numbers, nameplates, health bars, safe-area-dependent UI, camera targets, RenderTexture-driven UI, world-space canvases, and hardcoded layout used as a substitute for a live target.

Do not edit coordinates, anchors, offsets, padding, scale, layout timing, camera conversion, or fallback constants until this proof exists:

```text
user-visible output
-> active source object
-> selected source bounds: markerRect / visualRect / interactiveRect / logicRect
-> source parent chain
-> source owner script/component
-> runtime writer after creation/layout
-> source space and camera/canvas
-> destination root/canvas/space
-> conversion API path
-> converted output rect/position
-> validation method
```

If any link is unknown, stay read-only or inspect deeper. Do not patch from semantic similarity, object center, first-name lookup, screenshot proximity, or a previously edited constant.

## Runtime Numeric Proof Gate

Use after any visible-output patch fails, appears unchanged, lands in the wrong place, or is challenged with a screenshot.

Static source inspection is not runtime proof. Sub-agent reasoning is not runtime proof. Compile success is not visual proof. Screenshot estimation is not coordinate proof. Checker confidence is not proof without values.

Before another coordinate, focus, layout, marker, camera, safe-area, or fallback patch, collect concrete runtime values from Play Mode, Unity MCP/runtime hierarchy query, Device Simulator, Game view inspection, or temporary runtime logs:

```text
source object:
source parent chain:
source bounds: markerRect / visualRect / interactiveRect / logicRect
source canvas/root:
source canvas renderMode:
source canvas scaleFactor:
source camera:
destination object/root:
destination canvas/root:
destination canvas renderMode:
destination canvas scaleFactor:
destination camera:
conversion API path:
converted rect min/max:
converted center/size:
final drawn object:
final drawn position:
final drawn size/bounds:
runtime writer checked:
validation:
```

Missing source bounds, converted rect, or final drawn rect is a FAIL. On FAIL, stay read-only and return a runtime probe plan only.

## Load Extra Detail Only When Needed

| Trigger | Read |
|---|---|
| runtime-visible output, focus ring, tutorial spotlight, modal hole, tap/click target, highlight, marker, visual alignment, input blocker, world-to-UI label, HUD marker, hardcoded layout | `references/runtime-visible-targets.md` |
| button/icon/card/HUD row/world unit/projectile/VFX/text bounds, choosing `markerRect` vs `visualRect` vs `interactiveRect` | `references/target-bounds-catalog.md` |
| world/local/screen/viewport/canvas/camera/safe-area/RenderTexture mismatch or world-to-UI conversion | `references/coordinate-space-conversion.md` |

## Hardcoded Layout Guard

```text
visible target -> runtime object -> runtime bounds -> converted coordinate space -> overlay
```

Hardcoded layout is not runtime object proof. Use hardcoded values only as a named fallback after runtime target resolution fails, and report residual risk.

## Read-Only Target Inspection

When the user says not to edit yet, or asks what the object is:

- Do not edit files.
- List candidate objects with parent chain, scene/prefab source, active state, component type, and owner script when available.
- Count duplicate names and explain which candidates are runtime-active.
- Wait for explicit edit approval before patching.

## Search Directions

- Visible text, object name, sprite name, material name, method name.
- Scene YAML and prefab YAML refs.
- Script GUID from `.meta` files.
- Serialized field names and `FormerlySerializedAs`.
- Runtime builders: `Awake`, `OnEnable`, `Start`, `LateUpdate`, layout builders, factories, presenters.
- Refresh paths that rewrite labels/colors/sizes after creation.
- `GameObject.Find`, `FindObjectOfType`, `Resources.Load`, addressables, service locators.
- Animation, tween, clone, pooling, safe-area, CanvasScaler, or camera scripts that override values.

## Serialized Scene And Prefab Persistence

Use when the fix touches serialized scene objects, prefab assets, prefab instances, variants, component fields, object references, or editor tooling. Before closeout, prove:

```text
intended target
-> scene instance / prefab asset / prefab instance / prefab variant
-> serialized field or component changed
-> dirty state or override recorded
-> saved asset or scene file updated
-> runtime path still reads that serialized value
```

- Distinguish scene instance, prefab asset, prefab instance override, nested prefab, prefab variant, and Prefab Mode before editing.
- Use the project's existing editor tooling when it exists; otherwise prefer Unity editor APIs such as `SerializedObject`, `Undo.RecordObject`, `PrefabUtility`, `EditorUtility.SetDirty`, and `EditorSceneManager.MarkSceneDirty`.
- For prefab instances, record the intended override with `PrefabUtility.RecordPrefabInstancePropertyModifications(...)` when editor code changes serialized properties.
- For scene edits, confirm the correct scene is dirty and saved. Multi-scene setups must identify which loaded scene owns the object.
- For prefab asset edits, confirm whether the change belongs on the source prefab, a variant, or a specific scene instance override.
- Preserve `.meta` GUIDs during moves or asset replacement unless the user explicitly approves reference-breaking regeneration.
- After saving, re-open or re-query the object when possible and confirm the serialized value did not revert through import, `OnValidate`, setup scripts, or Play Mode initialization.
- Serialized persistence is not runtime proof. If a runtime builder, presenter, animation, or service rewrites the value, patch that runtime owner too.

## Do Not Assume

- Scene transform scale if startup rewrites it.
- Prefab default if scene overrides exist.
- A constant if a presenter/layout helper later clamps it.
- Compile passing as visual proof.
- Static source inspection, sub-agent reasoning, checker confidence, or screenshot estimation as runtime numeric proof.
- A semantically related file as screenshot-target ownership.
- `GameObject.Find(name)` when duplicate/inactive objects may exist.
- Screenshot pixels when the user asks for object, hierarchy, or code-derived position.
- Hardcoded layout/position when a live `RectTransform`, `Transform`, `Renderer`, `Collider`, or marker can be resolved.

## Repeated-Fix Flow

When the user says the result is still wrong:

1. Stop tuning constants.
2. Re-read the screenshot/target wording.
3. Re-run the Runtime Visible Output Hard Stop proof chain.
4. Run the Runtime Numeric Proof Gate before another patch.
5. Check duplicate names, inactive scene objects, cloned runtime objects, and parent-chain ambiguity.
6. Search runtime writers and refresh paths.
7. Check whether the edited script is in the compiled assembly.
8. Check whether scene/prefab overrides also need updating.
9. Patch only after numeric proof explains the mismatch.
10. Validate with Game view/device/screenshot proof when possible.

## Screenshot Ambiguity

If screenshot and text disagree, ask one concise clarifying question before editing. If the screenshot clearly marks one object, that runtime target wins over semantic guesses; scope to that object and direct dependencies only.
