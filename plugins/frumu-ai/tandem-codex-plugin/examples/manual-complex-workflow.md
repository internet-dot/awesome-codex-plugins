# Example — Manual Complex Workflow (4-stage DAG)

A four-stage V2 automation showing explicit `depends_on`, per-stage
`output_contract`, and an approval gate before the final stage.

> Use case: weekly review automation. Reads recent commits + open PRs,
> drafts a markdown review, runs a verifier role, and posts to Slack
> after approval.

> Requires MCP servers: `composio` (or equivalent) for GitHub and
> Slack tools.

---

## Intent

> Every Friday at 16:00 UTC, summarise the week's commits and open PRs
> in `<owner/repo>`, run a verifier pass, and post a structured summary
> to #weekly-review. Don't post until I review.

## Generated V2 automation payload

```json
{
  "name": "weekly-engineering-review",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": {
    "type": "cron",
    "cron_expression": "0 16 * * 5",
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "agents": [
    {
      "agent_id": "scout",
      "display_name": "Repo Scout",
      "model_policy": { "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" } },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["composio"],
        "allowed_tools": [
          "mcp.composio.github_commits_list",
          "mcp.composio.github_pulls_list"
        ]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "writer",
      "display_name": "Review Writer",
      "model_policy": { "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" } },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "verifier",
      "display_name": "Review Verifier",
      "model_policy": { "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" } },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "publisher",
      "display_name": "Slack Publisher",
      "model_policy": { "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" } },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["composio"],
        "allowed_tools": ["mcp.composio.slack_message_send"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "scout",
        "agent_id": "scout",
        "objective": "Collect the week's commits and open PRs.",
        "prompt": "ROLE: Repo scout.\n\nINPUTS:\n- repo: <owner/name>\n- since: 7 days ago\n\nTASK:\n1. mcp.composio.github_commits_list since=7d.\n2. mcp.composio.github_pulls_list state=open.\n3. Bundle into a structured payload.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { commits: [...], open_prs: [...] }\n- schema_version: \"1\"\n- success_criteria:\n    - payload.commits is an array (may be empty)\n    - payload.open_prs is an array (may be empty)",
        "output_contract": "structured_json"
      },
      {
        "node_id": "draft",
        "agent_id": "writer",
        "depends_on": ["scout"],
        "objective": "Draft a Friday review markdown.",
        "prompt": "ROLE: Review writer.\n\nINPUTS:\n- upstream:structured_json.payload.commits[]\n- upstream:structured_json.payload.open_prs[]\n\nTASK:\n1. Group commits by author and area.\n2. List open PRs by status (ready / blocked / draft).\n3. Write the review to file://reports/weekly-review-<YYYY-MM-DD>.md.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"file\"\n- location: file path\n- artifact_summary: \"Weekly review draft for <YYYY-MM-DD>\"\n- success_criteria:\n    - file exists and contains the date in its title\n    - file is at most 1500 words",
        "output_contract": "artifact"
      },
      {
        "node_id": "verify",
        "agent_id": "verifier",
        "depends_on": ["draft"],
        "objective": "Sanity-check the draft.",
        "prompt": "ROLE: Verifier.\n\nINPUTS:\n- upstream:artifact.location (markdown file)\n- upstream-2:structured_json.payload\n\nTASK:\n1. Read the draft.\n2. Check every PR/commit referenced in the draft also exists in the upstream payload.\n3. Flag any hallucinated identifiers.\n\nREQUIRED OUTPUT (output_contract: review_decision):\n- decision: \"approve\" | \"request_changes\" | \"noop\"\n- rationale: short string\n- blocking_issues[]: list of hallucinated identifiers, if any\n- success_criteria:\n    - decision is one of the three enums\n    - blocking_issues[] is non-empty iff decision is \"request_changes\"",
        "output_contract": "review_decision"
      },
      {
        "node_id": "publish",
        "agent_id": "publisher",
        "depends_on": ["verify"],
        "objective": "Post the verified review to Slack.",
        "prompt": "ROLE: Slack publisher.\n\nINPUTS:\n- upstream-2:artifact.location (markdown file)\n- upstream:review_decision.decision\n\nTASK:\n1. If upstream decision is not \"approve\", stop with reason \"verifier rejected\".\n2. Otherwise, read the markdown file.\n3. Format as a Slack message (chunk if > 4000 chars).\n4. Call mcp.composio.slack_message_send to #weekly-review.\n\nCONSTRAINTS:\n- Requires human approval before slack_message_send runs.\n- Halt entirely if upstream verifier said request_changes.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"channel_post\"\n- location: Slack channel id + message ts\n- artifact_summary: \"Posted weekly review to #weekly-review\"\n- success_criteria:\n    - location is non-empty\n    - message ts is set",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Approval gates

- `verify` is auto: it's read-only and just outputs a decision.
- `publish` is gated: a human reviewer approves the Slack post after
  seeing the draft and the verifier's verdict.
- `verify.decision == "request_changes"` halts the publish stage even
  if a human approves it (the prompt explicitly stops in that case).

## Why four stages

- **Scout** is its own stage so the verifier has a clean upstream
  payload to cross-check against.
- **Draft** writes to a workspace file so it's auditable before any
  external write.
- **Verify** is a separate role with its own model so it can be
  stronger than the writer if you want.
- **Publish** is the only stage with `mcp_policy.allowed_tools`
  containing a write tool. Everything before it is read-only.
