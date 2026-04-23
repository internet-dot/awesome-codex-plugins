# Strict Delegation Contract (shared)

> Applies to all top-level orchestrator skills: `/rpi`, `/discovery`, `/validation`.
> Strict sub-skill delegation is the **default**, not opt-in.

## The Contract

Top-level orchestrator skills delegate to their declared sub-skills via `Skill(skill="<name>", ...)` — **as separate tool invocations**, one per phase/step. Each sub-skill owns its artifact, its gate, and its retry policy. Inlining the work breaks that ownership chain.

There is no `--full` flag because strict delegation is always on.

## Anti-Pattern: Compression

Do not inline phase work, compress multiple phases into one pass, substitute `Agent()` calls for `Skill()` calls, or skip mandatory phases. Typical rationalizations to reject:

- *"I'll compress the three phases into one pass."*
- *"Let me do discovery inline — I already know what to do."*
- *"Nested `Skill()` calls waste context; I'll spawn an `Agent()` instead."*
- *"The implementation is validated by tests passing; skipping `/validation`."*
- *"The plan looks good, skipping pre-mortem to save time."*
- *"I'll just spawn 3 judges directly — it's what `/vibe` does anyway."*
- *"Post-mortem is just writing a summary, I'll do it inline."*

All of these are contract violations. A live compression was observed 2026-04-19 (see [`.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md`](../../../.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md)). The compression "worked" mechanically (strict build passed, 2-judge inline vibe PASSed) but the knowledge flywheel never turned — no forged learnings, no post-mortem artifact, no structured council verdict. Contract strength depends on actual `Skill()` invocations, not self-certification.

## `Agent()` vs `Skill()`

These are **not interchangeable**:

| Call | When to use |
|------|-------------|
| `Skill(skill="<name>", ...)` | Invoking a declared skill with its full contract. Required for phase delegation. |
| `Agent(subagent_type="...", ...)` | Spawning a sub-agent for parallel independent work **within a skill's step** (e.g., `/research` dispatching parallel Explore agents is fine). |

If you're tempted to call `Agent()` in place of a `Skill()` invocation, you're compressing. Stop.

## Supported Compression Escapes

These flags scale *gate depth* or *scope*, **never skip phases**. They are the only supported shortcuts:

### `/rpi`
- `--quick` / `--fast-path` — force fast complexity (inline `--quick` gates inside sub-skills; still runs all three phases)
- `--from=<phase>` — resume from a specific phase when earlier artifacts already exist
- `--skip-pre-mortem` / `--no-retro` / `--no-forge` — skip specific sub-skills inside a phase
- `--no-budget` — disable phase time budgets

### `/discovery`
- `--quick` — passed through to `/pre-mortem` for fast inline gate
- `--skip-brainstorm` — skip STEP 1 when the goal is specific (>50 chars, no vague keywords)
- `--interactive` / `--auto` — control human-gate behavior in research and plan
- `--no-scaffold` — skip STEP 4.5 scaffold auto-invocation (canonical name; `--no-lifecycle` is a deprecated alias through v2.40.0)

### `/validation`
- `--quick` — fast inline gates inside sub-skills (vibe, post-mortem)
- `--no-retro` / `--no-forge` — skip specific sub-skills
- `--no-lifecycle` — skip STEP 1.7 lifecycle checks (test, deps, review, perf)
- `--no-behavioral` — skip STEP 1.8 holdout scenarios
- `--allow-critical-deps` — allow shipping despite CVSS ≥ 9.0 findings

**If tempted to shortcut outside this list: stop and delegate.**

## Positive Pattern: What Correct Delegation Looks Like

A correct `/rpi` invocation shows three distinct `Skill()` tool calls at phase boundaries:

```
Skill(skill="discovery", args="<goal> --auto")      # Phase 1
  → <promise>DONE</promise>
  → reads .agents/rpi/execution-packet.json
Skill(skill="crank", args="<packet-path> [--test-first]")   # Phase 2
  → <promise>DONE</promise>
  → reads .agents/rpi/phase-2-summary-*.md
Skill(skill="validation", args="--complexity=<level> [--strict-surfaces]")   # Phase 3
  → <promise>DONE</promise>
  → writes .agents/rpi/phase-3-summary-*.md
```

Anything less is compressed.

## Detection for Reviewers

When auditing a session that claims to have run `/rpi`, check the transcript for:

1. **Three `Skill()` invocations** at phase boundaries (Skill, not Agent).
2. **Three `<promise>DONE</promise>` markers**, each from the delegated sub-skill.
3. **Three phase summary files** in `.agents/rpi/phase-{1,2,3}-summary-*.md`.

Missing any of the three = compression.

## Enforcement Layers (defense in depth)

1. **This contract document** — read before / during orchestrator invocation.
2. **Loud text in each orchestrator's SKILL.md** — anti-pattern section with explicit examples.
3. **Forged learning** at `.agents/learnings/2026-04-19-orchestrator-compression-anti-pattern.md` — surfaced via `ao inject` at session start.
4. **Optional future**: runtime hook that inspects the skill invocation trace and blocks downstream work when phases were skipped. Not implemented; deferred to a follow-up initiative.

Contract strength alone is not enforcement. Layer 1 (this doc) + Layer 2 (SKILL.md sections) + Layer 3 (flywheel injection) together give durable coverage.
