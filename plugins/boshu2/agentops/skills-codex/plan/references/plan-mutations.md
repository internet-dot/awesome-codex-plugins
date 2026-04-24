# Plan Mutation Protocol

> Structured mid-execution plan changes with audit trail. Plans are living documents, not contracts.

## Problem

During `$crank` execution, plans often need modification:
- A task turns out to be more complex than estimated (needs splitting)
- A dependency is discovered mid-implementation (needs reordering)
- A task becomes unnecessary after another task completes (needs skipping)
- An overlooked concern surfaces during a wave (needs insertion)

Without a mutation protocol, these changes happen ad-hoc with no audit trail.

## Mutation Operations

### Split
Break one task into two or more sub-tasks.

```yaml
mutation:
  type: split
  original_task: "ag-123: Add auth middleware"
  new_tasks:
    - "ag-123a: Add JWT validation middleware"
    - "ag-123b: Add session store integration"
  reason: "Task too large for single worker; JWT and session concerns are independent"
  wave: 3
  timestamp: "2026-03-21T10:15:00Z"
```

### Insert
Add a new task that wasn't in the original plan.

```yaml
mutation:
  type: insert
  new_task: "ag-124: Add rate limiting to auth endpoints"
  after: "ag-123"
  reason: "Security review identified missing rate limiting; must be added before auth goes live"
  wave: 3
  timestamp: "2026-03-21T10:20:00Z"
```

### Skip
Mark a task as unnecessary without deleting it.

```yaml
mutation:
  type: skip
  task: "ag-125: Migrate legacy auth tokens"
  reason: "Legacy token support removed in ag-120; no tokens to migrate"
  wave: 4
  timestamp: "2026-03-21T11:00:00Z"
```

### Reorder
Change task execution order or wave assignment.

```yaml
mutation:
  type: reorder
  task: "ag-126: Update API docs"
  from_wave: 5
  to_wave: 3
  reason: "API docs needed by frontend team before wave 5; moving earlier"
  wave: 3
  timestamp: "2026-03-21T10:30:00Z"
```

### Abandon
Stop working on a plan entirely. Requires justification.

```yaml
mutation:
  type: abandon
  reason: "Requirements changed; stakeholder redirected to different approach"
  wave: 2
  timestamp: "2026-03-21T09:45:00Z"
```

## Audit Trail

All mutations are logged to `.agents/plans/<epic-id>-mutations.jsonl`:

```jsonl
{"type":"split","original":"ag-123","new":["ag-123a","ag-123b"],"reason":"...","wave":3,"ts":"2026-03-21T10:15:00Z"}
{"type":"insert","task":"ag-124","after":"ag-123","reason":"...","wave":3,"ts":"2026-03-21T10:20:00Z"}
{"type":"skip","task":"ag-125","reason":"...","wave":4,"ts":"2026-03-21T11:00:00Z"}
```

One line per mutation, append-only (JSONL format for streaming reads).

## Integration with $crank

### When to Mutate
Crank's orchestrator decides to mutate when:

1. **Worker failure classified as DECOMPOSE** → trigger `split` mutation
2. **Cross-wave dependency discovered** → trigger `reorder` mutation
3. **Task validation reveals new requirement** → trigger `insert` mutation
4. **Task made unnecessary by prior wave** → trigger `skip` mutation

### Mutation Budget
- **Splits:** Unlimited (decomposition is healthy)
- **Inserts:** Max 5 per epic (prevents scope creep)
- **Skips:** Unlimited (pruning is healthy)
- **Reorders:** Max 3 per epic (excessive reordering = bad initial plan)
- **Abandon:** 1 (terminal)

If insert budget exceeded: log warning and suggest `$plan` re-run instead.

### Crank Checkpoint Integration
After any mutation, write to the wave checkpoint:

```json
{
  "mutations_this_wave": [
    {"type": "split", "task": "ag-123", "reason": "..."}
  ],
  "total_mutations": 3
}
```

## Integration with $plan

### Adversarial Review Gate
Before finalizing a plan, optionally spawn a reviewer (strongest available model) to check:

1. **Completeness:** Are all acceptance criteria covered by tasks?
2. **Dependencies:** Are task dependencies correctly ordered?
3. **Anti-patterns:** Does the plan contain known failure patterns?
   - Circular dependencies
   - Tasks too large for single worker (>200 lines estimated)
   - Missing test tasks for implementation tasks
   - Config/infrastructure tasks in wrong wave position

4. **Parallelization:** Are independent tasks assigned to the same wave?

The reviewer produces a findings list. Critical findings block plan finalization; WARN findings are logged.

## Integration with $post-mortem

Post-mortem should read the mutation log to assess plan quality:
- High mutation count → plan was underspecified
- Many splits → tasks were too coarse
- Many inserts → requirements were unclear
- Mutations clustered in early waves → research was insufficient

Include mutation summary in post-mortem report.

## Self-Contained Step Context

Every task in a plan should include enough context for a cold-start worker:

```markdown
### Task: ag-123 — Add JWT validation middleware

**Context:** This is part of the auth system refactor (epic ag-100).
The API currently accepts any request without auth checks.
After this task, all `/api/*` endpoints require a valid JWT.

**Dependencies:** ag-121 (JWT signing key in config) must be complete.

**Acceptance Criteria:**
1. Middleware validates JWT on all /api/* routes
2. Returns 401 for missing/invalid tokens
3. Passes user context to downstream handlers
4. Tests cover: valid token, expired token, malformed token, missing token

**File Scope:** `internal/middleware/auth.go`, `internal/middleware/auth_test.go`

**Verification:** `go test ./internal/middleware/ -run TestAuth -v`
```

A fresh agent should be able to execute this task without reading the full plan.
