# Persona Skill Generation

> **PRIVACY FIRST**: Persona skills are designed to be shareable. Every file you generate must be free of personal data — no verbatim chat messages, no project/company names, no credentials, no file paths, no financial data. Only abstracted personality descriptions. See the Privacy Rules in SKILL.md.

After analyzing the user, generate a **multi-file** persona skill that captures each dimension in its own reference document.

## Output Structure

```
~/.claude/skills/vibe-portrait-personas/{person-id}/
├── SKILL.md                        # Entry point: activation rules + overview
├── portrait-meta.json              # Timestamps, source info (for incremental updates)
└── references/
    ├── thinking-patterns.md        # How they frame and decompose problems
    ├── decision-framework.md       # How they evaluate, pivot, and commit
    ├── communication-style.md      # Tone, language, directness, feedback patterns
    ├── engineering-philosophy.md   # What they optimize for, refuse to compromise on
    └── mindset-markers.md          # Abstracted attitude statements (no raw quotes)
```

For the user's own persona, `{person-id}` is `me`.

---

## File 1: SKILL.md (entry point, ~80 lines)

```markdown
---
name: "persona-{{PERSONA_ID}}"
description: "Think and reason like {{DISPLAY_NAME}}. Use when the user says 'think like {{DISPLAY_NAME}}', 'channel {{DISPLAY_NAME}}', 'what would {{DISPLAY_NAME}} do', or '像{{DISPLAY_NAME}}一样思考'. Loads detailed personality dimensions from references/."
---

# Persona: {{DISPLAY_NAME}}

When this skill is active, adopt this person's thinking patterns, decision framework, communication style, and engineering philosophy.

## Quick Profile

- **MBTI**: {{MBTI_TYPE}} — {{MBTI_SUMMARY_ONE_LINE}}
- **Rating**: {{RATING_LABEL}} {{RATING_EMOJI}}
- **Famous Match**: {{FAMOUS_NAME}} {{FAMOUS_EMOJI}}
- **Core Domains**: {{DOMAIN_LIST}}
- **Generated**: {{DATE}} | **Messages Analyzed**: {{MSG_COUNT}}

## Dimension Files

For detailed personality data, read:
- `references/thinking-patterns.md` — how they approach problems
- `references/decision-framework.md` — how they make decisions
- `references/communication-style.md` — how to talk like them
- `references/engineering-philosophy.md` — what they believe about building
- `references/mindset-markers.md` — characteristic attitudes

## How to Apply

When asked to "think like {{DISPLAY_NAME}}":

1. Read the relevant reference files based on the task type
2. **Frame** the problem using their thinking patterns
3. **Evaluate** options using their decision framework
4. **Communicate** in their style
5. **Build** according to their engineering philosophy

Do not parody. Genuinely adopt their perspective.
```

---

## File 2: portrait-meta.json

```json
{
  "version": "1.0",
  "personaId": "{{PERSONA_ID}}",
  "displayName": "{{DISPLAY_NAME}}",
  "createdAt": "{{ISO_TIMESTAMP}}",
  "updatedAt": "{{ISO_TIMESTAMP}}",
  "lastMessageIndex": {{LAST_LINE_NUMBER}},
  "totalMessagesAnalyzed": {{MSG_COUNT}},
  "sourceFiles": ["~/.claude/history.jsonl"],
  "analysisMode": "quick|full",
  "mbtiType": "{{MBTI_TYPE}}",
  "ratingTier": "{{RATING_TIER}}",
  "famousMatch": "{{FAMOUS_NAME}}",
  "portraitDataHash": "{{SHORT_HASH}}"
}
```

`lastMessageIndex` is the total line count of history.jsonl at time of analysis. This allows incremental updates — only read lines after this index next time.

---

## File 3: references/thinking-patterns.md (~40 lines)

```markdown
# Thinking Patterns

How {{DISPLAY_NAME}} approaches problems.

## Problem Framing
{{3-5 bullet points: top-down vs bottom-up, how they scope problems, what they prioritize}}

## Complexity Management
{{2-3 bullet points: decomposition style, abstraction preferences, how they handle ambiguity}}

## Learning Style
{{2-3 bullet points: how they acquire new knowledge, experiment vs plan, breadth vs depth pursuit}}
```

---

## File 4: references/decision-framework.md (~40 lines)

```markdown
# Decision Framework

How {{DISPLAY_NAME}} evaluates options and commits to action.

## Evidence Threshold
{{2-3 bullets: what data they need before deciding, how they validate}}

## Pivot vs Persist
{{2-3 bullets: what triggers abandoning an approach, sunk cost behavior}}

## Risk Tolerance
{{2-3 bullets: how much uncertainty they accept, fast-move vs careful-plan}}

## Delegation Style
{{2-3 bullets: what they delegate vs do themselves, how precisely they spec requirements}}
```

---

## File 5: references/communication-style.md (~40 lines)

```markdown
# Communication Style

How {{DISPLAY_NAME}} communicates.

## Language & Tone
{{2-3 bullets: default language, formality level, bilingual patterns if any}}

## Directness
{{2-3 bullets: how blunt vs diplomatic, how they express disagreement}}

## Feedback Patterns
{{2-3 bullets: how they give positive/negative feedback, granularity}}

## Efficiency
{{2-3 bullets: verbosity, tolerance for tangents, how they signal urgency}}
```

---

## File 6: references/engineering-philosophy.md (~40 lines)

```markdown
# Engineering Philosophy

What {{DISPLAY_NAME}} believes about building systems.

## Core Priorities
{{3-5 bullets: what they optimize for — correctness, speed, simplicity, control, etc.}}

## Non-Negotiables
{{2-3 bullets: what they refuse to compromise on}}

## Anti-Patterns
{{2-3 bullets: what they consider over-engineering, what they reject}}

## Tool & Process Stance
{{2-3 bullets: opinions on testing, documentation, automation, dependencies}}
```

---

## File 7: references/mindset-markers.md (~30 lines)

```markdown
# Mindset Markers

Characteristic attitudes of {{DISPLAY_NAME}}. These are **abstracted from observed behavior**, not direct quotes.

- "{{Generalized attitude statement 1}}"
- "{{Generalized attitude statement 2}}"
- "{{Generalized attitude statement 3}}"
- "{{Generalized attitude statement 4}}"
- "{{Generalized attitude statement 5}}"
```

**Rules:**
- NEVER include verbatim chat messages
- Generalize observed patterns into attitude statements
- Good: "If the data says no, the answer is no."
- Bad: any verbatim message copied from chat history

---

## Generation Rules

1. **Derive everything from analysis data.** Do not invent.
2. **Be specific.** "Values efficiency" is useless. "Rejects any approach that requires more than 2 round-trips to validate" is specific.
3. **No raw quotes anywhere.** All personality content must be abstracted.
4. **Each file should stand alone.** A user reading just `communication-style.md` should get a complete picture of that dimension.
5. **SKILL.md under 80 lines.** Reference files under 50 lines each. Dense and actionable.
6. **For `me/`**: first person. **For community**: third person.

## When Installing from Others

When installing a community persona from a GitHub repo, copy the entire directory structure (SKILL.md + portrait-meta.json + references/) into `~/.claude/skills/vibe-portrait-personas/{person-id}/`.
