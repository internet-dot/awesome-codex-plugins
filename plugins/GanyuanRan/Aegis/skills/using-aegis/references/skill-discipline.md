# Using Aegis: Full Skill Discipline

Use this reference when the compact `using-aegis` hot path is not enough to
decide how to trigger skills, order multiple workflows, or adapt tool names for
a host.

## Instruction Priority

Aegis skills override default system prompt behavior, but **user instructions
always take precedence**:

1. **User's explicit instructions** (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`,
   direct requests) - highest priority
2. **Aegis skills** - override default system behavior where they conflict
3. **Default system prompt** - lowest priority

If a project file says "don't use TDD" and a skill says "always use TDD,"
follow the user's instructions. The user is in control.

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content
is loaded and presented to you. Follow it directly.

**In Copilot CLI:** Use the `skill` tool. Skills are auto-discovered from
installed plugins. The `skill` tool works the same as Claude Code's `Skill`
tool.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads
skill metadata at session start and activates the full content on demand.

**In other environments:** Check the platform's documentation for how skills
are loaded.

## Platform Adaptation

Skills use Claude Code tool names. Non-CC platforms: see:

- `references/copilot-tools.md`
- `references/codex-tools.md`
- `references/gemini-tools.md`

## The Rule

Invoke relevant or requested skills before any response or action. Even a 1%
chance a skill might apply means you should invoke the skill to check. If an
invoked skill turns out to be wrong for the situation, you do not need to use
it.

## Skill Flow

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## Red Flags

These thoughts mean STOP - you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes before clarifying questions. |
| "Let me explore the codebase first" | Skills tell you how to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you how to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action means task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check before doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept is not using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** - brainstorming, debugging, planning, review
2. **Implementation skills second** - frontend, MCP, domain-specific build work

Examples:

- "Let's build X" -> brainstorming first, then implementation skills
- "Fix this bug" -> debugging first, then domain-specific skills

## Complexity Routing

Before implementation, classify the task:

- **Low complexity:** one local owner, clear behavior, small bug/doc/config
  change. TDD may be the first implementation skill after concise intent,
  authority/baseline check, and verification target.
- **Medium complexity:** multi-file or multi-module work, user-visible
  behavior, routing/state flow, API/contract touch, compatibility boundary, or
  multiple acceptance checks. Create a baseline read-set, plan, and atomic tasks
  before TDD.
- **High complexity:** architecture, data model, permissions, migrations,
  cross-system contracts, long-running work, or ambiguous product behavior. Use
  brainstorming/specification and writing-plans before TDD; get user review
  where the workflow requires it.

TDD is the implementation discipline for approved atomic tasks, not the first
entrypoint for medium- or high-complexity work.

## Project Workspace

Hard binary rule:
- Global install (plugin registration, version query, skill listing):
  NEVER write project files.
- Active project (user has a codebase loaded): workspace creation triggered by
  brainstorming checklist item 8, writing-plans save step, or
  systematic-debugging Quality Gate (non-trivial tasks).
  When triggered and `docs/aegis/` missing → create immediately, do not ask.
  Prefer `python scripts/aegis-workspace.py init --root <target-project-root>`
  when the helper is available in the active method-pack checkout.
  For medium+ process trails, prefer `python scripts/aegis-workspace.py
  new-work --root <target-project-root> ...`; update slices with
  `add-checkpoint`, `add-evidence`, and `add-drift-check`; assemble
  review/handoff records with `bundle`; run `check` before pause, handoff, or
  completion candidate. These helper outputs are method-pack records only, not
  authoritative gates.
  If `docs/aegis/` already exists → use it, do not recreate.

Directory structure:
```
docs/aegis/
├── README.md + INDEX.md
├── BASELINE-GOVERNANCE.md    # constitution
├── adr/                      # architecture decisions
├── baseline/                 # architecture snapshots
├── specs/                    # design docs (brainstorming output)
├── plans/                    # implementation plans (writing-plans output)
└── work/<slug>/              # process trail (medium+ tasks only)
    ├── 10-intent.md
    ├── 20-checkpoint.md
    ├── 90-evidence.md
    └── 99-reflection.md
```

Mid-task complexity escalation: pause, init workspace if missing, backfill
required artifacts, then continue.

## Skill Types

**Rigid** skills such as TDD and debugging must be followed exactly.

**Flexible** skills provide patterns that adapt to the current context.

The skill itself tells you which mode applies.

## User Instructions

Instructions say what, not how. "Add X" or "Fix Y" does not mean skip
workflows.
