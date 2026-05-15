---
name: unity-agent-workflows
description: Use for AI-assisted Unity work that needs live repo discovery, project-derived routing, runtime-owner proof, runtime-visible output hard stops, runtime numeric proof for repeated visible-output failures, state-step guards, multi-agent scope ownership, modular C#/asmdef safety, UI/scene/visual asset gates, data-first content changes, validation, cleanup proof, or durable workflow rules. Best when agents must prove the actual folder/module/scene/prefab/runtime owner before editing, especially runtime UI, generated assets, code graphs, tutorial/state flows, guided equipment/shop flows, overlay/dim source-bound mistakes, coordinate conversions, focus/highlight/marker/HUD alignment, or repeated "fix still not visible" failures.
license: MIT
---

# Unity Agent Workflows

AI contract for Unity work. Keep answers compact, but never remove exact paths, object/class names, commands, errors, validation, rollback notes, or proof requirements.

## Core Loop

0. No proof, no edit.
1. Treat this injected `SKILL.md` as authoritative; do not search for its own path unless missing or asked for diagnostics.
2. Read live project instructions: `AGENTS.md`, `README.md`, architecture docs, repo-local agent files.
3. Run `git status --short`; preserve unrelated dirty files.
4. If user says only `$unity-agent-workflows. Teach`, run Teach.
5. Derive only relevant live structure before architecture claims: folders, namespaces, `.asmdef`, scenes/prefabs, bootstraps, graphs, docs, `UNITY_STRUCTURE*`.
6. Classify task with `Task Gate`, then load required references before edits.
7. Inspect real owner files; never start from memory, nearest-name guessing, semantic similarity, or screenshot proximity alone.
8. Fill useful `Routing Card` fields for structure, visible output, state flow, multi-agent, or hub changes.
9. Patch the smallest proven owner/artifact.
10. Validate, sync mirrors if package skill files changed, then close out with proof.

## Task Gate

| Trigger | Required action |
|---|---|
| Runtime/visible bug | Prove owner chain before editing. |
| Runtime-visible output, target alignment, focus/highlight/marker/HUD, overlay, input blocker, modal dimming, duplicate names, hardcoded layout, "do not guess" | Runtime Visible Output Hard Stop. |
| Screenshot or visible UI text fix | Screenshot Text Owner Gate; search exact visible text/localization key and prove creator plus refresh writer before editing. |
| Shared factory/helper/style candidate for visible UI | Treat as dependency only until the visible callsite proves it uses that helper. |
| Overlay/dim source-bound mistakes | Prove source target bounds; overlay/dim/mask/blocker rects are destination output unless explicit marker proof exists. |
| Repeated visible-output mismatch after patch | Runtime numeric proof before another coordinate/layout/fallback patch. |
| Multi-agent visible-output or state work | Main-agent scope lock before workers patch; checker must review. |
| New/moved files, expanded C# responsibility, asmdef/module routing, hub deflation | Project-derived routing, no fixed structure, hub stop gate. |
| UI, screenshot, HUD, menu, safe area, TMP, spotlight | UI workflow plus runtime-owner proof and validation. |
| Visual source asset | Source asset/generator gate before Unity integration code. |
| Content, progression, economy, levels, objectives, gameplay tuning | Data-first content workflow. |
| Tutorial, onboarding, mission, unlock, equipment, reward, shop, navigation, state transition, guided equipment/shop flows | State-step guards. |
| Compile/runtime doubt, stale Bee/Roslyn response files, Play Mode proof | Validation workflow. |
| Cleanup/deletion/generated files/git hygiene | Cleanup proof. |
| Rule/session mining/workflow update | Patch only the owning artifact. |

## Required References

Load only matching files; resolve relative to this skill directory. If a required reference is missing, stop broad edits, use only visible rules here, and report `References missing:`.

| Task trigger | References before editing |
|---|---|
| UI, screenshot, HUD, menu, safe area, TMP, visible target, focus, highlight, spotlight, modal dimming | `references/ui-and-visual-assets.md`, `references/runtime-owner-proof.md`, `references/unity-validation.md` |
| Screenshot text, visible UI label, localized UI text, runtime text styling, shared factory/helper candidate | `references/runtime-owner-proof.md`, `references/ai-workflows.md`, `references/unity-validation.md` |
| Runtime-visible bug, repeated "still wrong", duplicate object names, real object/position request | `references/runtime-owner-proof.md`, `references/unity-validation.md` |
| Overlay/dim source-bound mismatch, wrong source bounds, focus hole follows wrong target | `references/runtime-owner-proof.md`, `references/runtime-visible-targets.md`, `references/coordinate-space-conversion.md`, `references/unity-validation.md` |
| Repeated visible-output failure, wrong focus/highlight/marker/HUD/camera position, cross-root/cross-canvas mismatch | `references/runtime-owner-proof.md`, `references/runtime-visible-targets.md`, `references/coordinate-space-conversion.md`, `references/unity-validation.md` |
| Multi-agent Unity visible-output/state-transition work, parallel workers, checker review | `references/ai-workflows.md`, `references/workflow-recipes.md`, `references/runtime-owner-proof.md`, `references/content-and-systems.md`, `references/unity-validation.md` |
| New files/classes, moved scripts, asmdef/module routing, dependency direction, hub deflation/refactor | `references/project-structure-discovery.md`, `references/modular-architecture.md`, `references/ai-workflows.md` |
| New runtime feature, content, progression, levels, economy, objective/data-first work | `references/project-structure-discovery.md`, `references/content-and-systems.md`, `references/ai-workflows.md` |
| Tutorial, onboarding, mission step, unlock, equipment, reward, shop, navigation gate, state transition | `references/project-structure-discovery.md`, `references/content-and-systems.md`, `references/ai-workflows.md`, `references/unity-validation.md` |
| Compile error, validation repair, stale Bee/Roslyn response files, Play Mode proof | `references/unity-validation.md` |
| Cleanup/deletion/generated files/git hygiene | `references/cleanup-and-git.md` |
| Rule/session mining/workflow update | `references/session-mining.md` |

Reference map: `references/ai-workflows.md` = Routing Card/workflow/closeout; `references/workflow-recipes.md` = named recipes; `references/project-structure-discovery.md` = Teach and `UNITY_STRUCTURE*`; `references/modular-architecture.md` = layering/asmdef/hub gates; `references/runtime-owner-proof.md` = owner chain/numeric gate; `references/runtime-visible-targets.md` = focus/click/overlay/fallback target rules; `references/target-bounds-catalog.md` = `markerRect`/`visualRect`/`interactiveRect` choices; `references/coordinate-space-conversion.md` = world/screen/canvas/camera/safe-area conversions; `references/unity-validation.md` = validation ladder/checker failures; `references/ui-and-visual-assets.md` = UI/safe area/visual asset gate; `references/content-and-systems.md` = data-first systems/state steps; `references/cleanup-and-git.md` = deletion/git hygiene; `references/session-mining.md` = durable rules.

After loading a reference, follow its own `Read` / `Load Extra Detail` table instead of preloading every linked file.

## Teach

For only `$unity-agent-workflows. Teach`, create/refresh a short `UNITY_STRUCTURE.md` plus only focused maps that exist or are needed:

```text
UNITY_STRUCTURE.ui.md
UNITY_STRUCTURE.runtime.md
UNITY_STRUCTURE.content.md
UNITY_STRUCTURE.assemblies.md
UNITY_STRUCTURE.cleanup.md
```

Read `references/project-structure-discovery.md`. Do not make one huge all-project doc. Later tasks read `UNITY_STRUCTURE.md` plus only the matching focused map; refresh only missing needed maps.

## Proof Gates

Owner chain before visible/runtime edits:

```text
visible object -> scene/prefab/reference -> script/component -> mutating method -> serialized/runtime override
```

Runtime Visible Output Hard Stop before changing coordinates, anchors, offsets, padding, scale, layout timing, camera conversion, or fallback constants:

```text
user-visible output
-> active source object
-> selected source bounds: markerRect / visualRect / interactiveRect / logicRect
-> source parent chain
-> owner script/component
-> runtime writer after creation/layout
-> source space and camera/canvas
-> destination root/canvas/space
-> conversion API path
-> converted output rect/position
-> validation method
```

Runtime numeric proof required after any visible patch is wrong/unchanged/challenged:

```text
source object:
source parent chain:
source bounds: markerRect / visualRect / interactiveRect / logicRect
source canvas/root/renderMode/scaleFactor/camera:
destination object/root/canvas/renderMode/scaleFactor/camera:
conversion API path:
converted rect min/max:
converted center/size:
final drawn object:
final drawn position:
final drawn size/bounds:
runtime writer checked:
validation:
```

Missing source bounds, converted rect, or final drawn rect is FAIL; return a runtime probe plan only.

State-step proof: screen open, click, analytics, or prompt shown is not completion. Prove relevant steps separately: shown, clicked, opened, selected, equipped, claimed, completed, persisted, old-save path, reset path.

Multi-agent guard: main agent owns Routing Card, scope, allowed files, and not-touched files before workers patch. Workers use disjoint ownership and stop if a different owner or out-of-scope file appears. Checker fails missing runtime numeric proof or state-step proof.

For screenshot, visible UI, or runtime text fixes, the scope lock must include exact text/key searched, owner file, creator method, refresh/update writer, allowed files, explicitly not touched files, and nearby candidates rejected. Shared factories/helpers/styles are not owners unless the visible callsite proves their use.

## Architecture Rules

- No fixed structure; derive module/layer/folder/namespace/assembly/scene/prefab ownership from the user project.
- Core/Contracts/Systems/Features is fallback example only.
- No guessed targeting: if asked to bind, focus, highlight, click, or align a visible object, resolve the real runtime object and coordinate space before editing.
- Do not grow hubs when a focused collaborator, data object, contract, event, bridge, or service can own the work.
- Do not add direct sibling feature references; use contracts/events/gateways/bridges.
- Do not add new scripts to broad folders when a specific owner, module, assembly, feature folder, scene owner, or content definition path exists.
- Do not treat scene YAML, prefab scale, or searched constants as runtime truth until startup/layout/animation writers are checked.
- Do not mix source refactors with cache cleanup, generated build output, or unrelated scene/prefab churn.
- Visual source asset creation/replacement happens before integration code; if required tool is unavailable, stop and report.
- Cleanup needs code refs, YAML GUID refs, Resources/addressables, scene/prefab refs, generated-vs-source status, and runtime reachability proof.

## Routing Card

```text
Task type:
Structural trigger:
Runtime-visible target:
Current owner file(s):
Project structure source: live scan / docs / graph / UNITY_STRUCTURE.md / mixed
Placement layer/category from repo:
Module/system name:
Data/definition source:
Runtime source-of-truth values:
Coordinate/rendering space checked: yes/no
New responsibility added? yes/no
Cross-module communication needed? yes/no
Hub risk: low / medium / stop
Visual source asset required? yes/no
Validation plan:
Files allowed to touch:
Files explicitly not touched:
```

Add graph/God Node/edge count/over-500 status only when architecture or C# responsibility changed and graph/source data exists.

## Closeout Schema

Always report:

- Changed files.
- Non-requested systems touched: yes/no.
- Runtime-owner or structural proof.
- Runtime numeric proof for repeated visible-output fixes, or probe plan if not captured.
- Validation command and result.
- `References loaded:` or `References missing:`.
- `Project maps loaded:` or `Project maps missing:`.
- Residual risk.

Add only when relevant: largest touched `.cs` files and over-500 status, graph/God Node/edge-gate status, visual asset tool used, Play Mode/Game view/device/batchmode/graph gaps.
