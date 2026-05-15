---
description: Analyze real shipped UI/UX references without copying visuals, then produce a structural reference extraction brief for Stark.
argument-hint: "<product, flow, screenshot, URL, or design problem>"
---

# /stark-reference

Legacy Claude Code command.
In Codex, ask:

> Use stark reference analysis for this flow before designing.

Read:

- `references/ui-patterns/reference-analysis.md`
- `references/ui-patterns/asset-selection.md`
- the relevant UX or platform skill

Inspect 3-5 shipped references when available. Use official docs, live public pages, first-party screenshots, or approved reference libraries. If using Mobbin/Figma/reference screenshots, extract structure only.

Output:

```md
Reference extraction brief
- Pattern chosen: ...
- Why it fits this user's job: ...
- Structural decisions to borrow: ...
- Decisions to reject: ...
- State/responsive requirements: ...
- Asset/source constraints: ...
```

Rules:

- Do not pixel-clone.
- Do not copy brand, artwork, screenshots, copy, or proprietary layouts.
- Name what you learned from each reference in product terms: job, IA, hierarchy, state, interaction, recovery, responsive behavior.
- Use the brief as input to UX/UI implementation.
