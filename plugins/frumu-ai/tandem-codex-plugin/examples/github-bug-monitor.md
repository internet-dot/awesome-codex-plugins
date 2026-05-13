# Example — GitHub Bug Monitor

A V2 automation that polls a GitHub repository for new issues labelled
`bug`, drafts a triage note, and only files an issue comment **after
explicit approval**.

> Requires composio's GitHub MCP tools or an equivalent connector.
> Tool ids in this example use `mcp.composio.github_*` from the Tandem
> docs; substitute your connector's exact tool ids.

---

## Intent

> Every 30 minutes, check the repo for new bug-labelled issues. For
> each new one, draft a triage note (severity, suspected root cause,
> next step). After review, post the triage note as an issue comment.
> Skip cycles when there's nothing new.

## Generated V2 automation payload

```json
{
  "name": "github-bug-monitor",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": {
    "type": "interval",
    "interval_seconds": 1800,
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "scout",
      "display_name": "Issue Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch"] },
      "mcp_policy": {
        "allowed_servers": ["composio"],
        "allowed_tools": ["mcp.composio.github_issues_list"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "triager",
      "display_name": "Bug Triager",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["composio"],
        "allowed_tools": ["mcp.composio.github_issue_comment_create"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "scout",
        "agent_id": "scout",
        "objective": "Find new bug-labelled issues since last run.",
        "prompt": "ROLE: GitHub issue scout.\n\nINPUTS:\n- repo: <owner/name>\n- labels: [\"bug\"]\n- since: last 30m\n\nTASK:\n1. Call mcp.composio.github_issues_list with state=open, labels=bug, sort=created, since=30m.\n2. Filter out issues already triaged (look for an existing comment by this bot).\n\nCONSTRAINTS:\n- Read-only.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url: issue url, title, summary: issue body excerpt, relevance_score: 1.0 }\n- has_work: boolean\n- success_criteria:\n    - findings[] non-empty iff has_work is true",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-triage",
        "agent_id": "triager",
        "depends_on": ["scout"],
        "objective": "For each new issue, draft a triage note.",
        "prompt": "ROLE: Bug triager.\n\nINPUTS:\n- upstream:research_brief.findings[]\n\nTASK:\n1. For each finding, classify severity (low / medium / high) using body keywords (crash, data loss, security).\n2. Propose a single next step (assignee, label change, ask for repro).\n3. Compose a markdown comment per issue.\n\nCONSTRAINTS:\n- Do not post comments yet. Drafts only.\n- Save each draft to file://reports/bug-triage-<issue_id>.md.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { drafts: [ { issue_url, severity, comment_markdown, file_location } ] }\n- schema_version: \"1\"\n- success_criteria:\n    - payload.drafts.length === upstream.findings.length\n    - every draft has a non-empty comment_markdown",
        "output_contract": "structured_json"
      },
      {
        "node_id": "post-comments",
        "agent_id": "triager",
        "depends_on": ["draft-triage"],
        "objective": "Post the drafted comments after approval.",
        "prompt": "ROLE: Bug triager (publish step).\n\nINPUTS:\n- upstream:structured_json.payload.drafts[]\n\nTASK:\n1. For each draft, call mcp.composio.github_issue_comment_create.\n\nCONSTRAINTS:\n- Requires approval per draft.\n- Skip drafts the reviewer rejected.\n- Stop on the first error; do not retry.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of created comment ids\n- artifact_summary: \"Posted N triage comments\"\n- success_criteria:\n    - location is a non-empty list",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why the triage gate matters

Most cycles will have no new bug issues. With
`metadata.triage_gate: true` and `scout` emitting `has_work: false` on
empty results, the engine skips the rest of the DAG and counts the
cycle as a no-op. No tokens are spent on the triager when there's
nothing to triage.

## Approval gates

- `post-comments` calls `mcp.composio.github_issue_comment_create`.
  Approval-gated by default (the agent has no `approval_policy: "auto"`).
- `external_integrations_allowed: true` is required for the GitHub
  write but does not skip approval.

## Alternative: Tandem's bug-monitor primitive

Tandem also exposes a higher-level `client.bugMonitor` SDK that wraps
the drafts → approval → publish flow. If your team is already using
that, prefer it over a hand-rolled V2. See the Tandem docs:
<https://docs.tandem.ac/sdk/typescript/>.
