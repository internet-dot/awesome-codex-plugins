---
name: product
description: 'Create or refine PRODUCT.md.'
---
# $product — Interactive PRODUCT.md Generation

> **Purpose:** Guide the user through creating a `PRODUCT.md` that unlocks product-aware reviews in `$pre-mortem` and `$vibe`, including the default quick-mode inline paths.

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

**CLI dependencies:** None required.

## Execution Steps

Given `$product [target-dir]`:

- `target-dir` defaults to the current working directory.

### Step 1: Pre-flight

Check if PRODUCT.md already exists:

```bash
ls PRODUCT.md 2>/dev/null
```

**If it exists:**

Ask the user directly:
- **Question:** "PRODUCT.md already exists. What would you like to do?"
- **Options:**
  - "Overwrite — start fresh" → continue to Step 2
  - "Update — keep existing content as defaults" → read existing file, use its values as pre-populated suggestions in Step 3
  - "Cancel" → stop, report no changes

**If it does not exist:** continue to Step 2.

### Step 2: Gather Context

Read available project files to pre-populate suggestions:

1. **README.md** — extract project description, purpose, target audience
2. **package.json / pyproject.toml / go.mod / Cargo.toml** — extract project name
3. **Directory listing** — `ls` the project root for structural hints

Use what you find to draft initial suggestions for each section. If no files exist, proceed with blank suggestions.

### Step 3: Interview

Ask the user about each section. For each question, offer pre-populated suggestions from Step 2 where available.

#### 3a: Mission

Ask: "What is your product's mission? (One sentence: what does it do and for whom?)"

Options based on README analysis:
- Suggested mission derived from README (if available)
- A shorter/punchier variant
- "Let me type my own"

#### 3b: Target Personas

Ask: "Who are your primary users? Describe 2-3 personas."

For each persona, gather:
- **Role** (e.g., "Backend Developer", "DevOps Engineer")
- **Goal** — what they're trying to accomplish
- **Pain point** — what makes this hard today

Ask the user for the first persona's role, then follow up conversationally for details and additional personas. Stop when the user says they're done or after 3 personas.

#### 3c: Core Value Propositions

Ask: "What makes your product worth using? List 2-4 key value propositions."

Options:
- Suggestions derived from README/project context
- "Let me type my own"

#### 3d: Competitive Positioning

Ask: "What alternatives exist, and how do you differentiate?"

Gather for each competitor:
- Alternative name
- Their strengths (where they win)
- Your differentiation (where you win)
- Feature-level comparison (specific capabilities, not just vibes)

Then ask: "What is the market trend you're betting on that competitors are ignoring?"

This produces the Strategic Bet section — the contrarian thesis that justifies your product's existence. Examples:
- "We bet that AI agents will need institutional memory, not just prompts"
- "We bet that local-first tools will win over cloud-dependent ones"

If the user says "none" or "skip" for competitors, write "No direct competitors identified" but still ask about the strategic bet.

#### 3e: Evidence (Traction + Impact)

Ask: "What evidence do you have that this product works?"

Gather what's available:
- **Usage data** — stars, downloads, clones, active users, installs
- **Measured impact** — bugs caught, time saved, regressions prevented, outcomes achieved
- **User feedback** — testimonials, retention signals, community activity

**Auto-gather if possible:**
- If the project has a GitHub remote, pull real metrics: `gh api repos/{owner}/{repo} --jq '{stars: .stargazers_count, forks: .forks_count, open_issues: .open_issues_count}'`
- If `.agents/` exists, count learnings, council verdicts, and retros as usage evidence
- If `GOALS.md` exists, pull fitness score as a quality metric

If the project is new with no evidence yet, write "Pre-traction — evidence to be gathered" and list what metrics to track.

#### 3f: Known Product Gaps

Ask: "What's broken, missing, or embarrassing about the product right now? Be honest."

This section is the most valuable one for internal product docs. It prevents the doc from being marketing copy. Gather:
- **Missing capabilities** — features users ask for that don't exist
- **Broken promises** — things the README claims that don't fully work
- **Onboarding friction** — where new users get stuck
- **Technical debt** — known limitations that affect product quality

If the user says "nothing", gently challenge: "Every product has gaps. What would a frustrated user complain about?" Push for at least 2 honest gaps.

#### 3g: Validated Principles (Auto-discovered)

**Do not ask the user.** Scan the project for extracted principles:

1. Check `.agents/planning-rules/` — compiled planning principles
2. Check `.agents/patterns/` — battle-tested patterns from usage
3. Check `.agents/learnings/` — accumulated learnings

If any exist, count them and note their source (e.g., "7 planning rules extracted from 544K agent messages"). These will be included in the output as "Validated Principles" — principles proven through usage, not just design assumptions.

If none exist, skip this section in the output.

### Step 4: Generate PRODUCT.md

Write `PRODUCT.md` to the target directory with this structure:

```markdown
---
last_reviewed: YYYY-MM-DD
---

# PRODUCT.md

## Mission

{mission from 3a}

## Vision

{one-sentence aspirational framing — what the world looks like if the product succeeds}

## Target Personas

### Persona 1: {role}
- **Goal:** {goal}
- **Pain point:** {pain point}
- **Gap exposure:** {which product gaps this persona feels most}

{repeat for each persona}

## What the Product Actually Is

{Describe the product's concrete layers/components. Not marketing copy — what it literally does.
 Organize by architectural layer, not by feature list. For each layer, explain what gap it closes.}

## Core Value Propositions

{bullet list from 3c — each value prop should map to a specific gap or outcome it closes}

## Design Principles

{If validated principles were discovered in 3g, include them here:}

**Validated Principles (from {source count} {source description}):**

1. **{Principle name}** — {one-line description with link to source}

{If no validated principles exist, include design principles from the interview.}

**Operational principles:**

{List the principles that govern how the product works, not just what it does.}

## Competitive Positioning

| Alternative | Where They Win | Where We Win |
|-------------|---------------|--------------|
{rows from 3d — honest about both sides}

## Strategic Bet

{From 3d — the contrarian thesis. What market trend is this product betting on?}

## Evidence

{From 3e — real numbers, not claims}

**Traction:**
- {metric}: {value} ({time period})

**Measured Impact:**
- {outcome}: {evidence}

{If pre-traction: "Pre-traction — tracking: {list of metrics to watch}"}

## Known Product Gaps

{From 3f — honest about what's broken}

| Gap | Impact | Status |
|-----|--------|--------|
| {gap description} | {who it affects and how} | {open / in-progress / planned} |

## Usage

This file enables product-aware reviews:

- **`$pre-mortem`** — Automatically loads product context when this file exists. Default `--quick` mode includes the context inline; deeper modes add a dedicated `product` perspective alongside plan-review judges.
- **`$vibe`** — Automatically loads developer-experience context when this file exists. Default `--quick` mode includes the context inline; deeper modes add a dedicated `developer-experience` perspective alongside code-review judges.
- **`$council --preset=product`** — Run product review on demand.
- **`$council --preset=developer-experience`** — Run DX review on demand.

Explicit `--preset` overrides from the user skip auto-include (user intent takes precedence).
```

Set `last_reviewed` to today's date (YYYY-MM-DD format).

### Step 5: Report

Tell the user:

1. **What was created:** `PRODUCT.md` at `{path}`
2. **What it unlocks:**
   - `$pre-mortem` will now load product context by default, including in `--quick` mode; deeper modes add a dedicated product perspective
   - `$vibe` will now load developer-experience context by default, including in `--quick` mode; deeper modes add a dedicated DX perspective
   - `$council --preset=product` and `$council --preset=developer-experience` are available on demand
3. **Next steps:** Suggest running `$pre-mortem` on their next plan to see product perspectives in action

## Examples

### Creating Product Doc for New Project

**User says:** `$product`

**What happens:**
1. Agent checks for existing PRODUCT.md, finds none
2. Agent reads README.md and package.json to extract project context
3. Agent asks user about mission, suggesting "CLI tool for automated dependency updates"
4. Agent interviews for 2 personas: DevOps Engineer and Backend Developer
5. Agent asks about value props, user provides: "Zero-config automation, Safe updates, Time savings"
6. Agent asks about competitors, gathers honest where-they-win and where-we-win for each
7. Agent asks for strategic bet: "We bet that dependency security will become a compliance requirement, not a best practice"
8. Agent auto-pulls GitHub stats (142 stars, 2.3K clones/14d) and asks about measured impact
9. Agent pushes for known gaps: user admits "onboarding is confusing" and "no Windows support"
10. Agent scans .agents/ — finds 12 planning rules and 45 learnings, includes as validated principles
11. Agent writes PRODUCT.md with Evidence, Competitive Positioning, Known Gaps, and Strategic Bet sections

**Result:** PRODUCT.md created with evidence-backed content, unlocking product-aware council perspectives in future validations.

### Updating Existing Product Doc

**User says:** `$product`

**What happens:**
1. Agent finds existing PRODUCT.md from 3 months ago
2. Agent prompts: "PRODUCT.md exists. What would you like to do?"
3. User selects "Update — keep existing content as defaults"
4. Agent reads current file, extracts mission and personas as suggestions
5. Agent asks about mission, user keeps existing one
6. Agent asks about personas, user adds new "Security Engineer" persona
7. Agent updates PRODUCT.md with new persona, updates `last_reviewed` date

**Result:** PRODUCT.md refreshed with additional persona, ready for next validation cycle.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| No context to pre-populate suggestions | Missing README or project metadata files | Continue with blank suggestions. Ask user to describe project in own words. Extract mission from conversation. |
| User unclear on personas vs users | Confusion about persona definition | Explain: "Personas are specific user archetypes with goals and pain points. Think of one real person who would use this." Provide example. |
| Competitive landscape feels forced | Genuinely novel product or niche tool | Accept "No direct competitors" as valid. Focus on alternative approaches (manual processes, scripts) rather than products. Still ask for strategic bet. |
| PRODUCT.md feels generic | Insufficient user input or rushed interview | Ask follow-up questions. Request specific examples. Challenge vague statements like "makes things easier" — easier how? Measured how? |
| User resists Known Gaps section | Discomfort admitting weaknesses | Explain: "This is an internal doc, not marketing. Honest gaps prevent the team from building on false assumptions. Every product has them." Push for at least 2. |
| No usage data available | Pre-launch or private project | Write "Pre-traction" with a list of metrics to track once launched. The section's presence reminds future updates to fill it in. |
| `gh api` fails or no GitHub remote | Private repo, no auth, or non-GitHub host | Skip auto-gather gracefully. Ask user to provide metrics manually. |
| No .agents/ directory for principles | Project doesn't use AgentOps | Skip the validated principles section entirely. Include user-stated design principles instead. |

## Local Resources

### scripts/

- `scripts/validate.sh`
