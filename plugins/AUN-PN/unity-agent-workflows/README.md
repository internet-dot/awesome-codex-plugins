# Unity Workflows

Codex plugin for safer AI-assisted Unity 2D work.

Use it when an agent must edit a real Unity project and first prove the path that controls what the player sees: project rules, scene or prefab references, runtime owner, mutation path, and validation.

Core rule:

```text
No proof, no edit.
```

## What It Adds

- Project-local instruction checks before file inspection or edits.
- Runtime-owner proof for UI, HUD, scene, prefab, gameplay, focus, marker, and camera work.
- Runtime numeric proof before repeated visible-output fixes.
- State-step guards for tutorial, FTUE, navigation, shop, reward, and guided equipment flows.
- Multi-agent scope ownership before workers edit files.
- Unity-specific cleanup proof before deletion or rename claims.
- Validation reporting that separates syntax checks from runtime proof.

## Use In Codex

Install this plugin from the `awesome-codex-plugins` marketplace, then invoke:

```text
Use $unity-agent-workflows. Teach
```

For a bug fix:

```text
Use $unity-agent-workflows to prove and fix this Unity runtime-visible bug.
```

For multi-agent work:

```text
Use $unity-agent-workflows. Main agent must lock scope before workers edit. Add a checker agent after changes.
```

## Plugin Payload

This directory is the installable plugin bundle used by `awesome-codex-plugins`:

```text
.codex-plugin/plugin.json
assets/unity-workflows.png
skills/unity-agent-workflows/SKILL.md
skills/unity-agent-workflows/agents/openai.yaml
skills/unity-agent-workflows/references/
```

The standalone npm installer, CI scripts, generated mirrors, and publishing docs live in the upstream repo:

```text
https://github.com/AUN-PN/unity-agent-workflows
```

## Limits

- Built for Unity 2D game projects.
- Does not replace Unity Play Mode, device testing, build validation, code review, or project-local `AGENTS.md`.
- Does not make `runtime-owner proof` an official Unity concept; it is a guardrail workflow.
