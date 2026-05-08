# Worker Specs

> Per-worker model, tool, and prompt isolation for `/crank` and `/swarm`. Schema: `schemas/worker-spec.v1.schema.json`.

## Why

Anthropic's Managed Agents launch (May 2026) gives each specialist its own model, prompt, and tool set. AgentOps workers currently inherit the lead agent's tools — fine for most cases but limits the "haiku-lead delegates to opus-implementer" pattern that smaller managed-agent setups exploit.

A worker spec is a small YAML/JSON file declaring which model, tool subset, and prompt template a worker uses. `/crank` reads the spec at spawn time, the worker inherits only the declared surface.

## When to use a spec

| Situation | Use a spec? |
|---|---|
| All workers in the wave do the same thing (e.g. all docs edits) | No — inherit lead defaults |
| Different roles in the wave (spec-author, test-writer, impl) | Yes — one spec per role |
| Mixing models (cheap lead, opus implementer) | Yes |
| Restricting tool surface (worker that should only Read+Edit, not Bash) | Yes |
| One-off task | Probably not — specs are for repeated patterns |

## Schema

See `schemas/worker-spec.v1.schema.json`. Minimal example:

```yaml
version: 1
name: spec-author
model: claude-sonnet-4-6
tools: [Read, Write, Grep, Glob]
effort: medium
timeout_seconds: 300
```

Tool list of `[]` means no tools (read-only reasoning). Omitting `tools` means inherit lead's tool set. `model: inherit` uses the lead's model.

## Storage convention

Reusable specs live at `skills/<skill>/worker-specs/<role>.yaml` (e.g. `skills/crank/worker-specs/spec-author.yaml`). One-off specs can be inlined in plan documents under a `worker_specs` section.

## How `/crank` consumes specs

```
plan/<epic>/issues.json:
  - id: epic-1
    worker_spec: skills/crank/worker-specs/spec-author.yaml
    metadata:
      validation: { ... }
      files: [...]
```

When crank dispatches `epic-1`, it:
1. Loads `worker_spec`, validates against `schemas/worker-spec.v1.schema.json`
2. Resolves `model: inherit` to the lead's model
3. Builds the spawn payload using ONLY tools from `tools` (cross-checked against tool registry)
4. Prepends the prompt file (if any) to the per-task instructions
5. Spawns with `effort` mapped to the runtime's effort tier

## Anti-patterns

**Don't ladder model overrides in plan files.** If the same role is used by multiple issues, write one spec file and reference it from each. Inline specs are fine for one-offs but become a maintenance hazard at scale.

**Don't use specs to gate access to dangerous tools.** Specs reduce surface for the worker's convenience and cost; security comes from the runtime's permission model, not the spec.

**Don't mix `model: inherit` with `effort: high` if the lead is on Haiku.** The runtime will warn and fail the spawn. Pick a concrete model when overriding effort.

## Validation

`scripts/validate-worker-specs.sh` (to be added with the implementation) walks all `**/worker-specs/*.{yaml,json}` and validates against the schema. CI gate to be added at implementation time.

## See also

- Schema: [schemas/worker-spec.v1.schema.json](../../../schemas/worker-spec.v1.schema.json)
- Spec issue: soc-yjzp.8
- Pre-mortem fix 6: enum strictness on the `model` field (applied — see schema)
