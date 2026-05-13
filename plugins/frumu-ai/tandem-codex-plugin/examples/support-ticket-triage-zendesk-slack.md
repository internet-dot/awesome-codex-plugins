# Example — Support Ticket Triage → Zendesk Note + Slack Escalation

A V2 automation that checks new support tickets, classifies urgency,
drafts an internal triage note, and posts high-priority escalations to
Slack **after explicit approval**.

> Requires MCP servers: `zendesk` and `slack` (or equivalent connector
> namespaces). Tool ids are illustrative; replace them with discovered
> Tandem MCP tool ids before applying.

---

## Intent

> Every 15 minutes, check new Zendesk tickets, identify urgent customer
> issues, draft an internal note, and ask me before posting any Slack
> escalation or writing back to Zendesk.

## Generated V2 automation payload

```json
{
  "name": "support-ticket-triage-zendesk-slack",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": {
    "type": "interval",
    "interval_seconds": 900,
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "ticket-scout",
      "display_name": "Ticket Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["zendesk"],
        "allowed_tools": ["mcp.zendesk.tickets_search", "mcp.zendesk.ticket_get"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "triage-writer",
      "display_name": "Support Triage Writer",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "support-publisher",
      "display_name": "Support Publisher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["zendesk", "slack"],
        "allowed_tools": ["mcp.zendesk.ticket_comment_create", "mcp.slack.message_send"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "find-new-tickets",
        "agent_id": "ticket-scout",
        "objective": "Find untriaged support tickets created since the last run.",
        "prompt": "ROLE: Support ticket scout.\n\nINPUTS:\n- queue: {{ run.input.queue | default(\"new\") }}\n- since: last 15 minutes\n\nTASK:\n1. Call mcp.zendesk.tickets_search for new or updated tickets.\n2. Read candidate tickets with mcp.zendesk.ticket_get.\n3. Exclude tickets already tagged tandem-triaged.\n4. Flag tickets mentioning outage, security, data loss, payment failure, or enterprise customer impact.\n\nCONSTRAINTS:\n- Read-only. Do not comment, tag, assign, or change ticket status.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- urgent_ticket_ids[]: string\n- has_work: boolean\n- success_criteria:\n    - findings[] includes only untriaged tickets\n    - urgent_ticket_ids[] contains ticket ids from findings[]\n    - has_work is true iff findings[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-triage",
        "agent_id": "triage-writer",
        "depends_on": ["find-new-tickets"],
        "objective": "Draft internal triage notes and Slack escalation text.",
        "prompt": "ROLE: Support triage writer.\n\nINPUTS:\n- upstream:research_brief.findings[]\n- upstream:research_brief.urgent_ticket_ids[]\n\nTASK:\n1. Classify each ticket as low, medium, high, or critical.\n2. Draft an internal Zendesk note with summary, suspected area, customer impact, and next action.\n3. Draft one Slack escalation for high or critical tickets.\n4. Save all drafts to file://reports/support-triage-<YYYY-MM-DD-HH-mm>.json.\n\nCONSTRAINTS:\n- Draft only. Do not call Zendesk or Slack tools.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"drafts\": [ { \"ticket_id\", \"severity\", \"zendesk_note\", \"slack_message\", \"escalate\" } ], \"draft_file\": string }\n- schema_version: \"1\"\n- success_criteria:\n    - every draft has ticket_id and severity\n    - escalate is true only for high or critical tickets\n    - draft_file exists and is non-empty",
        "output_contract": "structured_json"
      },
      {
        "node_id": "publish-approved-actions",
        "agent_id": "support-publisher",
        "depends_on": ["draft-triage"],
        "objective": "Write approved internal notes and Slack escalations.",
        "prompt": "ROLE: Support publisher.\n\nINPUTS:\n- upstream:structured_json.payload.drafts[]\n- slack_channel: {{ run.input.slack_channel | default(\"#support-escalations\") }}\n\nTASK:\n1. For each approved draft, call mcp.zendesk.ticket_comment_create as an internal note.\n2. For approved escalations, call mcp.slack.message_send to slack_channel.\n3. Skip rejected drafts.\n\nCONSTRAINTS:\n- Requires human approval before each external write.\n- Do not change ticket status, assignment, or tags in this example.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of Zendesk comment ids and Slack message ids\n- artifact_summary: \"Published approved support triage actions\"\n- success_criteria:\n    - location contains only successful external write ids",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why this shape

- The scout is a triage gate, so quiet intervals skip all downstream work.
- Zendesk and Slack writes live in one final approval-gated node.
- The draft JSON file gives reviewers a durable artifact before any
  customer-support system is modified.
