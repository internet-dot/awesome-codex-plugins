---
name: mcp-builder
description: Use when creating a new MCP (Model Context Protocol) server, extending an existing one, or debugging tool discoverability/performance. Guides through research → implementation → test → eval phases with TypeScript-first guidance matching our stack. Trigger on phrases like "build an MCP server", "expose X as an MCP tool", "write MCP tools for Y", "integrate Z via MCP".
---

# MCP Server Development

Adapted from [anthropics/skills/mcp-builder](https://github.com/anthropics/skills/tree/main/skills/mcp-builder). MCP-server quality is measured by how well it lets LLMs accomplish real-world tasks — not by endpoint count.

## Stack default for our projects

- **Language:** TypeScript (matches our stack; static typing + Zod schemas + good LLM code-gen)
- **Transport:** `stdio` for local tools, **Streamable HTTP (stateless JSON)** for remote
- **SDK:** [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk)
- **Package manager:** pnpm (never npm/yarn in our repos)

## Phase 1 — Research & Plan

### 1.1 Design principles

**API coverage vs. workflow tools.** Balance comprehensive endpoint coverage with specialized workflow shortcuts. Default to coverage unless you have a clear reason — agents compose basic tools well; workflow tools ossify.

**Tool naming & discoverability.** Consistent prefix + action verb. Examples:
- `github_create_issue`, `github_list_repos`
- `gitlab_search_issues`, `gitlab_close_mr`

**Context management.** Return focused, paginated data. Agents suffer when a single tool call floods context.

**Actionable error messages.** Errors must guide the next action:

```
❌ "Invalid input"
✅ "Field 'project_id' is required. Call gitlab_list_projects to enumerate available IDs."
```

### 1.2 Read the spec

- Sitemap: `https://modelcontextprotocol.io/sitemap.xml`
- Append `.md` to any page URL for markdown (e.g. `https://modelcontextprotocol.io/specification/draft.md`)

Focus on: tool definitions, resource definitions, transport mechanisms.

### 1.3 Load SDK docs

- TS SDK README: `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- Python SDK README: `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`

Fetch via WebFetch only when needed — don't dump entire docs into context upfront.

### 1.4 Plan implementation

- Review the target service's API docs (auth, core endpoints, data models)
- List endpoints by priority — most-common operations first
- Identify destructive vs. read-only operations (matters for tool annotations)

## Phase 2 — Implementation

### 2.1 Project structure (TypeScript)

```
mcp-server-name/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            (server entry, transport wiring)
│   ├── tools/              (one file per tool or tool group)
│   ├── schemas.ts          (shared Zod schemas)
│   └── client.ts           (API client with auth + error handling)
└── README.md               (setup + config)
```

### 2.2 Core infrastructure

Build once, reuse everywhere:
- API client with auth (env-var-driven, never hardcoded)
- Error-handler helper that returns actionable MCP error responses
- Pagination helper (most APIs paginate; most tools forget)
- Response formatter (JSON for structured, Markdown for human-readable where agents benefit from it)

### 2.3 Implement tools

For each tool:

**Input schema** — Zod, with descriptions per field:
```ts
z.object({
  projectId: z.string().describe("GitLab project ID. Call gitlab_list_projects to discover."),
  state: z.enum(["opened", "closed", "all"]).default("opened"),
});
```

**Output schema** — define `outputSchema` where possible; use `structuredContent` in tool responses (TS SDK feature). This helps downstream agents parse results.

**Annotations** — set all four:
- `readOnlyHint: true/false`
- `destructiveHint: true/false`
- `idempotentHint: true/false`
- `openWorldHint: true/false`

These inform Claude's hook decisions (destructive-guard, permission prompts).

**Implementation** — async/await for I/O; errors must surface with enough context for the LLM to fix them.

## Phase 3 — Review & Test

### 3.1 Code quality

- DRY — no duplicated API-call logic
- Consistent error handling (one helper, not ad-hoc throws)
- Full TypeScript coverage — `tsgo --noEmit` or `tsc --noEmit` clean
- Clear tool descriptions

### 3.2 Build & test

```bash
pnpm build              # or npm run build in non-pnpm projects
npx @modelcontextprotocol/inspector   # interactive testing UI
```

Walk through every tool in the Inspector. If a tool can fail, trigger the failure and verify the error message is actionable.

## Phase 4 — Evaluations

Create 10 evaluation questions. An MCP server without evals is a guess, not a deliverable.

Each question must be:
- **Independent** — doesn't depend on a previous question's answer
- **Read-only** — no destructive side effects
- **Complex** — requires multiple tool calls, not a single lookup
- **Realistic** — a real user would actually ask this
- **Verifiable** — has a single correct answer checkable by string comparison
- **Stable** — answer doesn't change over time

### Output format

```xml
<evaluation>
  <qa_pair>
    <question>Which GitLab project in group 'X' has the highest number of open issues labeled 'bug'?</question>
    <answer>project-name-here</answer>
  </qa_pair>
</evaluation>
```

Run the eval via: Claude-with-MCP-server on each question, compare output to expected answer. Any eval below 80% accuracy signals tool-design problems (usually: unclear descriptions, missing pagination, or bad error messages).

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| Tool returns 10k rows, agent context blows up | Add pagination + default page size |
| Agent can't figure out auth failure | Error message: "Set ENV_VAR_NAME — current value is empty" |
| Tool name collision across MCP servers | Always prefix with service name |
| Destructive tools without `destructiveHint: true` | Breaks our destructive-guard hook |
| Async errors swallowed | Wrap every handler in try/catch that returns structured error |

## References

Upstream reference material (worth reading once, not mirroring here):
- [MCP Best Practices](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/mcp_best_practices.md)
- [TypeScript Implementation Guide](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/node_mcp_server.md)
- [Python Implementation Guide](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/python_mcp_server.md)
- [Evaluation Guide](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/evaluation.md)
