# Tandem API Discovery Notes

This file is the plugin's source-of-truth log for what we know about
Tandem's HTTP API and SDK, plus a clearly marked list of fields and
behaviours we have **not** verified.

Sources used so far:

- `docs.tandem.ac` (stable channel) via the Tandem Docs MCP.
- `@frumu/tandem-client` README and registry metadata on npmjs.com.
- User-supplied source-level facts from `frumu-ai/tandem`
  (`packages/tandem-client-ts/src/`).

---

## Verified SDK surface (`@frumu/tandem-client`)

### `TandemClient` constructor — source-verified

```ts
new TandemClient({
  baseUrl: "http://127.0.0.1:39731",
  token: "<engine-token>",
  timeoutMs?: number,
});
```

- The constructor takes a string `token`. The SDK does **not** itself
  read `TANDEM_API_TOKEN` or `TANDEM_API_TOKEN_FILE`; the plugin's
  helper scripts resolve those env vars and pass the resulting string.
- `_request` sends the token as `Authorization: Bearer <token>`.
- `client.health()` exists and calls `GET /global/health`.

### `client.providers` — source-verified

The SDK exposes provider/model configuration separately from Codex auth
and separately from the Tandem engine token:

```ts
client.providers.catalog();                  // list providers/models
client.providers.config();                   // current provider config
client.providers.setDefaults(providerId, modelId);
client.providers.setApiKey(providerId, apiKey);
client.providers.oauthAuthorize(providerId);
client.providers.oauthStatus(providerId, sessionId?);
client.providers.oauthUseLocalSession(providerId);
client.providers.oauthDisconnect(providerId);
client.providers.authStatus();
```

Codex authentication does not configure these providers. Workflows that
execute model work need Tandem provider readiness from this API or from
engine configuration/CLI setup through `tandem-engine`.

### `client.workflowPlans` — source-verified shapes

All of these use camelCase argument keys (the SDK maps to API
snake_case internally):

```ts
client.workflowPlans.preview({
  prompt: string,
  planSource: string,         // e.g. "intent_planner_page" | "planner_page"
  workspaceRoot?: string,
});

client.workflowPlans.chatStart({
  prompt: string,
  planSource: string,
  workspaceRoot?: string,
});

client.workflowPlans.chatMessage({
  planId: string,
  message: string,
});

client.workflowPlans.apply({
  planId: string,
  creatorId: string,
});

client.workflowPlans.importPreview({
  bundle: unknown,            // engine-issued plan_package_bundle
});

client.workflowPlans.importPlan({
  bundle: unknown,
});
```

The documented planner-page flow is:

```
chatStart  →  chatMessage (loop until satisfactory)  →  apply  →  importPreview  →  importPlan
```

Note: `preview` is a **prompt-based one-shot**; it does not take a
`planId`. Older plugin docs that said `/preview-workflow <plan_id>`
were wrong and have been corrected.

### `client.automationsV2` — surface verified, signatures partial

SDK methods present on the namespace:
`create, runNow, listRuns, getRun, pauseRun, resumeRun, repair`.

Per-agent V2 fields verified:

```json
{
  "agent_id": "research",
  "display_name": "Research",
  "model_policy": {
    "default_model": { "provider_id": "<confirmed-provider-id>", "model_id": "<confirmed-model-id>" }
  },
  "tool_policy": {
    "allowlist": ["read", "websearch"],
    "denylist": []
  },
  "mcp_policy": {
    "allowed_servers": ["composio"],
    "allowed_tools": ["mcp.composio.github_issues_list"]
  },
  "approval_policy": "auto",
  "skills": []
}
```

Automation-level fields verified:

- `name`, `status: "active" | "paused"`
- `schedule` (V2 shape — see below)
- `agents[]`
- `flow.nodes[]` with `node_id`, `agent_id`, `objective`, `prompt`,
  `output_contract`, `depends_on[]`
- `workspace_root`
- `creator_id`
- `handoff_config.auto_approve: false`
- `metadata.triage_gate: true`
- `external_integrations_allowed: false | true`
- `requires_approval` (legacy routine field)
- Capability flags: `creates_agents`, `modifies_grants` (require approval)

V2 schedule shapes:

```json
{
  "type": "interval",
  "interval_seconds": 86400,
  "timezone": "UTC",
  "misfire_policy": { "type": "run_once" }
}
```

```json
{
  "type": "cron",
  "cron_expression": "0 8 * * *",
  "timezone": "UTC",
  "misfire_policy": { "type": "run_once" }
}
```

Routines (legacy): `{ "type": "interval", "intervalMs": 3600000 }` or a
cron string `"0 8 * * *"`.

### `client.mcp`

Verified endpoints (docs):

- `POST /mcp` — add a server.
- `POST /mcp/{name}/connect`
- `POST /mcp/{name}/refresh`
- `PATCH /mcp/{name}` — update allowlist, etc.
- `GET  /mcp/tools` — list discovered tools.
- `GET  /tool/ids` — list all tool ids (built-in + MCP).

### Mission builder

- `POST /mission-builder/compile-preview`
- `POST /mission-builder/apply`

Surface only — full request body shape is not yet source-verified.

### Auth (engine side)

- Header forms (any one): `X-Agent-Token: <tok>`, `X-Tandem-Token: <tok>`,
  `Authorization: Bearer <tok>`.
- Plugin/SDK helper-script env vars: `TANDEM_API_TOKEN`,
  `TANDEM_API_TOKEN_FILE`. Both are read by the helper scripts (not by
  the SDK constructor itself); the resolved string is then passed to
  `new TandemClient({ token })`.
- Dev escape hatch: `TANDEM_UNSAFE_NO_API_TOKEN=1` (warns on every
  request; not for shared/hosted engines).

---

## Open questions to verify in source

These are referenced by the user's original spec or by docs in ways
we have not verified end-to-end. The plugin avoids fabricating them;
instead, the design defers to engine validation or asks the user.

### 1. Execution-profile enum (Strict / Guided / YOLO)

- **Status:** *Not* found in the public stable docs as a named enum.
- **Plan:** the plugin substitutes the verified policy primitives —
  `approval_policy`, `requires_approval`, `tool_policy`, `mcp_policy`,
  `scope_policy`, `handoff_config.auto_approve`,
  `external_integrations_allowed`, capability flags — to express the
  same gradient.
- **Verify:** `crates/tandem-server/src/automation_v2/types.rs` and
  `crates/tandem-plan-compiler/src/api.rs` in `frumu-ai/tandem`. Look
  for `ExecutionProfile`, `RunMode`, `Strictness`, or similar.

### 2. Output-contract named enum

- **Status:** *Not* documented as a named enum in stable docs.
- **Plan:** `tandem-output-contracts.md` presents five **patterns** for
  the per-stage prompt's `REQUIRED OUTPUT` block, not engine-level enum
  values.
- **Verify:** plan-compiler source for an `OutputContract` or
  `ContractKind` enum.

### 3. Full set of `approval_policy` values

- **Verified value:** `"auto"`.
- **Suspected:** other values exist (e.g. `"required"`, `"gated"`).
- **Plan:** when the user wants a non-`auto` policy, leave the field
  unset and rely on the engine's default approval flow + per-node
  `requires_approval` behaviour, then verify the exact enum in source.

### 4. Single-automation getter for V2

- **Verified namespace methods:** `create, runNow, listRuns, getRun,
  pauseRun, resumeRun, repair`.
- **Not verified:** `automationsV2.get(automationId)` for a
  point-in-time view of an automation's config (separate from runs).
- **Plan:** `/run-workflow` does **not** pre-fetch the automation;
  the user confirms the id + intent in plain language, and the
  control panel or `listRuns` gives them context.

### 5. `mcpServers` field shape inside `plugin.json`

- **Verified:** Codex plugin docs use top-level
  `"mcpServers": "./.mcp.json"`.
- **Verified:** `.mcp.json` may contain a wrapped `mcp_servers` object.
- **Current plugin:** bundles Tandem Docs MCP as `tandemDocs` at
  `https://tandem.ac/mcp`.

### 6. Mission-builder detailed schema

- **Verified:** endpoints exist (`compile-preview`, `apply`).
- **Not verified:** the full request body shape for multi-stage
  mission compilation.
- **Plan:** route mission requests through `workflowPlans.chatStart`
  unless the user specifically asks for the mission-builder path.

### 7. Repair API specifics

- **Verified:** `client.automationsV2.repair` exists.
- **Not verified:** repair input schema and what the engine reports
  back.
- **Plan:** route imported-bundle issues through `importPreview` first
  and only call `repair` on the user's explicit request.

---

## Files to read for verification

When you do have access to the `frumu-ai/tandem` source:

- `crates/tandem-server/src/automation_v2/types.rs`
- `crates/tandem-server/src/http/automations_v2.rs`
- `crates/tandem-server/src/http/workflow_planner_parts/`
- `crates/tandem-plan-compiler/src/api.rs`
- `crates/tandem-plan-compiler/src/output_contract.rs` (if it exists)
- `packages/tandem-client-ts/src/client.ts`  ← `TandemClient`,
  `_request`, `health()`, `workflowPlans.*` shapes
- `packages/tandem-client-ts/src/index.ts`  ← exported types
- `packages/tandem-client-py/src/tandem_client/`

## Citations

- Auth: <https://docs.tandem.ac/engine-authentication-for-agents/>
- Scheduling: <https://docs.tandem.ac/sdk/scheduling-automations/>
- MCP automated agents: <https://docs.tandem.ac/mcp-automated-agents/>
- TypeScript SDK: <https://docs.tandem.ac/sdk/typescript/>
- Python SDK: <https://docs.tandem.ac/sdk/python/>
- npm: <https://www.npmjs.com/package/@frumu/tandem-client>
- npm: <https://www.npmjs.com/package/@frumu/tandem>
- npm: <https://www.npmjs.com/package/@frumu/tandem-panel>
