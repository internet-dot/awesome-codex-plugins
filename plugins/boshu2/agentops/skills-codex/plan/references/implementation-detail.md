# Implementation Detail Generation

> Extracted from plan/SKILL.md on 2026-04-11.
> Symbol-level implementation detail for every file in the plan.

After exploring the codebase, generate symbol-level implementation detail for EVERY file in the plan. This is what separates actionable specs from vague descriptions. A worker reading the plan should know exactly what to write without rediscovering function names, parameters, or code locations.

## File Inventory Table

Start with a `## Files to Modify` table listing EVERY file the plan touches:

```markdown
## Files to Modify

| File | Change |
|------|--------|
| `src/auth/middleware.go` | Add rate limit check to `AuthMiddleware` |
| `src/config/config.go` | Add `RateLimit` section to `Config` struct |
| `src/auth/middleware_test.go` | **NEW** — rate limit middleware tests |
```

Mark new files with `**NEW**`. This table gives the implementer the full blast radius in 30 seconds.

## Per-Section Implementation Specs

For each logical change group, provide symbol-level detail:

1. **Exact function signatures** — name the function, its parameters, and what changes:
   - "Add `worktreePath string` parameter to `classifyRunStatus`"
   - "Create new `RPIConfig` struct with `WorktreeMode string` field"

2. **Key functions to reuse** — with `file:line` references from the explore step:
   - "Reuse `readRunHeartbeat()` at `rpi_phased.go:1963`"
   - "Call existing `parsePhasedState()` at `rpi_phased.go:1924`"

3. **Inline code blocks** — for non-obvious constructs (struct definitions, CLI flags, config snippets). Verify all inline snippets compile with `go build ./...` before including them in issue descriptions — workers copy them verbatim:
   ```go
   type RPIConfig struct {
       WorktreeMode string `yaml:"worktree_mode" json:"worktree_mode"`
   }
   ```

4. **New struct fields with tags** — exact field names and JSON/YAML tags

5. **CLI flag definitions** — exact flag names, types, defaults, and help text

## Named Test Functions

For each test file, list specific test functions with one-line descriptions:

```markdown
**`src/auth/middleware_test.go`** — add:
- `TestRateLimitMiddleware_UnderLimit`: Request within limit returns 200
- `TestRateLimitMiddleware_OverLimit`: Request exceeding limit returns 429
- `TestRateLimitMiddleware_ResetAfterWindow`: Counter resets after time window
```

## Test Level Classification

For each test in the plan, classify its pyramid level per the test pyramid standard (`test-pyramid.md` in the standards skill):

| Test | Level | Rationale |
|------|-------|-----------|
| `TestRateLimitMiddleware_UnderLimit` | L1 (Unit) | Single function behavior in isolation |
| `TestRateLimitMiddleware_Integration` | L2 (Integration) | Middleware + config store interaction |
| `TestRateLimitMiddleware_E2E` | L3 (Component) | Full request pipeline with mocked Redis |

Include `test_levels` metadata in each issue's validation block:
```json
{
  "test_levels": {
    "required": ["L0", "L1"],
    "recommended": ["L2"],
    "rationale": "Reason for level selection"
  }
}
```

Agents own L0–L3 autonomously. L4+ requires human-defined scenarios — flag these as "human gate" items in the plan.

## Verification Procedures

Add a `## Verification` section with runnable bash sequences that reproduce the scenario and confirm the fix:

```markdown
## Verification

1. **Unit tests**: `go test ./src/auth/ -run "TestRateLimit" -v`
2. **Build check**: `go build ./...`
3. **Manual simulation**:
   ```bash
   # Start server
   go run ./cmd/server/ &
   # Hit endpoint 11 times (limit is 10)
   for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/api; done
   # Last request should return 429
   ```
```

**Why this matters:** The golden plan pattern (file tables + symbol-level specs + verification procedures) enabled single-pass implementation of an 8-file, 5-area change with zero ambiguity. Category-level specs ("modify classifyRunStatus") force implementers to rediscover symbols, causing divergence and rework.

## Data Transformation Mapping Tables (Mandatory for Filtering)

When a plan declares any struct-level filtering, exclusion, or allowlist logic:
- Create an explicit mapping table showing **source field → output transformation**
- Format: source name → fields affected → transformation (zeroed, renamed, computed)

Example from context orchestration (na-0v2):

| Section Name | Fields Zeroed |
|---|---|
| `HISTORY` | `Sessions` |
| `INTEL` | `Learnings`, `Patterns` |
| `TASK` | `BeadID`, `Predecessor` |

**Why:** Without explicit mapping tables, workers misinterpret data transformations. In na-0v2, section→field mapping ambiguity was caught only in pre-mortem. An explicit table prevents the concern entirely.

## Symbol Verification

For each function, struct, or type cited in the plan's implementation specs, grep the codebase to verify it exists:

```bash
# For each symbol referenced in the plan
grep -rn "func <symbolName>" --include="*.go" . 2>/dev/null
grep -rn "type <symbolName>" --include="*.go" . 2>/dev/null
grep -rn "class <symbolName>" --include="*.py" . 2>/dev/null
```

**If >20% of cited symbols are stale (not found in codebase):**
- **WARN** with list of stale references and their plan locations
- Do NOT block — stale refs may indicate renamed symbols that workers can resolve
- Log stale refs to plan document under `## Stale Symbol Warnings`

**Opt-out:** `--skip-symbol-check` flag (for greenfield plans where symbols don't yet exist).
