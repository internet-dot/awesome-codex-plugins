---
name: first-principles-review
description: Use when the user explicitly asks for first principles, first-principles review, Occam's razor, 第一性原理, 奥卡姆剃刀, or when a complex decision has ambiguous goals, competing constraints, repeated fixes, fallback growth, duplicate owners, or architecture/product direction risk.
---

# First Principles Review

## Purpose

Use this as a lightweight decision review before another Aegis workflow makes a
directional choice. It is a compositional skill, not a standalone workflow.

Do not replace `brainstorming`, `systematic-debugging`, `writing-plans`,
`requesting-code-review`, or `verification-before-completion`. Use it to clean
the decision surface those skills will act on.

## Use When

- The user asks for first principles, first-principles thinking, 第一性原理,
  Occam's razor, or 奥卡姆剃刀.
- A design, plan, or fix has multiple plausible paths and unclear selection
  criteria.
- The task has ambiguous goals, competing constraints, or product/architecture
  direction risk.
- Debugging is drifting into repeated fixes, fallback growth, duplicate owners,
  consumer-side patches, or "just add another branch" reasoning.
- A review finds that the implementation may be locally correct but directionally
  wrong.

## Do Not Use

- Simple Q&A, status checks, tiny wording/config edits, or clearly bounded
  single-owner changes.
- Mechanical execution of an approved plan unless a new directional conflict
  appears.
- As a required step for every task, every turn, or every TDD cycle.

## Five-Line Review

Answer only what is needed, usually in five short lines:

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

## Composition

- With `brainstorming`: run before approach selection when the request is broad,
  ambiguous, or likely to inherit a poor product shape.
- With `systematic-debugging`: run after evidence shows repeated fixes, fallback
  growth, duplicate owners, or consumer-side patching.
- With `writing-plans`: run before task decomposition when the plan could encode
  the wrong owner, abstraction, or compatibility boundary.
- With `requesting-code-review`: run when review should check direction and
  owner integrity, not just code quality.
- With `verification-before-completion`: use only to name residual directional
  risk. It does not grant completion authority.

## Boundaries

- Prefer evidence from current project files, baseline docs, tests, logs, and
  user requirements. If evidence is missing, mark the line as unknown rather
  than inventing a principle.
- Keep the result advisory. This skill may recommend escalation, but it does
  not create authoritative `GateDecision`, `PolicySnapshot`, or completion
  authority.
- If the five-line review does not change the decision surface, return to the
  active workflow immediately.
