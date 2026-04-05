# Developer Rating Rubric

Rate the developer based on **observable material evidence** from their conversation history. This rubric follows a materialist methodology: judge by actual output, demonstrated behavior, and verifiable signals — not by self-description, intent, or potential.

## Core Principle

**The rating reflects what the user has demonstrably done through their AI interactions, not what they claim to be.** A user who talks about architecture but only asks "how to install X" is rated on the latter. A user who never discusses grand vision but consistently solves complex multi-step problems is rated on the latter.

No flattery. No benefit of the doubt. The evidence speaks.

## Rating Scale

| Tier | Label (zh) | Label (en) | Badge Color | Emoji |
|------|------------|------------|-------------|-------|
| S+ | 夯爆了 | Legendary | Gold (#F59E0B) | 👑 |
| S | 夯 | Elite | Purple (#7C3AED) | 💎 |
| A | 人上人 | Above Average | Blue (#3B82F6) | ⭐ |
| B | NPC | NPC | Gray (#6B7280) | 🤖 |
| C | 拉 | Below Average | Orange (#F97316) | 😅 |
| D | 拉完了 | Inactive | Red (#EF4444) | 💀 |

## Tier Criteria

### S+ 夯爆了 — Legendary Builder

**Hard evidence required (ALL of):**
- Messages demonstrate working across 3+ technically distinct domains (not just mentioning them — actually building, debugging, or designing in those domains)
- Architecture-level problem framing: requests involve system design, trade-off analysis, or multi-component coordination — not just "how do I"
- Evidence of building novel/original systems: custom frameworks, new tools, research implementations — not just configuring existing products
- Demonstrates clear technical vision: can articulate what they want to build and WHY, sets explicit quality thresholds, rejects substandard output
- Uses AI as a force multiplier: provides context, constraints, and acceptance criteria — doesn't wait for AI to think for them

**Counter-signals that disqualify even if above seems met:**
- Most messages are copy-paste of errors without analysis → not S+
- Discusses vision but never follows through to implementation → not S+
- Works in many domains but at surface level (install/configure only) → not S+

### S 夯 — Elite Engineer

**Hard evidence required (4+ of):**
- Strong demonstrated depth in 2+ distinct domains (debugging complex issues, writing non-trivial code, understanding internals)
- Regularly frames problems that require multi-step solutions
- Shows tool chain proficiency across build, test, deploy, and debug workflows
- Provides sophisticated debugging context: hypotheses, stack traces, reproduction steps
- Evidence of completed, working systems (not just started projects)

### A 人上人 — Above Average

**Hard evidence required (3+ of):**
- Solid competence in 1-2 domains (asks informed questions, understands error messages, knows what to try)
- Handles moderate complexity (multi-file changes, integration work, basic system design)
- Observable growth trajectory: questions evolve from basic to advanced over time
- Can articulate requirements clearly and evaluate whether AI output meets them
- Some evidence of independent problem-solving before turning to AI

### B NPC — Standard Developer

**Characteristics (these are observations, not insults):**
- Follows established patterns without modification
- Requests are predominantly implementation-level: "how do I do X in framework Y"
- Standard tool usage — uses defaults, doesn't customize
- Single domain focus
- Accepts AI output without critical evaluation most of the time
- This is where most developers land. It is not a failure — it is the statistical norm.

### C 拉 — Below Average

**Hard evidence required (2+ of):**
- Consistently struggles with tasks that should be routine for their declared domain
- Cannot formulate specific technical questions (messages are vague: "it doesn't work", "something's wrong")
- Heavily dependent on AI for work they should be able to do: basic syntax, standard library usage, reading documentation
- Repeats the same type of error without learning from prior corrections
- Limited technical vocabulary relative to the tasks attempted

### D 拉完了 — Not Engaging

**Hard evidence required:**
- Fewer than 10 meaningful technical messages (after filtering slashcommands and one-word responses)
- No evidence of running, testing, or verifying any output
- Pure copy-paste workflow with no follow-up or comprehension
- No growth or learning visible across the conversation history

**Important:** Do NOT assign this tier if total messages < 50. With limited data, default to "insufficient data" rather than a damning rating.

## Anti-Flattery Rules

1. **Do not inflate ratings to make the user feel good.** A kind lie is worse than a direct truth.
2. **Do not assume competence from ambition.** "I want to build X" is not evidence of ability to build X.
3. **Do not confuse tool usage with tool mastery.** Using Docker doesn't mean understanding containerization.
4. **Do not mistake volume for quality.** 1000 messages asking basic questions is still basic.
5. **Rate the median, not the peak.** One brilliant message in 500 average ones = average rating.
6. **The existence of complex projects doesn't prove the user built them.** Look at HOW they interact with the code, not WHAT code they reference.

## Rating Adjustment Signals

**Upgrade signals (each can bump up one tier at most):**
- Catches AI mistakes and corrects them with specific technical reasoning
- Demonstrates understanding of WHY something works, not just THAT it works
- Proposes approaches the AI didn't suggest
- Builds meta-tools (tools that build tools, frameworks that generate frameworks)

**Downgrade signals (each can drop one tier at most):**
- Repeatedly asks the same question in different sessions
- Accepts obviously wrong AI output without noticing
- Never verifies, tests, or runs the code AI produces
- Blames AI for errors that stem from unclear requirements they provided

## Scoring Algorithm

1. Collect all evidence signals from sampled messages
2. For each tier (starting from S+), check whether ALL required criteria are met with concrete evidence
3. The highest tier where evidence is sufficient = the rating
4. Apply upgrade/downgrade adjustments (max ±1 tier)
5. If genuinely between two tiers, choose the **lower one** (conservative, not flattering)

## Output Format

```json
{
  "tier": "S+",
  "label": "夯爆了",
  "emoji": "👑",
  "color": "#F59E0B",
  "reason": "2-3 sentence materialist justification citing specific evidence. Name exact domains, exact types of problems solved, exact patterns observed.",
  "strengthHighlights": ["concrete-strength-1", "concrete-strength-2"],
  "growthAreas": ["concrete-area-1", "concrete-area-2"]
}
```

## Final Note

Every tier includes growth areas. Even S+ developers have blindspots. And every tier includes strengths — even C-tier developers are here because they're trying. The goal is accurate self-knowledge that enables directed improvement, not ego validation or destruction.
