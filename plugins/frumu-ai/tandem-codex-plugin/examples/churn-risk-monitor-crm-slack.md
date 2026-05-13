# Example — Churn Risk Monitor → Account Plan + Slack Alert

A V2 automation that monitors support, product, billing, and CRM signals
for churn risk, drafts an account plan, and posts an escalation to Slack
**after approval**.

> Requires MCP servers such as `crm`, `support`, `billing`, `analytics`,
> and `slack`. Tool ids are illustrative.

---

## Intent

> Every weekday, detect customer accounts showing churn risk, summarize
> the evidence, draft next-best actions, and ask before notifying the
> customer-success channel.

## Generated V2 automation payload

```json
{
  "name": "churn-risk-monitor-crm-slack",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": {
    "type": "cron",
    "cron_expression": "0 13 * * 1-5",
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "signal-scout",
      "display_name": "Churn Signal Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["crm", "support", "billing", "analytics"],
        "allowed_tools": [
          "mcp.crm.accounts_list",
          "mcp.support.tickets_search",
          "mcp.billing.subscriptions_list",
          "mcp.analytics.usage_summary"
        ]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "cs-strategist",
      "display_name": "Customer Success Strategist",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["slack", "crm"],
        "allowed_tools": ["mcp.slack.message_send", "mcp.crm.tasks_create"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "detect-risk",
        "agent_id": "signal-scout",
        "objective": "Detect customer accounts with fresh churn-risk signals.",
        "prompt": "ROLE: Churn signal scout.\n\nINPUTS:\n- segment: {{ run.input.segment | default(\"active customers\") }}\n- lookback_days: {{ run.input.lookback_days | default(7) }}\n\nTASK:\n1. Read CRM accounts in the target segment.\n2. Check support tickets for repeated issues, severity, sentiment, and no-response gaps.\n3. Check billing for failed payments, downgrade requests, or cancellation signals.\n4. Check product analytics for material usage drops.\n5. Score accounts from 0 to 1 for churn risk.\n\nCONSTRAINTS:\n- Read-only.\n- Do not contact customers or mutate CRM.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- at_risk_accounts[]: { account_id, account_name, risk_score, evidence_urls, primary_driver }\n- has_work: boolean\n- success_criteria:\n    - at_risk_accounts[] contains only accounts with risk_score >= 0.7\n    - every risk score has at least one evidence URL\n    - has_work is true iff at_risk_accounts[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-account-plans",
        "agent_id": "cs-strategist",
        "depends_on": ["detect-risk"],
        "objective": "Draft account recovery plans for the at-risk accounts.",
        "prompt": "ROLE: Customer success strategist.\n\nINPUTS:\n- upstream:research_brief.at_risk_accounts[]\n\nTASK:\n1. For each account, draft a recovery plan with evidence, suggested owner, next action, and urgency.\n2. Save plans to file://reports/churn-risk-<YYYY-MM-DD>.md.\n3. Prepare Slack alert text and optional CRM task payloads.\n\nCONSTRAINTS:\n- Draft only. Do not call Slack or CRM write tools in this stage.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"plans\": [ { \"account_id\", \"account_name\", \"risk_score\", \"next_action\", \"owner_suggestion\", \"slack_message\", \"crm_task\" } ], \"plan_file\": string }\n- schema_version: \"1\"\n- success_criteria:\n    - plan_file exists and is non-empty\n    - every plan cites upstream evidence",
        "output_contract": "structured_json"
      },
      {
        "node_id": "publish-approved-escalations",
        "agent_id": "cs-strategist",
        "depends_on": ["draft-account-plans"],
        "objective": "Post approved churn-risk escalations and create CRM tasks.",
        "prompt": "ROLE: Customer success operator.\n\nINPUTS:\n- upstream:structured_json.payload.plans[]\n- slack_channel: {{ run.input.slack_channel | default(\"#customer-success\") }}\n\nTASK:\n1. For approved plans, call mcp.slack.message_send with the escalation text.\n2. If approved, call mcp.crm.tasks_create for the recommended follow-up task.\n3. Skip rejected plans.\n\nCONSTRAINTS:\n- Requires human approval before every Slack or CRM write.\n- Do not email customers in this workflow.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of Slack message ids and CRM task ids\n- artifact_summary: \"Published approved churn-risk escalations\"\n- success_criteria:\n    - no external write happens for rejected plans",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why this shape

- Tandem is well-suited because each signal source is read-only and
  independently scoped.
- The approval boundary lets customer-success managers review sensitive
  account narratives before they reach Slack or CRM.
- The report file becomes a durable audit trail for the risk decision.
