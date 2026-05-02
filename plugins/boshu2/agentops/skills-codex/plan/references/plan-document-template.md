# Plan Document Template

> Extracted from plan/SKILL.md on 2026-04-11.
> Canonical template written to `.agents/plans/YYYY-MM-DD-<goal-slug>.md` at Step 6.

**Baseline Audit Gate (mechanical):** Before writing the plan, verify the `## Baseline Audit` table has at least 1 row with both a command and a result:
- If `## Baseline Audit` is empty or missing: **BLOCK** with "Plan lacks baseline audit. Run quantitative checks first."
- If any row has a command but no result (or vice versa): **WARN** with "Incomplete audit row — run the command and record the result."
- **Opt-out:** `--skip-audit-gate` flag (for documentation-only plans with no quantitative claims).

```markdown
---
id: plan-YYYY-MM-DD-<goal-slug>
type: plan
date: YYYY-MM-DD
source: "[[.agents/research/YYYY-MM-DD-<research-slug>]]"
---

# Plan: <Goal>

## Context
<1-2 paragraphs explaining the problem, current state, and why this change is needed. Include `Applied findings: <id, id, ...>` from `.agents/planning-rules/*.md` first, with `.agents/findings/registry.jsonl` as fallback.>

Applied findings:
- `<finding-id>` — `<how it changed the plan>`

## Files to Modify

| File | Change |
|------|--------|
| `path/to/file.go` | Description of change |
| `path/to/new_file.go` | **NEW** — description |

> **Codex parity rule:** Whenever this table includes a `skills/<name>/` path, default-include the matching `skills-codex/<name>/` path on the same row (or a paired row) and add `scripts/regen-codex-hashes.sh` to the validation step. Skipping the codex mirror produces silent parity drift caught only by CI.

## Boundaries

**Always:** <non-negotiable requirements — security, backward compat, testing, etc.>
**Ask First:** <decisions needing human input before proceeding — in auto mode, logged only>
**Never:** <explicit out-of-scope items preventing scope creep>

## Baseline Audit

| Metric | Command | Result |
|--------|---------|--------|
| <what was measured> | `<grep/wc/ls command used>` | <result> |

## Implementation

### 1. <Change Group Name>

In `path/to/file.go`:

- **Modify `functionName`**: Add `paramName Type` parameter. If `paramName != ""` and condition, return `"value"`.

- **Add `NewStruct`**:
  ```go
  type NewStruct struct {
      FieldName string `json:"field_name,omitempty"`
  }
  ```

- **Key functions to reuse:**
  - `existingHelper()` at `path/to/file.go:123`
  - `anotherFunc()` at `path/to/other.go:456`

### 2. <Next Change Group>

<Same pattern — exact symbols, inline code, reuse references>

## Tests

**`path/to/file_test.go`** — add:
- `TestFunctionName_ScenarioA`: Input X produces output Y
- `TestFunctionName_ScenarioB`: Edge case Z handled correctly

**`path/to/new_test.go`** — **NEW**:
- `TestNewFeature_HappyPath`: Normal flow succeeds
- `TestNewFeature_ErrorCase`: Bad input returns error

## Conformance Checks

| Issue | Check Type | Check |
|-------|-----------|-------|
| Issue 1 | content_check | `{file: "src/auth.go", pattern: "func Authenticate"}` |
| Issue 1 | tests | `go test ./src/auth/...` |
| Issue 2 | files_exist | `["docs/api-v2.md"]` |

## Verification

1. **Unit tests**: `go test ./path/to/ -run "TestFoo" -v`
2. **Full suite**: `go test ./... -short -timeout 120s`
3. **Manual simulation**:
   ```bash
   # Create test scenario
   mkdir -p .test/data
   echo '{"key": "value"}' > .test/data/input.json
   # Run the tool
   ./bin/tool --flag value
   # Verify expected output
   cat .test/data/output.json  # Should show "result"
   ```

## Issues

### Issue 1: <Title>
**Dependencies:** None
**Acceptance:** <how to verify>
**Description:** <what to do — reference Implementation section for symbol-level detail>

### Issue 2: <Title>
**Dependencies:** Issue 1
**Acceptance:** <how to verify>
**Description:** <what to do>

## Execution Order

**Wave 1** (parallel): Issue 1, Issue 3
**Wave 2** (after Wave 1): Issue 2, Issue 4
**Wave 3** (after Wave 2): Issue 5

## Planning Rules Compliance

| Rule | Status | Justification |
|------|--------|---------------|
| PR-001: Mechanical Enforcement | PASS / N-A | [justification] |
| PR-002: External Validation | PASS / N-A | [justification] |
| PR-003: Feedback Loops | PASS / N-A | [justification] |
| PR-004: Separation Over Layering | PASS / N-A | [justification] |
| PR-005: Process Gates First | PASS / N-A | [justification] |
| PR-006: Cross-Layer Consistency | PASS / N-A | [justification] |
| PR-007: Phased Rollout | PASS / N-A | [justification] |

Unchecked rules: 0

## Post-Merge Cleanup

After bulk-merging wave results, audit for scaffold-era names:
- Rename placeholder function/variable names (e.g., `handleThing`, `processItem`) to domain-specific names
- Search with `grep -rn 'TODO\|FIXME\|HACK\|XXX' <modified-files>` for deferred cleanup markers
- If any `skills/` files were modified, run `scripts/regen-codex-hashes.sh` to sync codex parity and copy reference files.

## Next Steps
- Run `/pre-mortem` to validate plan
- Run `/crank` for autonomous execution
- Or `/implement <issue>` for single issue
```
