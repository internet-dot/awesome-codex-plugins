# Example — Invoice Intake → Approval Packet → Accounting Draft

A V2 automation that watches finance inboxes for vendor invoices,
extracts invoice details, checks them against known vendors, drafts an
approval packet, and creates an accounting bill draft **after approval**.

> Requires MCP servers: `gmail` and an accounting connector such as
> `quickbooks`, `xero`, or `netsuite`. Tool ids are illustrative.

---

## Intent

> Every morning, find new vendor invoices in Gmail, extract key fields,
> check them against vendor records, prepare an approval packet, and only
> create accounting bill drafts after finance approval.

## Generated V2 automation payload

```json
{
  "name": "invoice-intake-approval-accounting",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": {
    "type": "cron",
    "cron_expression": "0 7 * * 1-5",
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "invoice-scout",
      "display_name": "Invoice Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": {
        "allowed_servers": ["gmail"],
        "allowed_tools": ["mcp.gmail.messages_search", "mcp.gmail.attachment_get"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "invoice-reviewer",
      "display_name": "Invoice Reviewer",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["accounting"],
        "allowed_tools": ["mcp.accounting.vendors_search", "mcp.accounting.bills_create_draft"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "find-invoices",
        "agent_id": "invoice-scout",
        "objective": "Find unprocessed vendor invoices from the finance inbox.",
        "prompt": "ROLE: Invoice scout.\n\nINPUTS:\n- inbox_query: {{ run.input.inbox_query | default(\"to:ap@example.com newer_than:1d (invoice OR receipt)\") }}\n\nTASK:\n1. Use mcp.gmail.messages_search to find candidate invoice emails.\n2. Fetch invoice attachments with mcp.gmail.attachment_get.\n3. Exclude emails already labeled processed or forwarded from unknown personal accounts.\n\nCONSTRAINTS:\n- Read-only.\n- Do not mark messages, forward, reply, or delete.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- invoice_candidates[]: { message_id, sender, attachment_name, source_url }\n- has_work: boolean\n- success_criteria:\n    - invoice_candidates[] contains only messages with invoice-like attachments\n    - has_work is true iff invoice_candidates[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-approval-packet",
        "agent_id": "invoice-reviewer",
        "depends_on": ["find-invoices"],
        "objective": "Extract invoice fields and draft a finance approval packet.",
        "prompt": "ROLE: Invoice reviewer.\n\nINPUTS:\n- upstream:research_brief.invoice_candidates[]\n\nTASK:\n1. Extract vendor name, invoice number, amount, currency, due date, line summary, and attachment reference.\n2. Use mcp.accounting.vendors_search to match each vendor.\n3. Flag mismatches, missing PO numbers, duplicate-looking invoice numbers, or unusual amounts.\n4. Write file://reports/invoice-approval-packet-<YYYY-MM-DD>.json.\n\nCONSTRAINTS:\n- Draft only. Do not create bills yet.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"invoices\": [ { \"message_id\", \"vendor\", \"vendor_id\", \"invoice_number\", \"amount\", \"currency\", \"due_date\", \"risk_flags\", \"recommended_action\" } ], \"packet_file\": string }\n- schema_version: \"1\"\n- success_criteria:\n    - packet_file exists and is non-empty\n    - every invoice has amount and vendor or risk_flags explaining why not",
        "output_contract": "structured_json"
      },
      {
        "node_id": "create-approved-bill-drafts",
        "agent_id": "invoice-reviewer",
        "depends_on": ["draft-approval-packet"],
        "objective": "Create accounting bill drafts for approved invoices.",
        "prompt": "ROLE: Accounting operator.\n\nINPUTS:\n- upstream:structured_json.payload.invoices[]\n\nTASK:\n1. For each approved invoice with no blocking risk flags, call mcp.accounting.bills_create_draft.\n2. Skip rejected, duplicate-looking, or incomplete invoices.\n3. Return bill draft ids.\n\nCONSTRAINTS:\n- Requires human approval before each bill draft is created.\n- Create drafts only; do not approve payment or initiate transfer.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of accounting bill draft ids\n- artifact_summary: \"Created N approved accounting bill drafts\"\n- success_criteria:\n    - every bill id came from the accounting connector\n    - no payment action was taken",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why this shape

- It automates clerical intake while leaving financial commitments under
  human review.
- Vendor lookup is read-only, but bill creation is approval-gated.
- Payment execution is explicitly out of scope.
