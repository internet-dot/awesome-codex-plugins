# Tandem Example Catalog

These examples are reusable starting points for common automations where
Tandem is a strong fit: recurring checks, multiple MCP data sources,
durable artifacts, narrow tool scopes, and human approval before external
writes.

Tool ids are intentionally connector-shaped examples. Before applying any
payload, discover the exact tool ids available in your Tandem engine with
`mcp_list`, `GET /mcp/tools`, or `GET /tool/ids`.

## Research and Go-to-Market

- [`reddit-research-to-notion.md`](./reddit-research-to-notion.md) —
  scan Reddit and publish a reviewed Notion digest.
- [`market-research-pain-points-to-notion-row.md`](./market-research-pain-points-to-notion-row.md) —
  combine web research and Reddit pain points into one Notion database row.
- [`prospect-email-drafts-gmail-approval.md`](./prospect-email-drafts-gmail-approval.md) —
  research prospects, create Gmail drafts, and require final approval
  before sending.

## Support and Customer Success

- [`support-ticket-triage-zendesk-slack.md`](./support-ticket-triage-zendesk-slack.md) —
  triage new tickets, draft internal notes, and escalate approved issues.
- [`churn-risk-monitor-crm-slack.md`](./churn-risk-monitor-crm-slack.md) —
  watch churn signals, draft account plans, and approval-gate Slack/CRM
  follow-up.

## Operations and Finance

- [`meeting-prep-calendar-crm-brief.md`](./meeting-prep-calendar-crm-brief.md) —
  prepare daily customer-meeting briefs from calendar, CRM, and email.
- [`invoice-intake-approval-accounting.md`](./invoice-intake-approval-accounting.md) —
  extract invoice details and create accounting bill drafts after approval.

## Engineering and Security

- [`github-bug-monitor.md`](./github-bug-monitor.md) — monitor new bug
  issues and post approved triage comments.
- [`manual-complex-workflow.md`](./manual-complex-workflow.md) — a
  four-stage review DAG with verification and Slack publication.
- [`repo-task-runner.md`](./repo-task-runner.md) — generate and validate
  workspace patches without external side effects.
- [`security-advisory-triage-github-linear.md`](./security-advisory-triage-github-linear.md) —
  match advisories to dependencies and create approved remediation issues.

## More Ideas Worth Turning Into Examples

- Daily executive KPI digest from Stripe, product analytics, support, and
  CRM into Slack or Notion.
- Competitor launch monitor that watches websites, changelogs, ads, and
  social channels, then drafts sales enablement notes.
- Hiring pipeline reviewer that summarizes candidate feedback and drafts
  recruiter follow-ups without making hiring decisions automatically.
- Contract renewal monitor that scans CRM dates and customer health, drafts
  renewal prep notes, and creates approved CRM tasks.
- Data quality monitor that checks warehouse anomalies and files approved
  incident tickets.
