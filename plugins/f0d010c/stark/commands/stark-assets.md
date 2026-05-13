---
description: Plan UI assets for a Stark design before implementation, including references, icons, typography, generated product mocks, and optional image generation when the agent supports it.
argument-hint: "<project or screen brief>"
---

# /stark-assets

Legacy Claude Code command.
In Codex, ask:

> Use stark assets to plan the visual assets for this app/site before building.

Plan assets for the project described by `$ARGUMENTS`.

Read:

- `references/ui-patterns/ui-decision-brief.md`
- `references/ui-patterns/asset-selection.md`
- the routed platform or web skill

Then produce an asset plan before implementation:

```md
Asset plan
- Needed assets: product UI mock, icons, texture, typeface, references
- Source: local Stark library, lucide, generated CSS/SVG mock, imagegen, external reference
- License risk: none / low / needs attribution / avoid
- Usage: hero product preview, warning states, workflow diagram, empty state
- Reference extraction: structure only, not copied visuals
- Bans: stock hero photos, abstract AI gradients, placeholder images, private screenshots without permission
```

## Rules

- Do not freely browse and grab assets.
- Ask whether the project needs icons, real product screenshots, reference UI patterns, typography, brand assets, or generated bitmap visuals.
- Pull only assets that support the product job and visual direction.
- If the agent is GPT/Codex and image generation is available, prefer generated bitmap assets for fictional hero imagery, textures, product concept art, or editorial visuals when CSS/SVG would be too weak.
- Never include private/local screenshots unless the user explicitly allows it.
- Do not copy copyrighted brand assets into public output.
- Use real-world references to extract structure and interaction patterns, not visual identity.
