# AI Workflows

## Purpose

Use this when a Unity task needs a repeatable process before and after edits. The goal is to stop new work from piling into the nearest controller, manager, partial class, or scene YAML value.

## Universal Workflow

1. Load live repo context.
   - Read repo instructions and architecture docs.
   - Check dirty files.
   - Derive the user's actual project structure before routing.
   - Load only the relevant detailed reference.

2. Read graph and architecture context.
   - Prefer a current graph report when available.
   - If the graph is missing, continue with direct source inspection.
   - Do not copy static graph counts into permanent rules.

3. Prove the owner chain.
   - UI/visible bugs: visible object -> scene/prefab/reference -> script/component -> mutating method -> serialized/runtime override.
   - Screenshot/visible text bugs: visible text -> exact string/localization key/text setter -> UI text object -> creator method -> refresh/update writer -> owner.
   - Gameplay bugs: entrypoint -> orchestrator -> collaborator -> data/config -> contracts/events.
   - Compile bugs: exact error -> file -> assembly -> dependency edge -> smallest fix.

4. Classify placement before editing.
   - Use `references/project-structure-discovery.md` to map the repo's real folders, namespaces, assemblies, scenes, prefabs, and content paths.
   - Feature/module behavior -> the existing repo-local owner for that feature/module.
   - Reusable runtime service -> the existing repo-local service/system/runtime owner path.
   - Cross-module API/event/interface -> the repo's existing contract/event/gateway boundary.
   - Project primitive -> the repo's existing primitive/shared foundation path.
   - Content/tuning/unlock/balance data -> ScriptableObjects, content definitions, config, or serialized fields.
   - Source visual asset -> asset generation/replacement workflow before integration code.

5. Apply stop gates.
   - No fixed sample layout unless the repo already uses it or the user requests migration.
   - No new scripts in broad folders when a more specific live owner exists.
   - No direct sibling feature imports.
   - No system-to-feature dependency.
   - No hub growth when a collaborator can own the work.
   - No shared factory/helper/style patch for a visible target until the target callsite proves it uses that dependency.

6. Edit the smallest safe file set.
   - Preserve Unity serialized field names where possible.
   - Use `FormerlySerializedAs` when renaming serialized fields.
   - Keep unrelated scene, prefab, cache, and generated output out of the patch.

7. Validate.
   - Docs: `git diff --check`.
   - JSON/asmdef: parse and compare actual files.
   - C#: compile-oriented check.
   - UI/visible: screenshot, hierarchy, or runtime-owner proof.

8. Close with proof.
   - Changed files.
   - Validation result.
   - Runtime-owner or structural proof.
   - Non-requested systems touched.
   - Visual asset tool status.

## Workflow Recipes

Load `references/workflow-recipes.md` only when the task needs a named recipe (`WF-0` through `WF-11`) or when the universal workflow above is not specific enough.

## Main-Agent Scope Lock Before Worker Patch

Use this before sub-agents patch screenshot, visible UI, runtime text, state-step, or runtime-visible output tasks.

Main agent must record:

```text
visible target:
exact text/key searched:
owner file:
creator method:
refresh/update writer:
allowed files:
explicitly not touched:
nearby candidates rejected:
```

Workers must stop when they only find a candidate, helper, factory, style utility, localization provider, or shared primitive. They must ask for scope revision if the proven owner differs from the scope lock or requires a file outside `allowed files`.

Checker must return FAIL when the patch lacks the visible target -> owner -> writer chain, when a shared helper is edited without a proven visible callsite, or when rejected nearby candidates are not explained for screenshot/visible text fixes.
