---
name: pr-retro
description: 'Learn from PR outcomes.'
---
# PR Retro Skill

Learn from PR outcomes by analyzing accept/reject patterns.

## Overview

After a PR is merged or rejected, analyze what worked and what didn't to
improve future contributions.

**Output:** `.agents/learnings/YYYY-MM-DD-pr-{repo}-{outcome}.md`

**When to Use**:
- After a PR is merged (capture success patterns)
- After a PR is rejected (understand why)
- After receiving significant review feedback
- Periodically to review contribution patterns

---

## Workflow

```
1.  PR Discovery    -> Find the PR to analyze
2.  Outcome Analysis -> Merged/rejected/changes requested
3.  Feedback Extraction -> What did reviewers say?
4.  Pattern Identification -> What worked/didn't
5.  Lesson Extraction -> Reusable learnings
6.  Output -> Write retro document
```

---

## Phase 1: PR Discovery

```bash
# If PR number provided
gh pr view <number> --json state,reviews,comments,mergedAt,closedAt

# Find recent PRs by you
gh pr list --state all --author @me --limit 10

# Find PRs to a specific repo
gh pr list -R <owner/repo> --state all --author @me --limit 10
```

---

## Phase 2: Outcome Analysis

| Outcome | Meaning | Focus |
|---------|---------|-------|
| **Merged** | Success | What worked? |
| **Closed (not merged)** | Rejected | Why? |
| **Open (stale)** | Ignored/abandoned | What went wrong? |
| **Changes requested** | Needs work | What feedback? |

```bash
# Get PR outcome
gh pr view <number> --json state,mergedAt,closedAt,reviews
```

---

## Phase 3: Feedback Extraction

```bash
# Get all review comments
gh pr view <number> --json reviews --jq '.reviews[] | "\(.author.login): \(.body)"'

# Get all comments
gh api repos/<owner>/<repo>/pulls/<number>/comments --jq '.[].body'

# Get requested changes
gh pr view <number> --json reviews --jq '.reviews[] | select(.state == "CHANGES_REQUESTED")'
```

### Feedback Categories

| Category | Examples |
|----------|----------|
| **Style** | Naming, formatting, conventions |
| **Technical** | Algorithm, architecture, patterns |
| **Scope** | Too big, scope creep, unrelated changes |
| **Testing** | Missing tests, coverage, edge cases |
| **Documentation** | Missing docs, unclear comments |
| **Process** | Wrong branch, missing sign-off |

---

## Phase 4: Pattern Identification

### Success Patterns (If Merged)

| What Worked | Evidence |
|-------------|----------|
| Small, focused PR | < 5 files |
| Followed conventions | No style comments |
| Good tests | No "add tests" requests |
| Clear description | Quick approval |

### Failure Patterns (If Rejected)

| What Failed | Evidence |
|-------------|----------|
| Too large | "Please split this PR" |
| Scope creep | "This is out of scope" |
| Missing tests | "Please add tests" |
| Wrong approach | "Consider using X instead" |

---

## Phase 5: Lesson Extraction

### Lesson Template

```markdown
## Lesson: [Title]

**Context**: [When does this apply?]
**Learning**: [What did we learn?]
**Action**: [What to do differently?]

**Evidence**:
- PR #N: [quote or summary]
```

### Common Lessons

| Lesson | Action |
|--------|--------|
| PR too large | Split PRs under 200 lines |
| Missing context | Add "## Context" section |
| Style mismatch | Run linter before PR |
| Missing tests | Add tests for new code |
| Slow review | Ping after 1 week |

---

## Phase 6: Output

Write to `.agents/learnings/YYYY-MM-DD-pr-{repo}-{outcome}.md`

```markdown
# PR Retro: {repo} #{number}

**Date**: YYYY-MM-DD
**PR**: {url}
**Outcome**: Merged / Rejected / Stale

## Summary

{What was the PR about? What happened?}

## Timeline

| Date | Event |
|------|-------|
| {date} | PR opened |
| {date} | First review |
| {date} | {outcome} |

## Feedback Analysis

### Positive Feedback
- {quote}

### Requested Changes
- {quote}

### Rejection Reasons (if applicable)
- {quote}

## Lessons Learned

### Lesson 1: {title}
**Context**: {when this applies}
**Learning**: {what we learned}
**Action**: {what to do differently}

## Updates to Process

{Any changes to make to pr-prep, pr-plan, or other skills}

## Next Steps

{Future actions based on this retro}
```

---

## Anti-Patterns

| DON'T | DO INSTEAD |
|-------|------------|
| Skip retros on merged PRs | Learn from success too |
| Blame maintainers | Focus on what YOU can change |
| Generic lessons | Specific, actionable learnings |
| Skip rejected PRs | Most valuable learning source |

## Examples

### Learn From Rejected PR

**User says:** "Run a retro on why this PR was rejected."

**What happens:**
1. Analyze reviewer feedback and timeline.
2. Identify preventable process and scope issues.
3. Capture reusable lessons for future PRs.

### Learn From Successful Merge

**User says:** "Extract what worked from this merged PR."

**What happens:**
1. Identify patterns that sped review/approval.
2. Distill actionable playbook updates.
3. Save lessons for future contribution flows.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Retro is generic | Feedback not tied to evidence | Cite specific comments/decisions and outcomes |
| No clear lesson extracted | Analysis stayed descriptive | Convert observations into behavior changes |
| Maintainer signal is mixed | Contradictory review comments | Separate hard blockers from preference feedback |
| Process changes not adopted | Lessons not operationalized | Add explicit updates to prep/plan/validate workflow |

## Local Resources

### scripts/

- `scripts/validate.sh`


