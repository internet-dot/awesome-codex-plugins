# Example — Prospect Research → Gmail Drafts → Approval → Send

A V2 automation that researches prospective contacts in a target field,
analyzes what is being marketed to them, drafts compliant outreach, stores
approved candidates as Gmail drafts, and sends only after a final explicit
approval.

> Requires MCP servers: `prospecting` (or an Apollo/Clearbit/CRM/company
> directory equivalent) and `gmail`. Optional: `notion` or `crm` for
> recording campaign status. Tool ids in this example are placeholders;
> discover the exact ids with Tandem MCP tooling before applying.

---

## Intent

> Find public business emails for people in `<target_field>`, analyze
> what competitors market to them, draft a personalized email for each
> prospect, store the drafts in Gmail, ask me for approval, and only
> send emails I approve.

## Generated V2 automation payload

```json
{
  "name": "prospect-email-drafts-gmail-approval",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": { "type": "manual" },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "agents": [
    {
      "agent_id": "prospector",
      "display_name": "Prospect Researcher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch", "webfetch"] },
      "mcp_policy": {
        "allowed_servers": ["prospecting"],
        "allowed_tools": [
          "mcp.prospecting.search_people",
          "mcp.prospecting.get_company",
          "mcp.prospecting.verify_email"
        ]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "strategist",
      "display_name": "Campaign Strategist",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write", "websearch", "webfetch"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "gmail-draft-operator",
      "display_name": "Gmail Draft Operator",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": {
        "allowlist": [
          "read",
          "mcp_list",
          "mcp.gmail.drafts_create",
          "mcp.gmail.drafts_get"
        ],
        "denylist": ["mcp.gmail.drafts_send", "mcp.gmail.send_email"]
      },
      "mcp_policy": {
        "allowed_servers": [],
        "allowed_tools": [
          "mcp.gmail.drafts_create",
          "mcp.gmail.drafts_get"
        ]
      }
    },
    {
      "agent_id": "send-reviewer",
      "display_name": "Send Approval Reviewer",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] }
    },
    {
      "agent_id": "gmail-sender",
      "display_name": "Gmail Sender",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": {
        "allowlist": [
          "read",
          "mcp_list",
          "mcp.gmail.drafts_get",
          "mcp.gmail.drafts_send"
        ],
        "denylist": ["mcp.gmail.send_email", "mcp.gmail.drafts_create"]
      },
      "mcp_policy": {
        "allowed_servers": [],
        "allowed_tools": [
          "mcp.gmail.drafts_get",
          "mcp.gmail.drafts_send"
        ]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "find-prospects",
        "agent_id": "prospector",
        "objective": "Find verified public business contacts in the requested target field.",
        "prompt": "ROLE: Prospect researcher.\n\nINPUTS:\n- target_field: {{ run.input.target_field }}\n- region: {{ run.input.region | default(\"United States\") }}\n- max_prospects: {{ run.input.max_prospects | default(10) }}\n- ideal_customer_profile: {{ run.input.ideal_customer_profile }}\n\nTASK:\n1. Use websearch/webfetch and mcp.prospecting.search_people to find prospects matching the target field and ICP.\n2. Use mcp.prospecting.get_company for company context.\n3. Use mcp.prospecting.verify_email only for public business addresses or contacts from approved lead sources.\n4. Exclude personal emails, sensitive categories, role accounts with no named contact, and contacts without a source URL.\n\nCONSTRAINTS:\n- Read-only. Do not send, draft, subscribe, enrich beyond approved sources, or write to external systems.\n- Respect opt-out/suppression input if provided.\n- Do not infer private personal data.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: {\n    \"prospects\": [\n      { \"name\", \"title\", \"company\", \"business_email\", \"source_url\", \"why_relevant\", \"confidence\" }\n    ]\n  }\n- schema_version: \"1\"\n- success_criteria:\n    - prospects.length <= max_prospects\n    - every prospect has source_url and confidence\n    - no personal email domains unless explicitly approved by policy",
        "output_contract": "structured_json"
      },
      {
        "node_id": "analyze-positioning",
        "agent_id": "strategist",
        "depends_on": ["find-prospects"],
        "objective": "Analyze what is currently marketed to the selected audience.",
        "prompt": "ROLE: Campaign strategist.\n\nINPUTS:\n- target_field: {{ run.input.target_field }}\n- offer: {{ run.input.offer }}\n- upstream:structured_json.payload.prospects[]\n\nTASK:\n1. Use websearch/webfetch to inspect competitor landing pages, ads archives when available, review sites, and public messaging aimed at this target field.\n2. Summarize common promises, objections, differentiators, and compliance risks.\n3. Save a brief to file://reports/prospect-positioning-<target-field-slug>-<YYYY-MM-DD>.md.\n\nCONSTRAINTS:\n- Do not make unverifiable claims.\n- Keep the analysis focused on public marketing messages and buyer pain points.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- top_themes[]: string\n- objections[]: string\n- differentiation_angles[]: string\n- has_work: boolean\n- success_criteria:\n    - findings[] cite public URLs\n    - differentiation_angles[] maps to the provided offer\n    - has_work is true iff prospects[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-emails",
        "agent_id": "strategist",
        "depends_on": ["find-prospects", "analyze-positioning"],
        "objective": "Draft personalized outreach emails as workspace artifacts.",
        "prompt": "ROLE: Outreach writer.\n\nINPUTS:\n- offer: {{ run.input.offer }}\n- sender: {{ run.input.sender }}\n- upstream:structured_json.payload.prospects[]\n- upstream-2:research_brief.top_themes[]\n- upstream-2:research_brief.objections[]\n- upstream-2:research_brief.differentiation_angles[]\n\nTASK:\n1. Draft one email per prospect with a concise subject and body.\n2. Personalize using only sourced company/contact context.\n3. Include a plain-text opt-out line.\n4. Save the draft set to file://reports/email-drafts-<target-field-slug>-<YYYY-MM-DD>.json.\n\nCONSTRAINTS:\n- Do not call Gmail tools in this stage.\n- No deceptive urgency, fake familiarity, or unsupported performance claims.\n- Keep each email under 150 words.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: {\n    \"drafts\": [\n      { \"prospect_email\", \"prospect_name\", \"company\", \"subject\", \"body\", \"source_url\", \"risk_notes\" }\n    ],\n    \"draft_file\": string\n  }\n- schema_version: \"1\"\n- success_criteria:\n    - drafts.length equals prospects.length\n    - every body includes an opt-out line\n    - draft_file exists and is non-empty",
        "output_contract": "structured_json"
      },
      {
        "node_id": "create-gmail-drafts",
        "agent_id": "gmail-draft-operator",
        "depends_on": ["draft-emails"],
        "objective": "Create Gmail drafts for reviewer-approved outreach candidates.",
        "prompt": "ROLE: Gmail draft operator.\n\nINPUTS:\n- upstream:structured_json.payload.drafts[]\n\nTASK:\n1. For each draft candidate, call mcp.gmail.drafts_create with To, Subject, and Body.\n2. Record the Gmail draft id, message id, thread id, recipient, subject, and draft URL when available.\n3. Write the draft receipts to the node output path.\n\nCONSTRAINTS:\n- Creating a Gmail draft is an external write; if the user requires approval before draft creation, add a separate approval gate before this node.\n- Do not send mail in this stage.\n- This agent must not have any send tool available.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"gmail_drafts\": [ { \"prospect_email\", \"draft_id\", \"message_id\", \"thread_id\", \"subject\", \"draft_url\", \"body_preview\" } ] }\n- schema_version: \"1\"\n- success_criteria:\n    - every draft_id is non-empty\n    - gmail_drafts.length <= upstream drafts.length\n    - no send tool was called",
        "metadata": {
          "builder": {
            "output_path": ".tandem/artifacts/prospect-email-drafts-gmail-approval/create-gmail-drafts.json"
          }
        },
        "output_contract": "structured_json"
      },
      {
        "node_id": "approve-send-drafts",
        "agent_id": "send-reviewer",
        "depends_on": ["create-gmail-drafts"],
        "objective": "Collect human approval before any Gmail draft is sent.",
        "prompt": "ROLE: Send approval gate.\n\nINPUTS:\n- upstream:structured_json.payload.gmail_drafts[]\n\nTASK:\n1. Present each Gmail draft with recipient, subject, body preview, draft id, and draft URL if available.\n2. Ask for one of: approve, rework, cancel.\n3. If rework is selected, route back to draft-emails and create-gmail-drafts.\n\nCONSTRAINTS:\n- This is an approval-only node.\n- Do not call any Gmail MCP tool.\n- Do not mark the workflow complete after approval; a downstream execution node must send the draft.\n\nREQUIRED OUTPUT (output_contract: review_decision):\n- decision: \"approve\" | \"rework\" | \"cancel\"\n- approved_draft_ids: string[]\n- rework_targets: [\"draft-emails\", \"create-gmail-drafts\"] when decision is \"rework\"\n- reviewer_notes: string\n- success_criteria:\n    - approval text includes recipient, subject, preview, and draft_id\n    - approved_draft_ids are a subset of upstream gmail_drafts[].draft_id",
        "output_contract": "review_decision"
      },
      {
        "node_id": "send-approved-emails",
        "agent_id": "gmail-sender",
        "depends_on": ["approve-send-drafts"],
        "objective": "Send only the Gmail drafts that received final approval.",
        "prompt": "ROLE: Gmail sender.\n\nINPUTS:\n- drafts: create-gmail-drafts.structured_json.payload.gmail_drafts[]\n- approval: approve-send-drafts.review_decision\n\nTASK:\n1. If approval.decision is not \"approve\", stop without calling Gmail.\n2. Read each approved draft id from approval.approved_draft_ids and match it to the create-gmail-drafts output.\n3. Call mcp.gmail.drafts_send once per approved draft id.\n4. Return the concrete send receipts.\n\nCONSTRAINTS:\n- This is the only node with the Gmail send-draft tool.\n- Do not create or update drafts in this stage.\n- Do not call any direct send-email tool.\n- Stop on the first Gmail API error and report the failed draft id.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"status\": \"completed\", \"sent\": true, \"sent_messages\": [ { \"draft_id\", \"message_id\", \"recipient\", \"subject\", \"tool_used\", \"send_result\" } ] }\n- schema_version: \"1\"\n- success_criteria:\n    - every sent message has tool_used equal to mcp.gmail.drafts_send\n    - every draft_id came from create-gmail-drafts output\n    - sent is true only if the send-draft tool returned success",
        "metadata": {
          "builder": {
            "output_path": ".tandem/artifacts/prospect-email-drafts-gmail-approval/send-approved-emails.json"
          }
        },
        "output_contract": "structured_json"
      }
    ]
  }
}
```

## Triggering a run

```ts
await client.automationsV2.runNow({
  id: "prospect-email-drafts-gmail-approval",
  input: {
    target_field: "RevOps leaders at B2B SaaS companies",
    region: "United States",
    max_prospects: 10,
    ideal_customer_profile: "Series A-C SaaS teams with complex outbound workflows",
    offer: "A workflow automation audit for improving sales handoffs",
    sender: "Alex from ExampleCo"
  }
});
```

## Approval gates

- `find-prospects`, `analyze-positioning`, and `draft-emails` are
  read/workspace-only and can run automatically.
- `create-gmail-drafts` writes to Gmail and has only draft/read tools.
  If your policy requires approval before draft creation, add an
  approval-only node before it.
- `approve-send-drafts` is the final human approval gate. It has no Gmail
  tools and cannot send.
- `send-approved-emails` is the post-approval execution node. Approval to
  send is not the send itself; this node must call the send-draft tool
  and return a receipt.

## Why this shape

- Prospecting, strategy, drafting, and sending are separate stages so
  each stage has a small tool surface.
- Gmail draft and send tools are isolated to different agents so the
  draft stage cannot accidentally send mail.
- The approval gate is separate from the execution node so approving a
  draft resumes the workflow and then calls the concrete send-draft tool.
- Side-effect nodes write durable receipts under `.tandem/artifacts/...`
  so a successful Gmail call is not lost behind a later generic write.
- The prompts include basic outreach safety constraints: public business
  contact sources, no personal email scraping, opt-out language, and no
  unsupported claims.
