# Retro Document Template

> Template for `/plan retro` mode. Used by SKILL.md Phase 3 to generate retrospective documents.
> Fill each `{{placeholder}}` with data from Phase 1 (automatic) and Phase 2 (reflection waves).
> Delete this instruction block before saving the final retro document.

---

# Retrospective — {{YYYY-MM-DD}}

**Project:** {{project-name}}
**Period:** {{start-date}} to {{end-date}}
**Sessions analyzed:** {{N}}

## Metrics

> Auto-generated from `.orchestrator/metrics/sessions.jsonl`. Do not edit manually.

| Metric | Value | Trend |
|--------|-------|-------|
| Total sessions | {{N}} | — |
| Average duration | {{Xm}} | {{↑/↓/→}} |
| Completion rate | {{X%}} | {{↑/↓/→}} |
| Agent success rate | {{X%}} | {{↑/↓/→}} |
| Spiral rate | {{X%}} | {{↑/↓/→}} |
| Total files changed | {{N}} | {{↑/↓/→}} |
| Carryover rate | {{X%}} | {{↑/↓/→}} |

### Session Breakdown

| Date | Type | Duration | Waves | Completion |
|------|------|----------|-------|------------|
| {{date}} | {{type}} | {{Xm}} | {{N}} | {{X%}} |

### Change Hotspots

| File | Changes | Last Modified |
|------|---------|---------------|
| {{file}} | {{N}} | {{date}} |

## Highlights

### 1. {{highlight-title}}
{{Description backed by data. What went well, with evidence from metrics or git history.}}

### 2. {{highlight-title}}
{{Description}}

### 3. {{highlight-title}}
{{Description}}

## Improvement Areas

### 1. {{area-title}}
**Root cause:** {{analysis of why this is a problem}}
**Evidence:** {{data points supporting this}}
**Impact:** {{what happens if not addressed}}

### 2. {{area-title}}
**Root cause:** {{analysis}}
**Evidence:** {{data}}
**Impact:** {{consequence}}

### 3. {{area-title}}
**Root cause:** {{analysis}}
**Evidence:** {{data}}
**Impact:** {{consequence}}

## Actions

| # | Action | Issue Link | Priority | Owner | Deadline |
|---|--------|------------|----------|-------|----------|
| 1 | {{action}} | {{#issue}} | {{high/medium/low}} | {{who}} | {{when}} |
| 2 | {{action}} | {{#issue}} | {{high/medium/low}} | {{who}} | {{when}} |
| 3 | {{action}} | {{#issue}} | {{high/medium/low}} | {{who}} | {{when}} |
