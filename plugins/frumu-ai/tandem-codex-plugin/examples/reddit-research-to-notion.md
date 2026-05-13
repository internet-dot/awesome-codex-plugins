# Example — Daily Reddit Research → Notion

A two-agent V2 automation that scans configured subreddits each morning,
summarises new posts about a topic, and writes a Notion page **after
explicit approval**.

> Requires MCP servers: `reddit` (or composio reddit equivalent) and
> `notion` (or composio notion equivalent). Connect them in the Tandem
> control panel before applying.

---

## Intent

> Every weekday at 09:00 UTC, scan r/AI_Productivity and r/automation
> for new posts about workflow automation, summarise the top 5, and
> publish a Notion page with the summary. Don't publish until I review.

## Generated V2 automation payload

```json
{
  "name": "reddit-research-to-notion",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": {
    "type": "cron",
    "cron_expression": "0 9 * * 1-5",
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "research",
      "display_name": "Reddit Research",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch", "webfetch", "write"] },
      "mcp_policy": {
        "allowed_servers": ["reddit"],
        "allowed_tools": ["mcp.reddit.search", "mcp.reddit.get_post"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "publish",
      "display_name": "Notion Publisher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
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
        "node_id": "scan",
        "agent_id": "research",
        "objective": "Scan target subreddits and shortlist new posts on workflow automation.",
        "prompt": "ROLE: Reddit researcher.\n\nINPUTS:\n- subreddits: [\"AI_Productivity\", \"automation\"]\n- since: last 24h\n\nTASK:\n1. Use mcp.reddit.search to find new posts.\n2. Filter to posts with score >= 5 and at least one comment.\n3. Read top 10 candidates with mcp.reddit.get_post.\n4. Pick the top 5.\n\nCONSTRAINTS:\n- Read-only. No comments, votes, or DMs.\n- Skip posts older than 24h.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- top_themes[]: string\n- has_work: boolean\n- success_criteria:\n    - findings[] has 0..5 items\n    - has_work is true iff findings[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft",
        "agent_id": "publish",
        "depends_on": ["scan"],
        "objective": "Draft a Notion page summarising the findings.",
        "prompt": "ROLE: Notion publisher.\n\nINPUTS:\n- upstream:research_brief.findings[]\n- upstream:research_brief.top_themes[]\n\nTASK:\n1. Compose a markdown page titled \"Daily AI Productivity Digest — <YYYY-MM-DD>\".\n2. One section per finding (title, summary, source_url).\n3. Append a \"Themes\" section with top_themes[].\n\nCONSTRAINTS:\n- Do not call mcp.notion.pages_create yet. This stage drafts only.\n- Output to file://reports/reddit-digest-<YYYY-MM-DD>.md.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"file\"\n- location: file path of the draft markdown\n- artifact_summary: one-line description\n- success_criteria:\n    - file exists and is non-empty\n    - title contains today's date",
        "output_contract": "artifact"
      },
      {
        "node_id": "publish",
        "agent_id": "publish",
        "depends_on": ["draft"],
        "objective": "Publish the drafted page to Notion after explicit approval.",
        "prompt": "ROLE: Notion publisher.\n\nINPUTS:\n- upstream:artifact.location (markdown file)\n\nTASK:\n1. Read the markdown file from upstream.\n2. Call mcp.notion.pages_create with the database id and the markdown body.\n\nCONSTRAINTS:\n- This stage requires human approval before mcp.notion.pages_create runs.\n- If approval is denied, stop. Do not retry.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: Notion page id\n- artifact_summary: \"Published to Notion: <page url>\"\n- success_criteria:\n    - Notion page id is non-empty\n    - location is a valid Notion page url after lookup",
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
  token:   process.env.TANDEM_API_TOKEN!
});

const created = await client.automationsV2.create(payload);
console.log(created.id, created.status); // status: "paused"
```

## After applying

1. Inspect in Tandem control panel → Agent Automation → Scheduled Bots.
2. If correct, switch `status` to `"active"`.
3. The first run produces the markdown draft and pauses awaiting
   approval before `publish.publish` runs.

## Approval gates

- `publish.publish` calls `mcp.notion.pages_create`. The agent's
  `approval_policy` is unset; the engine's default approval flow fires
  before the MCP write executes.
- `external_integrations_allowed: true` is required for Notion writes
  but does *not* skip approval.
- `handoff_config.auto_approve: false` keeps the gate active across
  cycles.

## Why this shape

- Triage gate (`metadata.triage_gate: true`) means days with no new
  posts skip the Notion publish entirely.
- Two agents, not one, so the read agent can use a small fast model
  while the publisher uses a stronger one for prose quality.
- `draft` and `publish` are split so the draft is auditable as a
  workspace file before any external write.
