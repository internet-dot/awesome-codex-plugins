---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Execute

→ Creative work (feature, component, behavior change)? → **Design first. No code until design approved.**
  1. Explore project context → read authority docs, check for existing patterns
  2. Ask clarifying questions one at a time (prefer multiple choice)
  3. Propose 2-3 approaches with trade-offs and your recommendation
  4. Present design sections → get user approval after each
  5. Write spec → self-review → user review → transition to writing-plans
→ HARD GATE: Do NOT write code, scaffold projects, or invoke implementation skills until design is approved.

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context and authority boundary, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Checklist

You MUST create a task for each of these items and complete them in order:

1. **Explore project context** — check files, docs, recent commits, authority docs, CONTEXT.md
2. **Choose the path and scope** — real design? diagnosis? route accordingly or decompose first
3. **Offer visual companion** (if visual questions ahead) — own message, no other content
4. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
5. **Draft working artifacts** — `TaskIntentDraft`, `BaselineReadSetHint`, `ImpactStatementDraft`
6. **Propose 2-3 approaches** — with trade-offs and your recommendation
7. **Present design** — in sections scaled to complexity, get user approval after each
8. **Write design doc** — save to `docs/aegis/specs/YYYY-MM-DD-<topic>-design.md` and commit
9. **Spec self-review** — check for placeholders, contradictions, ambiguity, scope, boundary
10. **User reviews written spec** — ask user to review before proceeding
11. **Transition to implementation** — invoke writing-plans skill (terminal state)

**The terminal state is invoking writing-plans.** Do NOT invoke any other implementation skill.

## The Process

**Understanding the idea:**
- Check current project state first (files, docs, recent commits)
- Read relevant authority docs before asking deep questions
- If the request is diagnosis/root-cause/follow-up to an approved plan → route to correct workflow
- If the request spans multiple independent subsystems → flag and decompose first
- Ask clarifying questions one at a time, prefer multiple choice
- Separate facts, assumptions, unknowns while exploring

**Working artifacts:** Keep three drafts: `TaskIntentDraft` (outcome, scope, risks), `BaselineReadSetHint` (candidate docs, authority gaps), `ImpactStatementDraft` (affected layers, owners, invariants, compat, non-goals). Refresh when scope changes.

**Exploring approaches:** Propose 2-3 approaches with trade-offs and recommendation. Make scope boundary explicit: what's in, what's deferred, what belongs elsewhere.

**Presenting the design:** Scale sections to complexity. Cover: architecture, components, data flow, error handling, testing, compatibility boundary. Get approval after each section.

**Design for isolation:** Each unit = one clear purpose, well-defined interface, testable independently. Can someone understand it without reading internals? Can you change internals without breaking consumers?

**Existing codebases:** Follow existing patterns. Include targeted improvements only when they serve the current goal. If the design touches contracts, compat, fallbacks, or duplicated owners → call it out directly.

## After the Design

**Documentation:**

1. **Aegis Project Workspace initialization (first creation only):**
   If `docs/aegis/` does not exist and `scripts/aegis-workspace.py` is
   available in the active method-pack checkout, initialize the target project:
   `python scripts/aegis-workspace.py init --root <target-project-root>`.
   If the helper is unavailable, create it manually:
   a. Create `docs/aegis/README.md` — describes workspace purpose and structure
   b. Create `docs/aegis/INDEX.md` — empty index, will be appended below
   c. Create `docs/aegis/BASELINE-GOVERNANCE.md` from the template in
      "BASELINE-GOVERNANCE.md Template" section below
   d. If the project has existing code, create an initial baseline snapshot:
      `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md` using the
      "Initial Baseline Snapshot Template" below
   If `docs/aegis/` already exists, use it — do not recreate.

2. **Write the validated design (spec):**
   Save to `docs/aegis/specs/YYYY-MM-DD-<topic>-design.md`.
   Spec always goes to `specs/` — never to `work/`.

3. **Update INDEX.md:**
   Prefer the helper: `python scripts/aegis-workspace.py append-index --root
   <target-project-root> --path docs/aegis/specs/<filename>.md --kind spec
   --title "<title>"`. If the helper is unavailable, append the new spec entry
   to `docs/aegis/INDEX.md` manually.
   After the append, run `python scripts/aegis-workspace.py check --root
   <target-project-root>` when the helper is available. This validates
   structure and index coverage only; it does not grant completion authority.

4. Commit the design document to git.

5. Include the latest `TaskIntentDraft`, `BaselineReadSetHint`, and `ImpactStatementDraft` inline or in an appendix when they materially shaped the design.

6. Record explicit non-goals and compatibility boundaries so the later implementation plan does not drift.

**Spec Self-Review:**
After writing the spec document, look at it with fresh eyes:

1. **Placeholder scan:** Any "TBD", "TODO", incomplete sections, or vague requirements? Fix them.
2. **Internal consistency:** Do any sections contradict each other? Does the architecture match the feature descriptions?
3. **Scope check:** Is this focused enough for a single implementation plan, or does it need decomposition?
4. **Ambiguity check:** Could any requirement be interpreted two different ways? If so, pick one and make it explicit.
5. **Boundary check:** Did you clearly mark invariants, compatibility boundaries, owners, and non-goals?

Fix any issues inline. No need to re-review — just fix and move on.

**User Review Gate:**
After the spec review loop passes, ask the user to review the written spec before proceeding:

> "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we start writing out the implementation plan."

Wait for the user's response. If they request changes, make them and re-run the spec review loop. Only proceed once the user approves.

**Implementation:**

- Invoke the writing-plans skill to create a detailed implementation plan
- Do NOT invoke any other skill. writing-plans is the next step.

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on
- **Be flexible** - Go back and clarify when something doesn't make sense

## Visual Companion

A browser-based companion for showing mockups, diagrams, and visual options during brainstorming. Available as a tool — not a mode. Accepting the companion means it's available for questions that benefit from visual treatment; it does NOT mean every question goes through the browser.

**Offering the companion:** When you anticipate that upcoming questions will involve visual content (mockups, layouts, diagrams), offer it once for consent:
> "Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, diagrams, comparisons, and other visuals as we go. This feature is still new and can be token-intensive. Want to try it? (Requires opening a local URL)"

**This offer MUST be its own message.** Do not combine it with clarifying questions, context summaries, or any other content. The message should contain ONLY the offer above and nothing else. Wait for the user's response before continuing. If they decline, proceed with text-only brainstorming.

**Per-question decision:** Even after the user accepts, decide FOR EACH QUESTION whether to use the browser or the terminal. The test: **would the user understand this better by seeing it than reading it?**

- **Use the browser** for content that IS visual — mockups, wireframes, layout comparisons, architecture diagrams, side-by-side visual designs
- **Use the terminal** for content that is text — requirements questions, conceptual choices, tradeoff lists, A/B/C/D text options, scope decisions

A question about a UI topic is not automatically a visual question. "What does personality mean in this context?" is a conceptual question — use the terminal. "Which wizard layout works better?" is a visual question — use the browser.

If they agree to the companion, read the detailed guide before proceeding:
`skills/brainstorming/visual-companion.md`

## BASELINE-GOVERNANCE.md Template

When creating `docs/aegis/BASELINE-GOVERNANCE.md` for the first time, use this template:

```markdown
# Baseline Governance

## 1. Architecture Defect
A confirmed error, gap, or contradiction IN the baseline itself.
- Fix baseline first, then align implementation to corrected baseline.
- Do NOT patch implementation around a defective baseline.

## 2. Architecture Drift
Implementation has deviated from a confirmed, correct baseline.
- Return to baseline via the simplest path.
- Do NOT "update baseline to match drift" without explicit review.

## 3. Baseline Check Protocol
Before non-trivial changes:
1. Read the latest baseline snapshot in `baseline/`
2. Compare current code structure against ownership map
3. Compare current contracts against contract inventory
4. Check for new anti-patterns not recorded in known list
5. Report: aligned / minor drift (self-correctable) / material drift (needs review)

## 4. Architecture Review — 7 Dimensions
After each non-trivial change:
1. **Ownership integrity** — every component has exactly one canonical owner
2. **Module boundaries** — no unauthorized cross-module coupling
3. **Contract changes** — all API/signature/behavior contract changes documented
4. **Cascade proliferation** — no new cascading dependency chains
5. **Dependency direction** — dependencies flow toward stability
6. **Retirement completeness** — old owners/fallbacks/paths removed or scheduled
7. **Entropy flow** — net complexity decreased or stayed; no unjustified new entities

## 5. Hard Boundaries
- BASELINE-GOVERNANCE.md is the constitution for THIS project's Aegis workspace
- Baseline snapshots in `baseline/` are evidence, not authority
- ADRs in `adr/` record decisions; they do not replace baseline governance
- This file is NEVER auto-updated — changes require explicit user review
```

## Initial Baseline Snapshot Template

When creating the first `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`:

1. **Project structure** — top-level directory map, key entry points
2. **Tech stack** — language, framework, database, key dependencies
3. **Ownership mapping** — component → canonical owner file/module
4. **Contract inventory** — public APIs, published interfaces, data contracts
5. **Dependency direction convention** — which layers depend on which
6. **Test system** — framework, coverage baseline, test categories
7. **Build & deploy** — build system, CI pipeline, deploy targets
8. **Known anti-patterns** — patterns to avoid, previously identified issues
9. **Last review findings** — date, reviewer, key findings, open items
10. **Compatibility boundaries** — what must NOT break
