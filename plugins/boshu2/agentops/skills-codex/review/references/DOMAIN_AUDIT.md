
<!-- TOC: Core | Prompt | Domains | Output | Severity | Integration | Anti-Patterns | References -->

# Codebase Audit

> **Core Insight:** Different domains need different lenses. A security audit looks for injection; a UX audit looks for confusion. Same codebase, different questions.

## When to Use What

| Need | Skill |
|------|-------|
| Find and **report** domain-specific issues | **codebase-audit** (this) |
| Find bugs and **fix them iteratively** | multi-pass-bug-hunting |
| Evaluate **usability** specifically | ux-audit |
| Make UI **visually polished** | ui-polish |

---

## THE EXACT PROMPT

```
Perform a comprehensive [DOMAIN] audit of this codebase.

Domain: security | ux | performance | api | copy | cli

Return a detailed report with:
- File path and line numbers for each issue
- Severity (Critical/High/Medium/Low)
- Root cause analysis
- Recommended fix

Use the output template and domain checklist from references.
```

### Quick Multi-Domain Sweep

```
Run quick audits across: security, performance, api

For each domain: top 3 issues only, with severity and fix.
Total output under 100 lines.
```

---

## Domains at a Glance

| Domain | Key Question | Top Signals |
|--------|--------------|-------------|
| **security** | Can attackers exploit this? | injection, auth bypass, secrets in code |
| **ux** | Is this confusing? | accessibility, error handling, flows |
| **performance** | Is this slow? | N+1 queries, blocking I/O, missing cache |
| **api** | Is this pleasant to consume? | status codes, error format, pagination |
| **copy** | Is this clear? | jargon, tone, error messages |
| **cli** | Is this discoverable? | --help, exit codes, progress feedback |

Full checklists: [CHECKLISTS.md](references/CHECKLISTS.md)

---

## Output Template

```markdown
# [Domain] Audit Report: [Project]

## Summary
- **Total:** N findings
- **Critical:** X | **High:** Y | **Medium:** Z | **Low:** W

## Critical Findings

### [Title]
- **Location:** `file.rs:42`
- **Issue:** [What's wrong]
- **Root Cause:** [Why]
- **Fix:** [Solution]

## High / Medium / Low
[Same format, decreasing detail]
```

---

## Severity

| Level | Criteria | Example |
|-------|----------|---------|
| **Critical** | Exploitable now, data loss | SQL injection, unauth admin |
| **High** | Serious, harder to exploit | CSRF missing, N+1 on hot path |
| **Medium** | Real issue, limited scope | Missing validation, vague errors |
| **Low** | Polish, best practice | Naming inconsistency, missing docs |

---

## Workflow Integration

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ codebase-audit  │────▶│ Create beads for │────▶│ multi-pass-bug  │
│ (find + report) │     │ critical issues  │     │ hunting (fix)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

```bash
# After audit, create issues
br create --title="[Security] SQL injection in user_search" \
  --type=bug --priority=0 --body="Found at src/search.rs:42"
```

---

## Quick Grep Patterns

### Security
```bash
rg -n "unwrap\(\)|panic!" --type rust           # Rust panics
rg -n "eval\(|exec\(" --type js --type py       # Code injection
rg -n "password|secret|api_key" --type-not lock # Hardcoded secrets
```

### Performance
```bash
rg -n "for.*await|\.await.*for" --type rust     # Async in loops
rg -n "SELECT.*FROM.*WHERE" | grep -v "LIMIT"   # Unbounded queries
```

### CLI
```bash
./tool --help | head -20                        # Help exists?
./tool --unknown 2>&1; echo "Exit: $?"          # Error handling
```

More patterns: [TOOLS.md](references/TOOLS.md)

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| "code is bad" | Specific `file:line` + fix |
| Mix severities | Group by impact |
| Audit everything at once | One domain, deep |
| Skip root cause | Explain WHY, not just WHAT |
| Report-only | Create issues for criticals |

---

## References

| Topic | File |
|-------|------|
| Full domain checklists | [CHECKLISTS.md](references/CHECKLISTS.md) |
| Example audit reports | [EXAMPLES.md](references/EXAMPLES.md) |
| Tool commands by domain | [TOOLS.md](references/TOOLS.md) |
