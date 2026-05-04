# Pre-Mortem Check: Regex Scope Predicates Need Positive AND Negative Test Cases

> **When this check applies:** A plan adds or modifies a regex-based scope
> predicate — e.g., a goal-gate that decides which files to lint, an
> orchestrator that filters which scripts to run, a search filter that
> determines which records to process.

## Rule

When a plan introduces a regex (or grep pattern, or glob, or any
predicate that classifies inputs into "in scope" / "out of scope"), the
plan MUST enumerate:

- **At least 3 positive cases** the predicate MUST match (true
  positives — if any is missed, the predicate is too narrow).
- **At least 3 negative cases** the predicate MUST NOT match (true
  negatives — if any matches, the predicate is too broad).

Without both lists, the regex will iterate to correctness in CI or
production rather than in pre-mortem. Each iteration is a real cycle of
broken-then-fixed code.

## Why this matters

Regex scope predicates have two failure modes that are mirror images:

1. **Too narrow** — fails to match real cases, silent miss. Bug ships.
2. **Too broad** — matches things it shouldn't, generates false positives
   that block CI on unrelated changes.

Each iteration to fix one mode often breaks the other. Without both
positive and negative case lists in the plan, the predicate's actual
shape is whatever the implementer typed in the moment.

## Prior incident

C3 of the 2026-05-02 Mt. Olympus validation pass (mol-ukmdp) added a
goal gate that lints orchestrator.sh callers for `MTO_CITY_DIR` env
isolation. The initial regex matched any line containing
`orchestrator.sh`, which produced false positives for string literals
in test data like `"orchestrator.sh sling zeus"`. The fix added a
`(bash|sh|exec)` precedence requirement — but the tightened regex then
failed to match `bash scripts/orchestrator.sh` (path starts with a
letter, not `[$/.]`). A second iteration relaxed the path-prefix
requirement.

Two iterations could have been zero if the plan had specified:

- **Positive cases** (must match):
  - `bash scripts/orchestrator.sh sling zeus`
  - `sh /repo/scripts/orchestrator.sh quest start`
  - `exec ./scripts/orchestrator.sh sling`
- **Negative cases** (must NOT match):
  - `# This invokes orchestrator.sh somehow`
  - `echo "orchestrator.sh sling zeus"`  (string literal in test data)
  - `grep "orchestrator.sh" file.txt`

The first iteration's regex would have failed cases 4-6 (matching
literals); the second iteration's regex would have failed cases 1-3
(too restrictive on path prefix). The final regex satisfies all six.

## How to apply during pre-mortem

When reviewing a plan that introduces a regex predicate, demand the
enumeration before approval. If the plan does not include both lists,
WARN with the following pseudocode fix:

```markdown
## Fix: Add positive + negative cases for the <name> predicate

The plan introduces a regex `<pattern>` to classify <inputs>.
Before implementation, enumerate:

**Must match (≥3 positive cases):**
1. <example 1>
2. <example 2>
3. <example 3>

**Must NOT match (≥3 negative cases):**
1. <example 1 — likely false positive>
2. <example 2 — looks similar but is unrelated>
3. <example 3 — common adjacent pattern>

The implementation includes a unit test asserting both lists.
```

## How to apply during planning

When writing a plan that includes a regex predicate, include the two
lists in the plan document under the predicate's section. The
implementation must include a unit test that covers both lists.

## Audit candidates

Plans that warrant this check:

- Goal gates that scan `scripts/**/*.sh`, `docs/**/*.md`, etc.
- Lint rules that classify code as compliant / non-compliant.
- Orchestrators that filter which work to dispatch.
- Search/inject filters that decide which records to surface.
- Migration scripts that classify which files to rewrite.

## See also

- `.agents/council/2026-05-02-post-mortem-validation-pass.md` (N4 — the
  source finding from the Mt. Olympus validation pass)
- `scripts/goals/check-orchestrator-test-isolation.sh` (the C3 deliverable
  whose iteration cost motivated this rule)

---

*Cross-referenced from `mandatory-checks.md` as an additional check
trigger when a plan introduces a regex scope predicate.*
