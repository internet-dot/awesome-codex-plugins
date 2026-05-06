---

<!-- TOC: Quick Start | THE EXACT PROMPT | Polishing | br Commands | bd → br Migration | Quality Checklist | Troubleshooting | References -->

# Beads Workflow — From Plan to Actionable Tasks

> **Core Principle:** "Check your beads N times, implement once" — where N is as many as you can stomach.
>
> Beads are so detailed and polished that you can mechanically unleash a big swarm of agents to implement them, and it will come out just about perfectly.

## Quick Start

```bash
# 1. Initialize beads in project
br init

# 2. Convert plan to beads (see THE EXACT PROMPT below)

# 3. Polish iteratively
# Run polish prompt 6-9 times until steady-state

# 4. Validate
br dep cycles        # Must be empty
bv --robot-insights  # Check graph health

# 5. Begin implementation
bv --robot-next      # Get first bead
```

---

## THE EXACT PROMPT — Plan to Beads Conversion

```
OK so now read ALL of [YOUR_PLAN_FILE].md; please take ALL of that and elaborate on it and use it to create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.). The beads should be so detailed that we never need to consult back to the original markdown plan document. Remember to ONLY use the `br` tool to create and modify the beads and add the dependencies. Use ultrathink.
```

### Shorter Version

```
OK so please take ALL of that and elaborate on it more and then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.)  Use only the `br` tool to create and modify the beads and add the dependencies. Use ultrathink.
```

### What This Creates

- Tasks and subtasks with clear scope
- Dependency links (what blocks what)
- Detailed descriptions with background, reasoning, considerations
- Self-contained (never need to consult original plan)

---

## Polishing Beads

### THE EXACT PROMPT — Polish (Standard)

```
Reread AGENTS dot md so it's still fresh in your mind. Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things!

DO NOT OVERSIMPLIFY THINGS! DO NOT LOSE ANY FEATURES OR FUNCTIONALITY!

Also, make sure that as part of these beads, we include comprehensive unit tests and e2e test scripts with great, detailed logging so we can be sure that everything is working perfectly after implementation. Remember to ONLY use the `br` tool to create and modify the beads and to add the dependencies to beads. Use ultrathink.
```

### Polishing Protocol

1. Run polish prompt
2. Review changes
3. Repeat until steady-state (typically 6-9 rounds)
4. If it flatlines, start a fresh CC session
5. Optionally have Codex/GPT 5.5 do a final round

---

## Fresh Session Technique

If polishing flatlines, start a new Claude Code session:

### THE EXACT PROMPT — Re-establish Context

```
First read ALL of the AGENTS dot md file and README dot md file super carefully and understand ALL of both! Then use your code investigation agent mode to fully understand the code, and technical architecture and purpose of the project.  Use ultrathink.
```

### THE EXACT PROMPT — Then Review Beads

```
We recently transformed a markdown plan file into a bunch of new beads. I want you to very carefully review and analyze these using `br` and `bv`.
```

Then follow up with the standard polish prompt.

---


# Complete Beads Prompt Reference

## Table of Contents
- [Plan to Beads Conversion](#plan-to-beads-conversion)
- [Polishing Prompts](#polishing-prompts)
- [Fresh Session Prompts](#fresh-session-prompts)
- [Test Coverage](#test-coverage)

---

## Plan to Beads Conversion

### THE EXACT PROMPT — Full Version

```
OK so now read ALL of [YOUR_PLAN_FILE].md; please take ALL of that and elaborate on it and use it to create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.). The beads should be so detailed that we never need to consult back to the original markdown plan document. Remember to ONLY use the `br` tool to create and modify the beads and add the dependencies. Use ultrathink.
```

**Replace** `[YOUR_PLAN_FILE].md` with your actual plan filename.

### THE EXACT PROMPT — Short Version

```
OK so please take ALL of that and elaborate on it more and then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.)  Use only the `br` tool to create and modify the beads and add the dependencies. Use ultrathink.
```

**Use when:** Plan is already in context from earlier conversation.

---

## Polishing Prompts

### THE EXACT PROMPT — Polish (Standard)

```
Reread AGENTS dot md so it's still fresh in your mind. Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things!

DO NOT OVERSIMPLIFY THINGS! DO NOT LOSE ANY FEATURES OR FUNCTIONALITY!

Also, make sure that as part of these beads, we include comprehensive unit tests and e2e test scripts with great, detailed logging so we can be sure that everything is working perfectly after implementation. Remember to ONLY use the `br` tool to create and modify the beads and to add the dependencies to beads. Use ultrathink.
```

### THE EXACT PROMPT — Polish (Full with Plan Reference)

```
Reread AGENTS dot md so it's still fresh in your mind. Then read ALL of [YOUR_PLAN_FILE].md . Use ultrathink. Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things! DO NOT OVERSIMPLIFY THINGS! DO NOT LOSE ANY FEATURES OR FUNCTIONALITY! Also make sure that as part of the beads we include comprehensive unit tests and e2e test scripts with great, detailed logging so we can be sure that everything is working perfectly after implementation. It's critical that EVERYTHING from the markdown plan be embedded into the beads so that we never need to refer back to the markdown plan and we don't lose any important context or ideas or insights into the new features planned and why we are making them.
```

**Use when:** You want to ensure nothing from the original plan was lost.

### Polishing Protocol

```
Round 1 → Significant changes expected
Round 2 → Moderate changes
Round 3 → Fewer changes
...
Round 6-9 → Steady-state (minimal changes)

If flatlines early → Start fresh CC session
Cross-model review → Have Codex/GPT 5.5 do final round
```

---

## Fresh Session Prompts

When polishing flatlines, start a brand new Claude Code session:

### THE EXACT PROMPT — Step 1: Re-establish Context

```
First read ALL of the AGENTS dot md file and README dot md file super carefully and understand ALL of both! Then use your code investigation agent mode to fully understand the code, and technical architecture and purpose of the project.  Use ultrathink.
```

### THE EXACT PROMPT — Step 2: Review Beads

```
We recently transformed a markdown plan file into a bunch of new beads. I want you to very carefully review and analyze these using `br` and `bv`.
```

### THE EXACT PROMPT — Step 3: Polish

Then follow with the standard polish prompt.

---

## Test Coverage

### THE EXACT PROMPT — Add Test Beads

```
Do we have full unit test coverage without using mocks/fake stuff? What about complete e2e integration test scripts with great, detailed logging? If not, then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid with detailed comments.
```

**Use when:** Feature beads exist but test coverage is unclear.

---

## Cross-Model Review Pattern

| Model | Role | Prompt |
|-------|------|--------|
| Claude/Opus | Primary creation | Plan to Beads (Full) |
| Claude/Opus | Multiple polish rounds | Polish (Standard) |
| Codex/GPT 5.5 | Final review | Polish (Standard) |
| Gemini | Alternative perspective | Fresh Session → Review |

---

## Prompt Usage Summary

| Stage | Prompt | Repetitions |
|-------|--------|-------------|
| Initial conversion | Plan to Beads | 1x |
| Polishing | Polish (Standard) | 6-9x |
| Flatline recovery | Fresh Session | As needed |
| Test coverage | Add Test Beads | 1x |
| Final review | Polish (cross-model) | 1-2x |
# Bead Anatomy — What Makes a Good Bead

## Table of Contents
- [Example Bead](#example-bead)
- [Required Elements](#required-elements)
- [Description Guidelines](#description-guidelines)
- [Anti-Patterns](#anti-patterns)

---

## Example Bead

A well-formed bead looks like:

```
ID: bd-7f3a2c
Title: Implement OAuth2 login flow
Type: feature
Priority: P1
Status: open

Dependencies: [bd-e9b1d4 (User model), bd-c4d5e6 (Session management)]
Blocks: [bd-a1b2c3 (Protected routes), bd-f7g8h9 (User dashboard)]

Description:
Implement OAuth2 login flow supporting Google and GitHub providers.

## Background
This is the primary authentication mechanism for the application.
Users should be able to sign in with existing Google/GitHub accounts
to reduce friction.

## Technical Approach
- Use NextAuth.js for OAuth2 implementation
- Store provider tokens encrypted in Supabase
- Create unified user record on first login
- Handle account linking for multiple providers

## Success Criteria
- User can click "Sign in with Google/GitHub"
- OAuth flow completes and redirects to dashboard
- User record created/updated in database
- Session cookie set correctly
- Logout clears session properly

## Test Plan
- Unit: Token encryption/decryption
- Unit: User record creation
- E2E: Full OAuth flow (mock provider)
- E2E: Account linking scenario

## Considerations
- Handle provider API rate limits
- Graceful degradation if provider is down
- GDPR compliance for EU users
```

---

## Required Elements

| Element | Purpose | Example |
|---------|---------|---------|
| **ID** | Unique identifier | `bd-7f3a2c` |
| **Title** | Clear, actionable | "Implement OAuth2 login flow" |
| **Type** | Categorization | `feature`, `bug`, `task`, `epic` |
| **Priority** | Importance (P0-P4) | `P1` (high) |
| **Status** | Current state | `open`, `in_progress`, `closed` |
| **Dependencies** | What blocks this | List of bead IDs |
| **Description** | Self-contained context | Markdown with sections |

---

## Description Guidelines

### Must Include

| Section | Content |
|---------|---------|
| **Background** | Why this exists, context |
| **Technical Approach** | How to implement |
| **Success Criteria** | How to verify done |
| **Test Plan** | Unit + E2E tests |
| **Considerations** | Edge cases, risks |

### Good Description Properties

1. **Self-contained** — Never need to refer back to original plan
2. **Self-documenting** — Future you can understand it
3. **Verbose** — More detail is better than less
4. **Actionable** — Clear what to do

### Description Checklist

- [ ] Background explains WHY
- [ ] Technical approach explains HOW
- [ ] Success criteria define DONE
- [ ] Test plan ensures QUALITY
- [ ] Considerations prevent SURPRISES

---

## Anti-Patterns

### Too Short

```
# BAD
Title: Fix login
Description: Fix the login bug
```

### Too Vague

```
# BAD
Title: Improve authentication
Description: Make auth better
```

### Missing Dependencies

```
# BAD
Title: Implement protected routes
Description: Add route protection
# No mention of auth dependency!
```

### Oversimplified

```
# BAD (lost complexity)
Title: Add user management
Description: CRUD for users

# GOOD (preserves complexity)
Title: Add user management with role-based access
Description:
## Background
Users need CRUD operations with granular permissions.
Admin users can manage all users; regular users can only
view/edit their own profile.

## Technical Approach
- Implement RBAC middleware
- Create admin-only routes
- Add ownership validation
- Handle permission errors gracefully
...
```

---

## Creating Beads with br

### Basic Creation

```bash
br create "Implement OAuth2 login flow" \
  --type feature \
  --priority 1 \
  --description "$(cat description.md)"
```

### Add Dependencies After

```bash
br dep add bd-7f3a2c bd-e9b1d4  # OAuth depends on User model
br dep add bd-7f3a2c bd-c4d5e6  # OAuth depends on Session mgmt
```

### Add Labels

```bash
br label add bd-7f3a2c auth backend security
```

### View Complete Bead

```bash
br show bd-7f3a2c
# or
br show bd-7f3a2c --json | jq
```

---

## Bead Types

| Type | Use For |
|------|---------|
| `epic` | Large features with many sub-beads |
| `feature` | New functionality |
| `task` | Non-feature work (config, setup) |
| `bug` | Defect fix |
| `chore` | Maintenance, cleanup |

---

## Priority Levels

| Priority | Meaning | When to Use |
|----------|---------|-------------|
| P0 | Critical | Blocking release, security |
| P1 | High | Core feature, important |
| P2 | Medium | Nice to have this sprint |
| P3 | Low | Future work |
| P4 | Backlog | Maybe someday |

---

## Dependency Best Practices

### Do

- Make ALL blocking relationships explicit
- Use bidirectional awareness (A blocks B, B depends on A)
- Keep dependency chains shallow when possible
- Validate no cycles: `br dep cycles`

### Don't

- Create circular dependencies
- Leave implicit dependencies
- Skip dependencies because "it's obvious"
- Create deep chains that serialize all work
