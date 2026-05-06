---

<!-- TOC: THE EXACT PROMPT | Patterns | Examples | References -->

# De-Slopify — Remove AI Writing Artifacts

> **Core Insight:** You can't do this with regex or a script. It requires manual, systematic review of each line.

## THE EXACT PROMPT — Full De-Slopify

```
I want you to read through the complete text carefully and look for any telltale
signs of "AI slop" style writing; one big tell is the use of emdash. You should
try to replace this with a semicolon, a comma, or just recast the sentence
accordingly so it sounds good while avoiding emdash.

Also, you want to avoid certain telltale writing tropes, like sentences of the
form "It's not [just] XYZ, it's ABC" or "Here's why" or "Here's why it matters:".
Basically, anything that sounds like the kind of thing an LLM would write
disproportionately more commonly than a human writer and which sounds
inauthentic/cringe.

And you can't do this sort of thing using regex or a script, you MUST manually
read each line of the text and revise it manually in a systematic, methodical,
diligent way. Use ultrathink.
```

---

## THE EXACT PROMPT — Quick Version

```
Review this text and remove any AI slop patterns: excessive emdashes, "Here's why"
constructions, "It's not X, it's Y" formulas, and other LLM writing tells. Recast
sentences to sound more naturally human. Use ultrathink.
```

---

## Patterns to Eliminate

| Pattern | Problem |
|---------|---------|
| **Emdash overuse** | LLMs love emdashes—they use them constantly—even when other punctuation works better |
| **"It's not X, it's Y"** | Formulaic contrast structure |
| **"Here's why"** | Clickbait-style lead-in |
| **"Let's dive in"** | Forced enthusiasm |
| **"At its core..."** | Pseudo-profound opener |
| **"It's worth noting..."** | Unnecessary hedge |

---

## Emdash Alternatives

| Original | Alternative |
|----------|-------------|
| `X—Y—Z` | `X; Y; Z` or `X, Y, Z` |
| `The tool—which is powerful—works` | `The tool, which is powerful, works` |
| `We built this—and it works` | `We built this, and it works` |

Sometimes the best fix is to split into two sentences.

---

## Before/After Examples

### Emdash Overuse

**Before:**
```
This tool—which we built from scratch—handles everything automatically—from parsing to output.
```

**After:**
```
This tool handles everything automatically, from parsing to output. We built it from scratch.
```

### "Here's why" Pattern

**Before:**
```
We chose Rust for this component. Here's why: performance matters.
```

**After:**
```
We chose Rust for this component because performance matters.
```

### Contrast Formula

**Before:**
```
It's not just a linter—it's a complete code quality system.
```

**After:**
```
This complete code quality system goes beyond basic linting.
```

### Forced Enthusiasm

**Before:**
```
# Getting Started

Let's dive in! We're excited to help you get up and running.
```

**After:**
```
# Getting Started

Install the tool and run your first command in under a minute.
```

---

## Why Manual Review is Required

1. **Context matters** — Sometimes an emdash is actually the right choice
2. **Recasting sentences** — Often the fix isn't substitution but rewriting
3. **Tone consistency** — Need to maintain voice throughout
4. **Judgment calls** — Some patterns are fine in moderation

---

## When to De-Slopify

- Before publishing a README
- Before releasing documentation
- After AI-assisted writing sessions
- During documentation reviews

---

## What NOT to Fix

- **Technical accuracy** — Don't sacrifice correctness for style
- **Necessary structure** — Headers, lists are fine
- **Clear explanations** — Being thorough isn't slop
- **Code examples** — Focus on prose, not code

---

## References

| Topic | Reference |
|-------|-----------|
