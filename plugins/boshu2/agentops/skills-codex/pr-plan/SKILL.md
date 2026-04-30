---
name: pr-plan
description: 'Plan an open source PR.'
---
# PR Plan Skill

Strategic planning for open source contributions.

## Overview

Create a contribution plan that bridges research and implementation. Takes
`$pr-research` output and produces an actionable plan.

**Output:** `.agents/plans/YYYY-MM-DD-pr-plan-{repo-slug}.md`

**When to Use**:
- After completing `$pr-research`
- Planning contribution strategy
- Before starting implementation

**When NOT to Use**:
- Haven't researched the repo yet
- Trivial contributions (fix typos)
- Internal project planning (use `$plan`)

---

## Workflow

```
0.  Input Discovery     -> Find/load pr-research artifact
1.  Scope Definition    -> What exactly to contribute
2.  Target Selection    -> Which issues/areas to address
3.  Criteria Definition -> Acceptance criteria from research
4.  Risk Assessment     -> What could go wrong
5.  Strategy Formation  -> Implementation approach
6.  Output              -> Write plan artifact
```

---

## Phase 1: Scope Definition

### Scope Questions

| Question | Why It Matters |
|----------|----------------|
| What specific functionality? | Clear deliverable |
| Which files/packages? | Limits impact surface |
| What's explicitly out of scope? | Prevents scope creep |
| Single PR or series? | Sets expectations |

### Scope Template

```markdown
## Scope

**Contribution**: [1-2 sentences describing the change]

**Affected Areas**:
- `path/to/file.go` - [what changes]

**Out of Scope**:
- [Related but excluded work]
```

---

## Phase 3: Acceptance Criteria

Define success from maintainer perspective:

```markdown
## Acceptance Criteria

### Code Quality
- [ ] Follows project coding style
- [ ] Passes existing tests
- [ ] Adds tests for new functionality
- [ ] No linting warnings

### PR Requirements
- [ ] Title follows convention
- [ ] Body uses project template
- [ ] Size within acceptable range
- [ ] Single logical change

### Project-Specific
- [ ] [Any project-specific requirements from research]
```

---

## Phase 4: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PR review takes > 2 weeks | Medium | Medium | Start small, be responsive |
| Scope expands during review | Medium | High | Define scope clearly upfront |
| Breaking change discovered | Low | High | Test against multiple versions |

---

## Phase 5: Implementation Strategy

```markdown
## Implementation Strategy

### Approach

1. **Setup**: Fork repo, configure dev environment
2. **Understand**: Read existing code in affected area
3. **Implement**: Make changes following project patterns
4. **Test**: Run existing tests + add new tests
5. **Document**: Update any affected documentation
6. **Submit**: Create PR following project conventions

### Pre-Implementation Checklist

- [ ] Fork created and up-to-date with upstream
- [ ] Dev environment working
- [ ] Issue claimed or comment posted
- [ ] Recent repo activity reviewed
```

---

## Output Template

Write to `.agents/plans/YYYY-MM-DD-pr-plan-{repo-slug}.md`

```markdown
# PR Plan: {repo-name}

## Executive Summary
{2-3 sentences: what you're contributing, why, expected outcome}

## Scope
**Contribution**: {description}
**Affected Areas**: [list]
**Out of Scope**: [list]

## Target
**Primary Issue**: #{N} - {title}

## Acceptance Criteria
[checklist]

## Risk Assessment
[table]

## Implementation Strategy
[numbered steps]

## Next Steps
1. Claim/comment on target issue
2. Fork and set up development environment
3. Implement following strategy
4. Run `$pr-prep` when ready
```

---

## Workflow Integration

```
$pr-research <repo> -> $pr-plan <research> -> implement -> $pr-prep
```

## Examples

### Plan a Focused External Contribution

**User says:** "Create a contribution plan from my PR research artifact."

**What happens:**
1. Extract accepted conventions and constraints.
2. Define scope boundaries and acceptance criteria.
3. Produce an implementation strategy with risks.

### Tighten Scope Before Coding

**User says:** "Check if this PR plan is too large for one submission."

**What happens:**
1. Compare proposed changes to historical PR size patterns.
2. Split oversized scope into phased contributions.
3. Emit a revised plan and next-step checklist.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Plan has vague acceptance criteria | Criteria not measurable | Convert criteria to concrete behavioral checks |
| Scope too broad | Multiple concerns mixed | Split by user-visible change or subsystem boundary |
| Risk section is weak | Missing failure-mode analysis | Add integration, review, and rollback risks explicitly |
| Plan conflicts with repo norms | Research artifact incomplete | Re-run `$pr-research` and refresh constraints |

## Local Resources

### scripts/

- `scripts/validate.sh`


