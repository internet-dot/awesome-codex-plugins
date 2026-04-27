# Backend: Codex Session Agents

Concrete tool calls for spawning and steering agents inside the Codex session runtime.

---

## Spawn

Use `spawn_agent` for each agent you want to create. Give each agent one focused responsibility and a file/output target.

```text
spawn_agent(message="You are judge-1.

Perspective: Correctness & Completeness

<PACKET>...</PACKET>

Write your analysis to .agents/council/judge-1.md and return a concise verdict.")

spawn_agent(message="You are worker-3.

Task: Add password hashing

Write your result to .agents/swarm/results/3.json and stay within your assigned files.")
```

## Wait

Use `wait_agent` with the returned agent ids.

```text
wait_agent(targets=["agent-id-1", "agent-id-2"])
```

If one agent is lagging, keep the rest moving and `close_agent` the stalled one when needed.

## Follow-Up

Use `send_input` for short retry or clarification messages only.

```text
send_input(target="agent-id-1", message="Validation failed. Fix the test failure and retry.")
```

## Cleanup

Use `close_agent` to stop a stuck or no-longer-needed agent.

```text
close_agent(target="agent-id-1")
```

## Key Rules

1. Spawn one focused agent per unit of work.
2. Keep the durable result in files, not in conversational memory.
3. Use follow-up messages only for brief steering, not for work transfer.
4. Prefer `wait_agent` over repeated polling.
