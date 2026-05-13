# Example — Security Advisory Triage → GitHub/Linear Issue

A V2 automation that monitors security advisories against a repository's
dependency manifests, drafts a risk assessment, and creates an issue in
GitHub or Linear **after approval**.

> Requires MCP servers: `github` and optionally `linear`. Uses built-in
> web search/fetch for public advisory context. Tool ids are illustrative.

---

## Intent

> Every hour, check for new security advisories that affect this repo's
> dependencies. Draft an impact assessment and ask before opening a
> GitHub or Linear issue.

## Generated V2 automation payload

```json
{
  "name": "security-advisory-triage-github-linear",
  "status": "paused",
  "creator_id": "codex-plugin",
  "workspace_root": ".",
  "schedule": {
    "type": "interval",
    "interval_seconds": 3600,
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "metadata": { "triage_gate": true },
  "agents": [
    {
      "agent_id": "advisory-scout",
      "display_name": "Advisory Scout",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch", "webfetch"] },
      "mcp_policy": {
        "allowed_servers": ["github"],
        "allowed_tools": ["mcp.github.repository_get_contents", "mcp.github.security_advisories_list"]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "security-analyst",
      "display_name": "Security Analyst",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "issue-publisher",
      "display_name": "Issue Publisher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["github", "linear"],
        "allowed_tools": ["mcp.github.issues_create", "mcp.linear.issues_create"]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "match-advisories",
        "agent_id": "advisory-scout",
        "objective": "Match fresh security advisories against repository dependencies.",
        "prompt": "ROLE: Security advisory scout.\n\nINPUTS:\n- repo: {{ run.input.repo }}\n- dependency_files: {{ run.input.dependency_files | default([\"package-lock.json\", \"pnpm-lock.yaml\", \"requirements.txt\", \"go.sum\", \"Cargo.lock\"]) }}\n- since: last hour\n\nTASK:\n1. Read dependency files from the repo with mcp.github.repository_get_contents or workspace read.\n2. Call mcp.github.security_advisories_list and use websearch/webfetch for public CVE context when needed.\n3. Match advisories to dependency names and installed versions.\n4. Ignore advisories that do not affect observed dependencies.\n\nCONSTRAINTS:\n- Read-only. Do not open issues or branches.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- affected_dependencies[]: { package, installed_version, fixed_version, advisory_url, severity }\n- has_work: boolean\n- success_criteria:\n    - every affected dependency maps to an observed dependency file\n    - has_work is true iff affected_dependencies[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-impact",
        "agent_id": "security-analyst",
        "depends_on": ["match-advisories"],
        "objective": "Draft a security impact assessment and remediation issue body.",
        "prompt": "ROLE: Security analyst.\n\nINPUTS:\n- upstream:research_brief.affected_dependencies[]\n- upstream:research_brief.findings[]\n\nTASK:\n1. Assess exploitability, affected runtime paths, likely upgrade path, and urgency.\n2. Draft a remediation issue body with checklist and references.\n3. Save the assessment to file://reports/security-advisory-<YYYY-MM-DD-HH>.md.\n\nCONSTRAINTS:\n- Do not claim exploitability unless evidence supports it.\n- Draft only. Do not create issues.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"issues\": [ { \"title\", \"body\", \"severity\", \"labels\", \"source_urls\" } ], \"assessment_file\": string }\n- schema_version: \"1\"\n- success_criteria:\n    - assessment_file exists and is non-empty\n    - every issue body includes references and a remediation checklist",
        "output_contract": "structured_json"
      },
      {
        "node_id": "create-approved-issues",
        "agent_id": "issue-publisher",
        "depends_on": ["draft-impact"],
        "objective": "Create approved GitHub or Linear issues for remediation.",
        "prompt": "ROLE: Issue publisher.\n\nINPUTS:\n- upstream:structured_json.payload.issues[]\n- target: {{ run.input.issue_target | default(\"github\") }}\n\nTASK:\n1. For each approved issue, create it in GitHub or Linear based on target.\n2. Use mcp.github.issues_create for GitHub or mcp.linear.issues_create for Linear.\n3. Return created issue URLs.\n\nCONSTRAINTS:\n- Requires human approval before every issue creation.\n- Do not assign owners or set due dates unless explicitly approved in the run input.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of issue URLs\n- artifact_summary: \"Created approved security remediation issues\"\n- success_criteria:\n    - location contains only created issue URLs",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Why this shape

- It combines workspace/repo evidence with public advisory context.
- Issue creation is separated from analysis and approval-gated.
- The triage gate keeps hourly checks cheap when no dependencies are
  affected.
