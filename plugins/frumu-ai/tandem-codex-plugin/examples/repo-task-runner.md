# Example — Repo Task Runner

A workspace-scoped V2 automation that takes a task description, drafts
a code patch, validates it locally with `git apply --check`, and stops
short of pushing — the user pushes manually after review.

> Use case: "implement a small feature" loop. Codex stays in plan mode;
> Tandem actually executes the patch generation under tight scope and
> posts the patch as a workspace artifact.

---

## Intent

> Given a one-line task, generate a patch under this repo, run sanity
> checks, and produce a `risk_level` and a unified diff. Do not push,
> open a PR, or run external tools.

## Generated V2 automation payload

```json
{
  "name": "repo-task-runner",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": { "type": "manual" },
  "external_integrations_allowed": false,
  "handoff_config": { "auto_approve": false },
  "scope_policy": {
    "workspace_only": true
  },
  "agents": [
    {
      "agent_id": "patcher",
      "display_name": "Patcher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": {
        "allowlist": ["read", "write", "edit"],
        "denylist": []
      },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "validator",
      "display_name": "Patch Validator",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "shell"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "patch",
        "agent_id": "patcher",
        "objective": "Generate a unified-diff patch for the requested task.",
        "prompt": "ROLE: Patcher.\n\nINPUTS:\n- task: {{ run.input.task }}\n- workspace_root: .\n\nTASK:\n1. Read relevant files.\n2. Produce a single unified diff that implements the task.\n3. Keep the patch minimal — no unrelated refactors.\n\nCONSTRAINTS:\n- Do not push, commit, or call any external integration.\n- Do not run shell commands here — the validator does that.\n- If the task is unclear, emit an empty patch with risk_level: \"low\".\n\nREQUIRED OUTPUT (output_contract: code_patch):\n- patch: unified diff\n- files_changed[]: list of changed file paths\n- rationale: 1-3 sentences\n- risk_level: \"low\" | \"medium\" | \"high\"\n- success_criteria:\n    - files_changed[] matches the diff's file headers\n    - risk_level reflects scope and reversibility",
        "output_contract": "code_patch"
      },
      {
        "node_id": "validate",
        "agent_id": "validator",
        "depends_on": ["patch"],
        "objective": "Run git apply --check and basic linters against the patch.",
        "prompt": "ROLE: Patch validator.\n\nINPUTS:\n- upstream:code_patch.patch\n- upstream:code_patch.files_changed[]\n\nTASK:\n1. Save the patch to .tandem/last-patch.diff.\n2. Run `git apply --check .tandem/last-patch.diff` from workspace_root.\n3. Capture exit code and stderr.\n4. If exit is non-zero, emit decision=request_changes with the stderr as blocking_issues.\n\nCONSTRAINTS:\n- Read-only against the working tree until the user manually applies.\n- Do not run tests — that's a separate workflow.\n\nREQUIRED OUTPUT (output_contract: review_decision):\n- decision: \"approve\" | \"request_changes\" | \"noop\"\n- rationale: short string mentioning git apply --check exit code\n- blocking_issues[]: list of stderr lines when request_changes\n- success_criteria:\n    - decision is one of the three enums\n    - blocking_issues[] non-empty iff decision is request_changes",
        "output_contract": "review_decision"
      }
    ]
  }
}
```

## Why this shape

- **`schedule.type: "manual"`** — runs only when triggered with a task
  payload. No background firing.
- **`external_integrations_allowed: false`** — the engine refuses any
  external write even if a tool is allowlisted.
- **`scope_policy.workspace_only: true`** — agents can't read or write
  outside `workspace_root`. (Verify exact field name in source —
  noted in `tandem-api-discovery-notes.md`.)
- **No MCP allowlist** — the agents work on the workspace only.
- **Two agents, one validator** — the validator agent is allowed
  `shell` but the patcher is not, keeping the patch generator from
  side-effects.

## Triggering a run

```ts
const run = await client.automationsV2.runNow({
  id: "repo-task-runner",
  input: { task: "Add a CHANGELOG entry for v0.2.0" }
});
```

The run produces:

- A workspace file `.tandem/last-patch.diff` (the patch).
- A `review_decision` artifact (approve / request_changes).
- No external side-effects.

The user reviews the patch, runs `git apply` themselves, and commits.
The plugin never automates the apply step.

## Approval gates

This example needs no per-run approval because it has no external
side-effects. If you wire a downstream stage that pushes a branch or
opens a PR, that stage **must** be approval-gated and add the GitHub
MCP tool to its agent's `mcp_policy.allowed_tools`.
