# Approval Gates Mapping

The plugin treats nine categories as **always approval-gated**. This file
maps those categories to verified Tandem policy primitives so you know
exactly which fields to set.

The verified Tandem primitives we use:

- `approval_policy` (per-agent; verified value: `"auto"` for read-only)
- `requires_approval` (legacy routine; per-routine boolean)
- `handoff_config.auto_approve` (automation level; `false` keeps gates
  active across handoffs)
- `external_integrations_allowed` (automation level)
- Capability flags: `creates_agents`, `modifies_grants` (require
  approval at the engine when set)
- `tool_policy.allowlist[]` and `mcp_policy.allowed_tools[]` (the agent
  literally cannot call a tool that isn't here)
- `scope_policy` (workspace and file-scope constraints)

---

## Approval gates are not action nodes

An approval gate records a human decision. It should not be the last node
that is expected to perform the external side-effect.

Use this shape whenever approval should permit a later action:

1. **Prepare/draft node** creates the candidate artifact and records its
   id, URL, recipient/target, and preview.
2. **Approval node** presents that artifact and collects one of the
   explicit decisions, such as `approve`, `rework`, or `cancel`.
3. **Execution node** depends on the approval node, reads the artifact id
   from the prepare/draft node, calls the concrete external tool, and
   returns the external tool receipt.

Do not give the approval node the send/publish/delete tool. Put that tool
only on the downstream execution node. Rework decisions should target the
upstream prepare/draft nodes, not the execution node.

For MCP side-effects, exact tool ids must appear in
`tool_policy.allowlist[]` and `mcp_policy.allowed_tools[]`. Avoid
server-level grants or wildcards for Gmail, Slack, Notion, GitHub, paid
APIs, or destructive tools unless the user explicitly approves that broad
surface.

---

## The nine categories and what to set

### 1. Destructive operations

Examples: `git reset --hard`, `git push --force`, `rm -rf`, dropping a
DB table, archiving a Notion page, deleting a Slack channel.

**Set:**
- The destructive tool **must not** be in any agent's
  `tool_policy.allowlist`. Use a separate "destruction" agent with a
  narrow allowlist.
- That agent's `approval_policy` is unset (so engine default approval
  flow applies).
- `handoff_config.auto_approve: false` on the automation.

### 2. External side-effects

Examples: Slack post, email send, Notion page create, GitHub PR/issue,
Discord message, Stripe charge.

**Set:**
- `external_integrations_allowed: true` (necessary for the engine to
  even consider running the tool).
- The concrete MCP write tool listed in both `tool_policy.allowlist` and
  `mcp_policy.allowed_tools` for **only** the agent that needs it.
- Keep `mcp_policy.allowed_servers` empty when the concrete tool id is
  known; use server-level grants only when broad access is intentional.
- That agent's `approval_policy` unset (gated by default).
- If approval should trigger a later action, split the approval gate and
  the execution node.

### 3. Public publication

Anything visible to non-team users (a public blog post, a public Notion
page, a tweet).

**Set:**
- All of category 2's settings.
- A pre-publish verifier node with `output_contract: review_decision`
  that must `approve` before the publish node runs.

### 4. Paid actions

Examples: paid API calls (Stripe, Twilio SMS, paid OpenRouter models in
production).

**Set:**
- All of category 2's settings.
- A budget guard node early in the DAG that checks usage and emits
  `has_work: false` when over budget.

### 5. Irreversible operations

Examples: DB migrations, account password resets, data deletions,
permission revocation.

**Set:**
- Treat as destructive (category 1) AND require explicit human approval
  per run (no `approval_policy: "auto"` anywhere on the path).

### 6. Capability escalation

Tandem flags two specifically:

- `creates_agents` — adding a new agent at runtime.
- `modifies_grants` — changing tool/MCP allowlists at runtime.

**Set:**
- Don't enable these without explicit user approval per automation.
- Surface in the plan summary every time they appear.

### 7. First-time use of a new MCP tool

A tool the agent has never used in a previous run of this workflow.

**Set:**
- Add the tool to `tool_policy.allowlist` and
  `mcp_policy.allowed_tools` *before* the run.
- Pause-create the automation so the user inspects the new tool list.
- Once the run succeeds, treat that tool as known for the workflow.

### 8. Use of a tool not on the agent's current allowlist

The user asks the agent to do X, but X requires a tool not in
`tool_policy.allowlist` or `mcp_policy.allowed_tools`.

**Set:**
- Refuse. The skill should not silently expand the allowlist mid-run.
- Tell the user the missing tool and ask whether to add it.

### 9. Schedule changes that broaden scope

Examples: shrinking interval from daily to every minute, adding cron
firings during off-hours, removing the triage gate.

**Set:**
- Always show the diff (old vs new schedule) in the revision summary.
- Require explicit "yes, broaden" from the user.

---

## Worked example — Reddit research → Notion publish

Two agents:

```json
[
  {
    "agent_id": "research",
    "display_name": "Reddit Research",
    "tool_policy": { "allowlist": ["read", "websearch", "webfetch"] },
    "mcp_policy": {
      "allowed_servers": ["reddit"],
      "allowed_tools": ["mcp.reddit.search", "mcp.reddit.get_post"]
    },
    "approval_policy": "auto"
  },
  {
    "agent_id": "publish",
    "display_name": "Notion Publisher",
    "tool_policy": { "allowlist": ["read", "write"] },
    "mcp_policy": {
      "allowed_servers": ["notion"],
      "allowed_tools": ["mcp.notion.pages_create"]
    }
  }
]
```

- `research` is read-only and `approval_policy: "auto"` — fine.
- `publish` writes externally; `approval_policy` is left unset so the
  engine's default approval gate fires before `mcp.notion.pages_create`
  runs.
- Automation level: `external_integrations_allowed: true`,
  `handoff_config.auto_approve: false`.

Result: the user is asked to approve the Notion write each cycle.
