# MBTI Mapping for Developers

Map observed conversation signals to four personality axes. Each axis yields a score from 0 to 100. The letter is determined by which side of 50 the score falls on.

## Axis 1: E/I — Extraversion vs Introversion

**In the developer context, this measures: delegation breadth vs self-reliance.**

| Signal | Extraversion (E) | Introversion (I) |
|--------|-------------------|-------------------|
| Delegation style | Delegates broadly, describes context for AI to work autonomously | Gives minimal instructions, does most work themselves |
| Message length | Longer, more detailed messages with context | Short, terse commands |
| Collaboration | Discusses ideas before implementing | Implements first, discusses after |
| Multi-agent use | Uses multiple AI tools/agents for different perspectives | Sticks to one tool they trust |
| Feedback style | Verbose feedback with reasoning | Brief corrections ("no, not that") |

**Scoring:**
- Count messages > 200 chars as E-signal, < 50 chars as I-signal
- Evidence of multi-tool usage (mentions of Codex, Claude, GPT, etc.) = E-signal
- Evidence of working alone then asking for review = I-signal
- Calculate: `E_score = (E_signals / total_signals) * 100`

## Axis 2: S/N — Sensing vs Intuition

**In the developer context, this measures: implementation focus vs architecture focus.**

| Signal | Sensing (S) | Intuition (N) |
|--------|-------------|---------------|
| Request type | "How do I do X?" / "Fix this error" | "Design a system for X" / "What's the right architecture?" |
| Tech references | Specific tools, versions, error codes | Patterns, principles, abstractions |
| Problem framing | Bottom-up: starts from the code | Top-down: starts from the goal |
| Documentation | Asks for step-by-step guides | Asks for design rationale |
| Error handling | Pastes the error, asks for fix | Hypothesizes root cause before asking |

**Scoring:**
- Count implementation-level requests as S-signal
- Count design/architecture-level requests as N-signal
- References to specific error messages/stack traces = S-signal
- References to design principles/patterns = N-signal
- Calculate: `N_score = (N_signals / total_signals) * 100` (high = N, low = S)

## Axis 3: T/F — Thinking vs Feeling

**In the developer context, this measures: logic-driven vs people-aware decision making.**

| Signal | Thinking (T) | Feeling (F) |
|--------|--------------|-------------|
| Feedback | Direct criticism without softening | Acknowledges effort before correcting |
| Decisions | Based on metrics, benchmarks, data | Based on user experience, team impact |
| Language | "This is wrong because..." | "I feel like this could be better..." |
| Priorities | Correctness, performance, efficiency | Usability, readability, team adoption |
| Conflict resolution | "The data says X" | "Let's find a compromise" |

**Scoring:**
- Count direct/blunt corrections as T-signal
- Count empathetic/softened language as F-signal
- Data/metric references in decisions = T-signal
- User-experience/team references in decisions = F-signal
- Calculate: `T_score = (T_signals / total_signals) * 100` (high = T, low = F)

## Axis 4: J/P — Judging vs Perceiving

**In the developer context, this measures: structured planning vs exploratory iteration.**

| Signal | Judging (J) | Perceiving (P) |
|--------|-------------|-----------------|
| Work style | Plans before coding, phase-based progression | Exploratory, tries things to see what works |
| Task management | Explicit todos, milestones, priorities | Ad-hoc, responds to what's in front of them |
| Scope | Sticks to the plan, resists scope creep | Easily adds "while we're at it" items |
| Completion | Finishes before moving on | Juggles multiple incomplete tasks |
| Decision timing | Decides quickly, moves forward | Keeps options open, revisits decisions |

**Scoring:**
- Evidence of phase-based work ("Phase 1", "Step 1", explicit plans) = J-signal
- Evidence of exploratory pivots ("let's try this instead", "actually, new idea") = P-signal
- References to deadlines or milestones = J-signal
- Frequent topic switching within sessions = P-signal
- Calculate: `J_score = (J_signals / total_signals) * 100` (high = J, low = P)

## Output Format

Produce:
```json
{
  "type": "XXXX",
  "axes": {
    "EI": { "score": 65, "letter": "E", "label": "Delegator" },
    "SN": { "score": 78, "letter": "N", "label": "Architect" },
    "TF": { "score": 85, "letter": "T", "label": "Logic-Driven" },
    "JP": { "score": 72, "letter": "J", "label": "Planner" }
  },
  "description": "One paragraph describing this personality type in the developer context."
}
```

## Type Descriptions (brief)

Write a 2-3 sentence description tailored to the developer context. Focus on how this type approaches coding, collaboration with AI, and problem-solving. Avoid generic MBTI descriptions — make it about their engineering personality.
