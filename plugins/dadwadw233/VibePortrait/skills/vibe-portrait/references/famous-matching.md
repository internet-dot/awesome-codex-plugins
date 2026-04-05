# Famous Person Matching

Match the user's personality across **three independent dimensions**, each picking a DIFFERENT historical or contemporary figure. Do NOT limit yourself to a predefined list — use your own knowledge of world figures across all eras, cultures, and domains.

## Three Dimensions

### 1. Technical Spirit (技术灵魂)
Who does the user resemble in **how they build and what they build**?
- Focus on: technical methodology, tool mastery, domain breadth/depth, building philosophy
- Can be anyone: engineers, scientists, inventors, architects, craftsmen

### 2. Strategic Mind (思维内核)
Who does the user resemble in **how they think and decide**?
- Focus on: decision-making patterns, risk tolerance, planning style, evidence threshold, complexity management
- Can be anyone: strategists, philosophers, military leaders, scientists, business leaders, thinkers

### 3. Communication Soul (表达人格)
Who does the user resemble in **how they communicate and collaborate**?
- Focus on: directness, feedback style, leadership approach, teaching vs directing, collaboration patterns
- Can be anyone: leaders, writers, educators, open-source figures, historical communicators

## Rules

1. **Three DIFFERENT people.** Never repeat the same person across dimensions.
2. **Three DIFFERENT categories.** If dimension 1 picks a modern tech figure, dimension 2 should pick from a different era or domain (philosopher, scientist, military strategist, etc.)
3. **No default answers.** "John Carmack" is not the answer to every technical profile. "Elon Musk" is not the answer to every ambitious profile. Think harder.
4. **Cross-cultural matching is encouraged.** A Chinese-speaking developer might match 诸葛亮 on strategy, Feynman on methodology, and Linus on communication — that's a valid and interesting combination.
5. **Obscure but accurate > famous but vague.** If the user genuinely matches 墨子 (utilitarian engineer-philosopher) better than any Silicon Valley figure, pick 墨子.
6. **Justify with specifics.** Don't say "you're like X because you're both smart." Say "you share X's tendency to [specific observed behavior] — X was known for [specific historical behavior]."

## Candidate Inspiration (not exhaustive — use your own knowledge)

You may pick from anyone in human history. Some categories to consider:

- **Tech builders**: Torvalds, Carmack, Bellard, Wozniak, Hopper, van Rossum, Karpathy, DHH, Hotz, Hickey, Kay, Shannon...
- **Scientists**: Einstein, Feynman, Turing, von Neumann, Curie, Tesla, Darwin, Galileo, Ramanujan, 华罗庚...
- **Philosophers & strategists**: 诸葛亮, 王阳明, 墨子, 老子, 孙子, Aristotle, Marx, Machiavelli, Clausewitz...
- **Creators & polymaths**: Da Vinci, 鲁班, Steve Jobs, Buckminster Fuller, Dieter Rams...
- **Leaders & communicators**: Lincoln, Churchill, 曹操, Mandela, Feynman (also here), Benjamin Franklin...
- **Writers & thinkers**: Borges, Asimov, Hofstadter, Knuth, Paul Graham, 鲁迅...

**This list is inspiration, not a constraint. Pick whoever fits best.**

## Output Format

```json
{
  "technical": {
    "name": "...",
    "emoji": "...",
    "dimension": "Technical Spirit",
    "dimensionZh": "技术灵魂",
    "reason": "1-2 sentences with specific behavioral parallels.",
    "sharedTraits": ["trait-1", "trait-2", "trait-3"]
  },
  "strategic": {
    "name": "...",
    "emoji": "...",
    "dimension": "Strategic Mind",
    "dimensionZh": "思维内核",
    "reason": "1-2 sentences with specific behavioral parallels.",
    "sharedTraits": ["trait-1", "trait-2", "trait-3"]
  },
  "communication": {
    "name": "...",
    "emoji": "...",
    "dimension": "Communication Soul",
    "dimensionZh": "表达人格",
    "reason": "1-2 sentences with specific behavioral parallels.",
    "sharedTraits": ["trait-1", "trait-2", "trait-3"]
  }
}
```
