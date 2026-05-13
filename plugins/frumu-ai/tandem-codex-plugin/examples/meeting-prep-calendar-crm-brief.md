# Example — Meeting Prep Brief From Calendar + CRM + Email

A morning V2 automation that reads today's calendar, gathers account
context from CRM and recent email, drafts meeting briefs, and optionally
sends a Slack digest **after approval**.

> Requires MCP servers: `calendar`, `crm`, `gmail`, and optionally
> `slack`. Tool ids are illustrative.

---

## Intent

> Every weekday at 06:30 local time, prepare briefs for today's customer
> meetings using calendar events, CRM account notes, and recent email.
> Save the briefs as files, and ask before sending a Slack digest.

## Generated V2 automation payload

```json
{
  "name": "meeting-prep-calendar-crm-brief",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": {
    "type": "cron",
    "cron_expression": "30 6 * * 1-5",
    "timezone": "America/New_York",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "agenda-scout",
      "display_name": "Agenda Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["calendar"],
        "allowed_tools": ["mcp.calendar.events_list"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "context-researcher",
      "display_name": "Meeting Context Researcher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["crm", "gmail"],
        "allowed_tools": ["mcp.crm.accounts_search", "mcp.crm.notes_list", "mcp.gmail.messages_search"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "brief-writer",
      "display_name": "Brief Writer",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["slack"],
        "allowed_tools": ["mcp.slack.message_send"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "list-meetings",
        "agent_id": "agenda-scout",
        "objective": "List today's external customer meetings.",
        "prompt": "ROLE: Calendar scout.\n\nINPUTS:\n- date: today\n- calendar_id: {{ run.input.calendar_id | default(\"primary\") }}\n\nTASK:\n1. Call mcp.calendar.events_list for today's events.\n2. Keep external customer meetings with at least one non-internal attendee.\n3. Exclude private, personal, and internal-only events.\n\nCONSTRAINTS:\n- Read-only.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"meetings\": [ { \"event_id\", \"title\", \"start_time\", \"attendees\", \"company_guess\" } ] }\n- schema_version: \"1\"\n- has_work: boolean\n- success_criteria:\n    - meetings[] contains no private event body text\n    - has_work is true iff meetings[] is non-empty",
        "output_contract": "structured_json"
      },
      {
        "node_id": "gather-context",
        "agent_id": "context-researcher",
        "depends_on": ["list-meetings"],
        "objective": "Gather CRM and email context for each meeting.",
        "prompt": "ROLE: Account context researcher.\n\nINPUTS:\n- upstream:structured_json.payload.meetings[]\n- lookback_days: {{ run.input.lookback_days | default(30) }}\n\nTASK:\n1. Match meeting attendees or company_guess to CRM accounts with mcp.crm.accounts_search.\n2. Read recent CRM notes with mcp.crm.notes_list.\n3. Search recent email threads with mcp.gmail.messages_search.\n4. Summarize account status, open asks, risks, and last touch.\n\nCONSTRAINTS:\n- Read-only.\n- Do not include sensitive personal information unrelated to the business meeting.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- account_context[]: { event_id, account_name, status, open_asks, risks, useful_links }\n- has_work: boolean\n- success_criteria:\n    - every account_context item maps to a meeting event_id\n    - useful_links contains only CRM or email source links available to the user",
        "output_contract": "research_brief"
      },
      {
        "node_id": "write-briefs",
        "agent_id": "brief-writer",
        "depends_on": ["gather-context"],
        "objective": "Write meeting briefs and optionally publish a Slack digest.",
        "prompt": "ROLE: Meeting brief writer.\n\nINPUTS:\n- upstream:research_brief.account_context[]\n- slack_channel: {{ run.input.slack_channel | default(\"#daily-briefs\") }}\n\nTASK:\n1. Write one markdown brief per meeting to file://reports/meeting-briefs/<YYYY-MM-DD>/<event_id>.md.\n2. Include agenda, context, open asks, risks, and suggested questions.\n3. Prepare a short Slack digest linking to the files.\n4. If approved, call mcp.slack.message_send with the digest.\n\nCONSTRAINTS:\n- File writes are allowed automatically.\n- Slack publishing requires human approval.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"file_and_optional_channel_post\"\n- location: folder path plus Slack message id if sent\n- artifact_summary: \"Prepared meeting briefs for today's customer meetings\"\n- success_criteria:\n    - one brief file exists per account_context item\n    - Slack is sent only after approval",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why this shape

- It is mostly read-only, but still approval-gates the Slack side effect.
- Calendar discovery is the triage gate, so days with no customer
  meetings produce a no-op.
- The durable output is the folder of meeting briefs; Slack is only a
  convenience notification.
