# Web Copy Voice Guide

Most AI-generated UI fails at copy as much as visuals. "Built for modern teams." "10x faster." "Reimagined." All AI-slop tells.

## Sentence patterns by direction

### Editorial Swiss
- Short declarative sentences
- Italic emphasis: "Most watches are made by *machines*. We are not most watches."
- Plain-spoken, slightly archaic
- Avoid: "we believe", "we craft", "passionate about"

### Tactile brutalism
- Direct, blunt, declarative
- All caps acceptable
- Numbered: "01. We don't do briefings. 02. We don't do pitches."
- No softeners ("we believe", "perhaps")

### Type-as-hero
- Single-word heroes ("INDEPENDENT", "FORM", "TIME")
- Manifestos in fragments
- Pull quotes treated as headlines
- Letterforms carry meaning, copy supports

### Glow + grain
- Mood-driven, slightly mysterious
- Tech-poetic: "Made for the next decade"
- Avoid: "We're excited to announce"

### Industrial monospace
- Technical, declarative
- Code-aware: `> 01 — initialize`
- Specs in `key=value`
- Avoid: emoji, conversational tone

### Active bento
- Punchy tile titles ("Build faster")
- One-line tile subtitles
- Body content lives in detail view

## Universal AI-slop ban list

Reject these phrases by default:

- "Built for modern teams"
- "Powered by AI"
- "Reimagined" / "Redefining" / "The new way to"
- "10x faster" / "10x productivity"
- "Try free for 14 days" (unless that's literally the product)
- "We're excited to announce"
- "Stop hating your [X]"
- "The [thing] that grows with you"
- "Thoughtfully designed for modern [audience]"
- "Crafted with care"
- "Beautiful, intuitive, fast" (always use these in marketing — banned)
- "Elevate your workflow"
- "Unlock your potential"
- "Seamlessly integrated"
- "Lorem ipsum" of any kind

## Replacement patterns

| Slop | Replacement |
|---|---|
| "Built for modern teams" | "Used by [actual customer types]" or skip entirely |
| "10x faster" | "[specific number] [specific metric]" |
| "Reimagined the [X]" | What you actually changed |
| "Thoughtfully designed" | Show the design, don't claim it |
| "Powered by AI" | Describe what it does |
| "Try free for 14 days" | "Free to start" or actual model |
| "Beautiful, intuitive" | Show, don't tell |

## Editorial conventions

- **Italic for emphasis** within headline, not bold
- **Em dash** for asides — like this — not parens
- **Numbers as numerals** in metadata (use `27 / 27`, not "twenty-seven")
- **Numbers as words** in body prose ("twenty-seven pieces a year, no more")
- **Single quotes** for "scare quotes", double for actual quotes
- **Hanging punctuation** — first character punctuation hangs into margin (`hanging-punctuation: first;`)
- **Mono caps for metadata** — dates, refs, status, version

## Manifesto voice

For brand/about/manifesto pages:

- Open with a single sentence that's a position
- Follow with paragraph elaborating
- Use `§` numbering for sections
- Paragraphs 2-4 sentences max
- One memorable line per paragraph (the line you'd quote)
- Specifics > abstractions: "twenty-seven pieces a year" not "limited production"

Example:
> § 01 — Manifesto
>
> Most watches are made by machines. We are not most watches.
>
> We don't out-source movement parts. We don't issue marketing campaigns.
> We don't release new collections every year. The watches we make
> spend years in development and weeks in finishing — and the people
> who own them tend to keep them for a lifetime.

## Spec / metadata voice

- `key — value` or `key: value` consistently
- All-caps mono for keys: `PRODUCTION`, `ATELIER`, `FOUNDED`
- Numbers always followed by unit: `27 pieces / yr`, `38 mm`, `60 h`
- Compact, never sentence

## Self-audit

Before shipping copy:

1. Did I avoid every slop phrase above?
2. Are headlines under 8 words?
3. Are paragraphs under 4 sentences?
4. Did I use specifics, not abstractions?
5. Did I avoid em-dash overuse (>2 per paragraph)?
6. Italic / mono / weight used intentionally per direction?

If "no" — rewrite that section, don't ship middle-mush copy.
