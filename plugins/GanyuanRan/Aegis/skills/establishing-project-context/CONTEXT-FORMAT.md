# CONTEXT.md Format

## Template

```markdown
# Project Context: <project-name>

## Language

| Term | Definition | Avoid |
|------|-----------|-------|
| <Term> | <One-sentence definition a domain expert would agree with> | <synonyms, deprecated names, or overloaded terms> |

## Relationships

- An **X** holds many **Y**
- A **Y** carries one **Z**

## Flagged Ambiguities

- "<old term>" → collapsed into **<canonical term>** (<date>)
```

## Rules

1. **Terms only**: No implementation details (class names, file paths, config keys)
2. **Domain expert test**: Would a non-technical domain expert understand and agree with the definition?
3. **Immediate writes**: When a term is resolved during conversation, write it to CONTEXT.md immediately — don't batch
4. **One sentence**: Each definition is one sentence. If you need more, the term may need decomposition
5. **Avoid column is mandatory**: Knowing what NOT to say is as important as knowing what TO say
