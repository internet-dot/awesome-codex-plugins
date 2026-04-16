# PRD Template — Feature (5 Sections)

> Template for `/plan feature` mode. Used by SKILL.md Phase 3 to generate feature PRDs.
> Fill each `{{placeholder}}` with data gathered during the Q&A waves.
> Delete this instruction block before saving the final PRD.

---

# Feature: {{feature-name}}

**Date:** {{YYYY-MM-DD}}
**Author:** {{user}} + Claude (AI-assisted planning)
**Status:** Draft
**Appetite:** {{1w|2w|6w}}
**Parent Project:** {{project-name or "standalone"}}

## 1. Problem & Motivation

### What
{{What we're building — clear, concise description}}

### Why
{{Business driver, user feedback, or technical necessity — from Wave 1 Q2}}

### Who
{{Target users — existing personas or new audience — from Wave 1 Q3}}

## 2. Solution & Scope

### In-Scope
- [ ] {{scope-item-1}}
- [ ] {{scope-item-2}}
- [ ] {{scope-item-3}}

### Out-of-Scope
- {{excluded-1 — why}}
- {{excluded-2 — why}}

## 3. Acceptance Criteria

### {{Feature Area 1}}
```gherkin
Given {{precondition}}
When {{action}}
Then {{expected result}}
```

### {{Feature Area 2}}
```gherkin
Given {{precondition}}
When {{action}}
Then {{expected result}}
```

### {{Edge Case / Error Handling}}
```gherkin
Given {{error condition}}
When {{action}}
Then {{graceful handling}}
```

## 4. Technical Notes

### Affected Files
- `{{file-path-1}}` — {{what changes}}
- `{{file-path-2}}` — {{what changes}}

### Architecture
{{High-level approach — patterns to follow, components to modify}}

### Data Model Changes
{{New tables, columns, migrations — or "None"}}

### API Changes
{{New endpoints, modified contracts — or "None"}}

## 5. Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| {{risk-1}} | {{impact}} | {{mitigation}} |

### Dependencies
- {{dependency-1}}: {{status}}
- {{open-issue-ref}}: {{relationship}}
