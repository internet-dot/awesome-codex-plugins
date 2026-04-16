# Model Selection Reference

Shared reference for session-plan and wave-executor when determining which model to use for agent dispatch.

## Priority Order

1. **Agent definition** — if the agent `.md` file has a `model:` frontmatter field, use it (e.g., a domain-specific `compliance-reviewer` agent might specify `opus`)
2. **Task-type matrix** — use the table below based on what the agent will do
3. **Wave role default** — if neither of the above applies

## Claude Code Model Matrix

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| File exploration, git history, pattern search | `haiku` | Fast, cost-effective, read-only |
| Standard implementation (features, APIs, refactoring) | `sonnet` | Balance of speed and quality |
| Test writing | `sonnet` | Pattern recognition + code generation |
| UI/Frontend implementation | `sonnet` | Component composition, styling |
| Database schema, migrations | `sonnet` | Structural reasoning |
| Security review | `sonnet` | Analytical depth for vulnerability detection |
| Quality review (session-reviewer) | `sonnet` | Code analysis, pattern matching |
| Architecture decisions, complex planning | `opus` | Nuanced trade-off reasoning |
| Legal/compliance analysis (domain-specific) | `opus` | Zero tolerance for errors |
| Session orchestration (session-start, session-plan) | `opus` | Complex coordination, multi-source synthesis |

## Wave Role Defaults

| Wave Role | Default Model |
|-----------|---------------|
| Discovery | `haiku` (via Explore subagent) |
| Impl-Core | `sonnet` |
| Impl-Polish | `sonnet` |
| Quality | `sonnet` |
| Finalization | inherits coordinator model (direct execution) |

## Cross-Platform Equivalents

### Codex CLI

| Claude Code | Codex CLI |
|-------------|-----------|
| `haiku` | `gpt-5.4-mini` |
| `sonnet` | `gpt-5.4-mini` |
| `opus` | `gpt-5.4` |

### Cursor IDE

Cursor uses Claude models directly:
- `claude-opus-4-6` for planning and complex tasks
- `claude-sonnet-4-6` for implementation and review

## Usage in Agent Dispatch

When dispatching via the Agent tool, set the `model` parameter only when overriding the agent's default:

```
Agent({
  subagent_type: "session-orchestrator:code-implementer",
  model: "sonnet",    // only needed if overriding the agent's frontmatter model
  ...
})
```

If the agent definition already specifies `model: sonnet`, omitting the `model` parameter in the dispatch is sufficient — the agent's frontmatter takes effect automatically.
