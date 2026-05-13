# Output Contract Patterns

Every node in a Tandem V2 DAG should declare, inside its prompt's
`REQUIRED OUTPUT` block, exactly what fields it emits and what each one
means. The next stage's prompt reads those same field names. If the two
stages disagree, the workflow breaks at runtime.

> Whether Tandem has a named engine-level enum for these contracts is
> still open (see `tandem-api-discovery-notes.md`). Until verified, treat
> these as **prompt patterns**, not engine enums.

Five patterns cover most workflows. Pick one per node.

---

## 1. Research brief

Use when the node reads sources and produces summaries for a downstream
writer or decision step.

```
REQUIRED OUTPUT (output_contract: research_brief):
- findings[]:
    - source_url: string
    - title: string
    - summary: string (1-3 sentences)
    - relevance_score: number (0-1)
- top_themes[]: string
- has_work: boolean   # true when findings[] is non-empty
- success_criteria:
    - findings[] has at least 1 item OR has_work is false
    - every finding has a non-empty source_url
```

Pair with `metadata.triage_gate: true` so empty cycles skip downstream.

---

## 2. Structured JSON

Use for programmatic outputs that get written to files or other tools.

```
REQUIRED OUTPUT (output_contract: structured_json):
- payload: object   # exact shape:
    {
      "id": string,
      "fields": { ... },
      "tags": string[]
    }
- schema_version: string
- success_criteria:
    - payload is valid JSON and matches schema_version
    - all required fields present
```

The next stage reads `payload` directly. Validate with a verifier role
that asserts the schema before downstream tools run.

---

## 3. Code patch

Use when the node proposes file edits.

```
REQUIRED OUTPUT (output_contract: code_patch):
- patch: string   # unified diff
- files_changed[]: string
- rationale: string
- risk_level: "low" | "medium" | "high"
- success_criteria:
    - `git apply --check` passes against the workspace root
    - files_changed[] matches the diff's file headers
    - patch is empty when no work is needed (with risk_level: "low")
```

Pair with an approval gate before any apply step. `risk_level: "high"`
should also pause the run for a human reviewer regardless of approval
defaults.

---

## 4. Review decision

Use for verifier or reviewer nodes.

```
REQUIRED OUTPUT (output_contract: review_decision):
- decision: "approve" | "request_changes" | "noop"
- rationale: string
- blocking_issues[]: string   # empty when decision is "approve" or "noop"
- success_criteria:
    - decision is one of the three enum values
    - blocking_issues[] is non-empty iff decision is "request_changes"
```

Wire this so a `request_changes` decision halts the DAG before any
external write executes.

---

## 5. Generic artifact

Use when the node produces a file or message and the engine just needs
to know where it went.

```
REQUIRED OUTPUT (output_contract: artifact):
- artifact_kind: "file" | "channel_post" | "ticket" | "mcp_call_result"
- location: string   # file path, channel id, ticket id, or tool result id
- artifact_summary: string  # one-line description
- success_criteria:
    - location is non-empty
    - artifact_kind matches a corresponding tool call in this stage
```

Useful as the last node in workflows that publish a report, post to a
channel, or write a Notion page.

---

## How to wire contracts together

In the per-stage prompt:

```
INPUTS:
- upstream:research_brief (findings[], top_themes[])
TASK:
- ...
REQUIRED OUTPUT (output_contract: structured_json):
- ...
```

Tandem's planner and verifier roles read the `INPUTS` and `REQUIRED
OUTPUT` blocks. The closer the field names line up, the less the engine
has to translate.

---

## Anti-patterns

- **Free-text "summary string"** without structured fields. Downstream
  stages can't programmatically read it.
- **Implicit outputs.** Every node should declare what it emits, even if
  it's just `artifact: { kind, location }`.
- **Mixing patterns in one node.** If a node both writes a file and
  posts a message, split it into two nodes so each has a single
  contract.
- **Using a contract pattern's name as if it were a Tandem enum.** They
  are prompt patterns, not engine values, until source verification
  proves otherwise.
