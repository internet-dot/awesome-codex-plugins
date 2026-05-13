# Product quality bar

Use this before implementation when Stark is asked to make a UI "better", "polished", "less generic", or ready to show publicly.

The goal is not more decoration. The goal is a surface that looks like it belongs to a specific product with a specific job.

## The five checks

### 1. Specific job

The first viewport or first screen must answer:

- What is this product for?
- What object is the user working on?
- What decision or action matters next?

Weak signal: generic cards, generic metrics, generic "manage everything" copy.

Strong signal: domain-specific object names, real statuses, realistic records, clear next action, visible consequence.

### 2. Proof over claims

Prefer proof surfaces to marketing claims:

- Product screenshot or generated product mock
- Live-looking data table, inspector, run timeline, command palette, settings matrix
- Before/after comparison
- Annotated workflow
- Audit trail, permission state, cost/risk summary

If a section says "fast", show what became faster. If it says "secure", show permission, audit, or policy behavior. If it says "AI", show plan, progress, artifacts, retry, and stop controls.

### 3. Complete states

At minimum, define:

- Empty
- Loading
- Partial
- Error
- Permission blocked
- Success
- Long-running or stale state when relevant

A beautiful happy path is not enough for a product UI.

### 4. Scan speed

For repeated-use products, users should be able to scan:

- Priority
- Status
- Owner/source
- Timestamp
- Next action
- Risk/cost

Use dense lists, tables, split panes, saved views, command palettes, and keyboard overlays when they support repeated work.

### 5. Memorable restraint

For marketing and brand surfaces, one memorable move is better than five decorative tricks.

Pick one anchor:

- Unusual typography
- Product proof hero
- Editorial grid
- Motion transition
- Material texture
- Interactive comparison

Everything else should support that anchor.

## Rewrite rule

If a design could be reused by a CRM, AI SaaS, finance dashboard, and developer tool by changing only the logo, it is not specific enough.

Before coding, replace generic elements with product-specific ones:

| Generic | Stronger |
|---|---|
| "Dashboard" | "Failed deploy triage" |
| "Customers" | "Accounts at renewal risk" |
| "Activity" | "Policy changes requiring approval" |
| "AI assistant" | "Run plan, tool calls, artifacts, retry path" |
| "Analytics" | "Conversion drop by step, segment, and recovery action" |
| "Settings" | "Permissions, billing, notifications, data retention" |

## Output expectation

When Stark builds or audits UI, include a short quality-bar note:

```md
Quality bar
- Specific job: ...
- Proof surface: ...
- Required states: ...
- Scan-speed decision: ...
- Memorable anchor: ...
```

Keep it short. The note is there to guide code, not to become product strategy theater.
