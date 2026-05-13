# Example — Market Research + Pain Points → Notion Row

A V2 automation that combines broad web research with Reddit pain-point
mining, drafts a structured market analysis, and writes one row to a
Notion database **after explicit approval**.

> Requires MCP servers: `reddit` and `notion` (or equivalent connector
> namespaces). Tool ids in this example are illustrative; use Tandem MCP
> discovery (`mcp_list`, `GET /mcp/tools`, or `GET /tool/ids`) and replace
> them with your connector's exact ids before applying.

---

## Intent

> Every Monday at 08:30 UTC, research the market for `<subject>`. Use
> web search for market context and a Reddit MCP for customer pain
> points. Draft an analysis and, after I review it, save a structured row
> to my Notion research database.

## Generated V2 automation payload

```json
{
  "name": "market-research-pain-points-to-notion-row",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": {
    "type": "cron",
    "cron_expression": "30 8 * * 1",
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "researcher",
      "display_name": "Market Researcher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch", "webfetch"] },
      "mcp_policy": {
        "allowed_servers": ["reddit"],
        "allowed_tools": ["mcp.reddit.search", "mcp.reddit.get_post"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "analyst",
      "display_name": "Research Analyst",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "notion-writer",
      "display_name": "Notion Research Writer",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["notion"],
        "allowed_tools": ["mcp.notion.pages_create"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "collect-signals",
        "agent_id": "researcher",
        "objective": "Collect market context and customer pain-point signals for the requested subject.",
        "prompt": "ROLE: Market researcher.\n\nINPUTS:\n- subject: {{ run.input.subject }}\n- reddit_queries: {{ run.input.reddit_queries | default([subject]) }}\n- subreddits: {{ run.input.subreddits | default([]) }}\n- since: last 14 days\n\nTASK:\n1. Use websearch/webfetch to collect current market context: competitors, pricing signals, positioning, and recent news.\n2. Use mcp.reddit.search for customer language, pain points, complaints, and workaround patterns.\n3. Read the most relevant Reddit posts with mcp.reddit.get_post.\n4. Deduplicate sources and keep only evidence with a source URL.\n\nCONSTRAINTS:\n- Read-only. Do not post, vote, message, or modify any external system.\n- Prefer public sources and cite URLs.\n- If the subject is too broad, narrow to the most commercially relevant subtopic and explain the narrowing.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- top_themes[]: string\n- pain_points[]: { pain, evidence_url, customer_language, severity: \"low\" | \"medium\" | \"high\" }\n- has_work: boolean\n- success_criteria:\n    - findings[] includes both web and Reddit evidence when available\n    - pain_points[] contains only claims backed by source URLs\n    - has_work is true iff findings[] or pain_points[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-analysis",
        "agent_id": "analyst",
        "depends_on": ["collect-signals"],
        "objective": "Draft a concise market analysis from the collected evidence.",
        "prompt": "ROLE: Research analyst.\n\nINPUTS:\n- upstream:research_brief.findings[]\n- upstream:research_brief.top_themes[]\n- upstream:research_brief.pain_points[]\n\nTASK:\n1. Draft a markdown analysis with sections: market snapshot, audience pain points, competitor positioning, opportunity hypotheses, evidence table.\n2. Convert the same analysis into a structured payload suitable for one Notion database row.\n3. Save the markdown to file://reports/market-research-<subject-slug>-<YYYY-MM-DD>.md.\n\nCONSTRAINTS:\n- Do not call Notion tools in this stage.\n- Keep claims tied to source URLs.\n- Mark uncertain claims as hypotheses, not facts.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: {\n    \"notion_row\": {\n      \"Name\": string,\n      \"Subject\": string,\n      \"Date\": string,\n      \"Summary\": string,\n      \"Top Pain Points\": string,\n      \"Opportunity Hypotheses\": string,\n      \"Evidence URLs\": string[]\n    },\n    \"draft_file\": string\n  }\n- schema_version: \"1\"\n- success_criteria:\n    - draft_file exists and is non-empty\n    - notion_row.Evidence URLs is non-empty\n    - Summary is at most 1000 characters",
        "output_contract": "structured_json"
      },
      {
        "node_id": "save-notion-row",
        "agent_id": "notion-writer",
        "depends_on": ["draft-analysis"],
        "objective": "Create one approved Notion database row for the analysis.",
        "prompt": "ROLE: Notion database writer.\n\nINPUTS:\n- database_id: {{ run.input.notion_database_id }}\n- upstream:structured_json.payload.notion_row\n- upstream:structured_json.payload.draft_file\n\nTASK:\n1. Read the draft file for context.\n2. Call mcp.notion.pages_create with parent database_id and the structured Notion row properties.\n3. Include the markdown body or a link/reference to the draft file in the row content.\n\nCONSTRAINTS:\n- This stage requires human approval before mcp.notion.pages_create runs.\n- If approval is denied, stop and leave the draft file untouched.\n- Create exactly one row per run.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: Notion page id or URL\n- artifact_summary: \"Created Notion research row for <subject>\"\n- success_criteria:\n    - location is non-empty\n    - the Notion row contains Subject, Summary, and Evidence URLs",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## SDK call

```ts
import { TandemClient } from "@frumu/tandem-client";

const client = new TandemClient({
  baseUrl: process.env.TANDEM_BASE_URL!,
  token: process.env.TANDEM_API_TOKEN!
});

const created = await client.automationsV2.create(payload);
console.log(created.id, created.status); // status: "paused"
```

## Triggering a manual run

This automation is scheduled, but you can also run it once with scoped
inputs after creation:

```ts
await client.automationsV2.runNow({
  id: "market-research-pain-points-to-notion-row",
  input: {
    subject: "AI scheduling assistants for recruiting teams",
    subreddits: ["recruiting", "humanresources", "sales"],
    notion_database_id: "YOUR_NOTION_DATABASE_ID"
  }
});
```

## Approval gates

- `collect-signals` is read-only and can run automatically.
- `draft-analysis` writes only a workspace artifact and can run
  automatically.
- `save-notion-row` calls `mcp.notion.pages_create`, so the agent's
  `approval_policy` is unset and `handoff_config.auto_approve: false`
  keeps the human approval gate active.

## Why this shape

- The first node is a triage gate. If no useful evidence is found, it
  emits `has_work: false` and downstream writing is skipped.
- Web search and Reddit are isolated in the researcher agent; Notion
  write access exists only on the final writer agent.
- The markdown draft creates an auditable artifact before the Notion
  database row is created.
