# Tandem Workflow Design Rules

Use this as the per-stage checklist when designing or reviewing a Tandem
workflow. Every node in a V2 DAG should be able to answer every question
here in one sentence.

## 1. Trigger and schedule

- **What kicks this off?** Manual? Cron? Interval? Webhook? Watch
  condition?
- **Schedule shape (V2):**
  ```json
  {
    "type": "interval",
    "interval_seconds": 86400,
    "timezone": "UTC",
    "misfire_policy": { "type": "run_once" }
  }
  ```
  Or `{"type": "cron", "cron_expression": "0 8 * * *", "timezone": "UTC", "misfire_policy": {"type":"run_once"}}`.
- **Triage gate.** If most cycles will have nothing to do, add
  `metadata.triage_gate: true` so the engine skips when the first node
  reports `has_work: false`. Saves tokens.

## 2. Inputs

- What does this stage need from the trigger or upstream nodes?
- Document with `input_refs` or by writing them into the prompt's
  `INPUTS:` block.
- Workspace inputs: set `workspace_root` on the automation when files
  matter.

## 3. Outputs and artifacts

- Where does the output land?
  - `file://reports/foo.md` for a workspace artifact.
  - A specific MCP write tool (e.g. `mcp.composio.notion_pages_create`).
  - A Tandem channel post (orchestrated `notifier` role).
- Every node has an `output_contract`. See
  `tandem-output-contracts.md` for the five patterns.

## 4. Output contract

Every node states, in the prompt's `REQUIRED OUTPUT` block, the exact
fields the next stage will read. Examples:

- `findings[]: { url, title, summary }`
- `decision: "approve" | "request_changes"`
- `patch: unified-diff string`

If a downstream stage can't deserialise the upstream output, that's a
contract bug. Validate by reading the next stage's prompt.

## 5. Approval gates

Default to **gated** for any external write. See
`tandem-approval-gates.md` for the full list. Concretely:

- Reading: `approval_policy: "auto"` is fine for read-only agents.
- Writing externally (Notion, Slack, GitHub PR/issue, email, paid APIs,
  public publication, irreversible ops, capability escalation): leave
  `approval_policy` unset on that agent so the engine's default approval
  flow applies, or set it explicitly to a non-auto value (verify against
  the source — see `tandem-api-discovery-notes.md`).
- Add a comment in the per-stage prompt that names the approver so the
  reviewer knows what they're signing off on.
- Treat approval nodes as decision-only. If approval should cause an
  external action, add a separate downstream execution node that reads
  the approved artifact and calls the concrete tool.

## 6. MCP requirements

- List every MCP tool the agent will use, fully qualified
  (`mcp.<server>.<tool>`).
- Set `mcp_policy.allowed_servers[]` and `mcp_policy.allowed_tools[]`
  precisely. Do not leave them empty just because Tandem can discover
  them — explicit allowlists are the whole point of Tandem's "strict
  tool isolation" model.
- Also put concrete MCP tool ids in `tool_policy.allowlist[]`. For
  execution, this is the policy surface the runtime uses to decide which
  concrete tools to offer to a node.
- Avoid `allowed_servers[]` and wildcard grants (`mcp.<server>.*`) for
  safety-critical side-effect stages. Prefer:
  ```json
  {
    "tool_policy": {
      "allowlist": ["read", "mcp_list", "mcp.<gmail-server>.gmail_create_email_draft"]
    },
    "mcp_policy": {
      "allowed_servers": [],
      "allowed_tools": ["mcp.<gmail-server>.gmail_create_email_draft"]
    }
  }
  ```
- If a needed MCP server isn't connected (`client.mcp.list` doesn't
  show it), pause and ask the user to connect it. Do not fabricate a
  tool name.

## 6a. External MCP side-effect pattern

When a workflow both prepares and executes an external action, separate
tool access by stage:

- Draft/create node: only draft/create/read tools. No send/publish tool.
- Approval node: no external write tools. It presents recipient, target,
  content preview, artifact id, and the approve/rework/cancel choices.
- Execution node: only the final concrete action tool and read tools
  needed to fetch the approved artifact.

Declare a durable output target for every side-effect node, for example:

```json
{
  "metadata": {
    "builder": {
      "output_path": ".tandem/artifacts/<workflow>/<node>.json"
    }
  }
}
```

The final output should include `status`, the external id or URL returned
by the tool, `tool_used`, and evidence that the concrete tool executed.
Creating or updating a draft is not evidence that a later send/publish
step executed.

## 7. Scope

- For workspace-scoped workflows: set `workspace_root` to the repo or
  directory.
- Use `scope_policy` to constrain what files the agents can touch.
- Public bots in shared channels: tighten the allowlist to read-only
  + KB MCP grounding (see Tandem KB grounding docs).

## 8. Validation criteria

In the per-stage prompt's `success_criteria`, write specific,
checkable conditions:

- "Output contains at least one finding."
- "Patch applies cleanly with `git apply --check`."
- "All `decision` values are one of `approve|request_changes|noop`."

Prefer single-line, single-fact criteria. The engine's verifier role
checks them.

## 9. Model policy

- Default to a small, fast model for read/triage stages.
- Use a stronger model for verifier and orchestrator roles.
- Do not assume Codex authentication gives Tandem model access. Confirm
  Tandem provider readiness with `client.providers.config()` or ask the
  user which Tandem-configured provider/model to use.
- Prefer Tandem's configured engine default when it exists. Omit
  `model_policy` in local-only drafts if the provider/model is not yet
  known; let validation or `/tandem-doctor` surface the missing setup.
- Example using confirmed provider/model ids only:
  ```json
  {
    "model_policy": {
      "default_model": {
        "provider_id": "<confirmed-provider-id>",
        "model_id": "<confirmed-model-id>"
      }
    }
  }
  ```
- Specify per-role models when you have an orchestrated DAG and those
  provider/model ids are confirmed:
  ```json
  {
    "role_models": {
      "orchestrator": { "provider_id": "<confirmed-provider-id>", "model_id": "<confirmed-strong-model-id>" },
      "verifier":     { "provider_id": "<confirmed-provider-id>", "model_id": "<confirmed-strong-model-id>" }
    }
  }
  ```

## 10. Smart Heartbeats / triage gate

If the workflow runs frequently but most cycles have no work:

```json
{ "metadata": { "triage_gate": true } }
```

The first node should emit `has_work: false` when there's nothing to do.
Tandem skips the rest of the DAG and counts the cycle as a no-op.

## No-go without approval

These categories are **always** approval-gated by this plugin's design:

1. Destructive operations (delete, drop, archive, force-push).
2. External side-effects (Slack post, email, Notion write, GitHub PR/issue).
3. Public publication (anything visible to non-team users).
4. Paid actions (anything that costs money outside the Tandem run cost).
5. Irreversible operations (DB migrations, account changes).
6. Capability escalation (`creates_agents: true`, `modifies_grants: true`).
7. First-time use of a new MCP tool not previously approved.
8. Use of any tool not on the agent's current allowlist.
9. Schedule changes that broaden scope (e.g. interval shrinking from
   daily to every minute, or cron firing outside business hours).

If the user wants to skip approval for a category, log the choice in
the automation's prompt comment so it's auditable.
