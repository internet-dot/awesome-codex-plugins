---
title: Anti-Patterns
impact: HIGH
tags: anti-patterns, catch-all, nesting, barrels, circular
---

**Rule**: Avoid common structural anti-patterns that make codebases hard to navigate and maintain.

### Catch-All Files

Avoid generic `utils.ts`, `helpers.ts`, `common.ts`. Split by domain instead.

```
# Bad
src/utils.ts          # 500 lines of unrelated helpers

# Good
src/lib/date.ts       # Date formatting utilities
src/lib/currency.ts   # Currency formatting utilities
```

### Deep Nesting

Keep directory depth under 4 levels. Use descriptive names instead of deeper nesting.

```
# Bad
src/features/auth/components/forms/fields/inputs/text-input.tsx

# Good
src/features/auth/components/auth-text-field.tsx
```

### Barrel Files

Avoid `index.ts` re-export files. They hurt tree-shaking, slow down TypeScript and bundlers, and create circular dependency risks. Import directly from source files instead.

```
# Bad — barrel file
src/components/index.ts       # re-exports from 15 files
import { Button } from './components'

# Good — direct imports
import { Button } from './components/button'
```

Only acceptable use: package entry points (`packages/ui/index.ts`) where a public API boundary is intentional.

### Circular Dependencies

Watch for modules that import each other directly or through a chain. Common signs:
- Runtime errors about undefined imports
- Barrel files that re-export from modules that import back from the barrel
- Feature A importing from Feature B and vice versa

Fix by extracting shared code into a separate module that both features import from.

### Separated Tests

Don't put all tests in a separate `__tests__/` directory. Colocate unit tests next to the code they test.

### Language Grouping in Monorepos

Group packages by domain, not by language.

```
# Bad
packages/typescript/
packages/go/

# Good
packages/auth/
packages/payments/
```
