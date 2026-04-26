---
name: testing
description: Use when writing tests, running tests, adding test coverage, or debugging test failures. Unit and component testing with Vitest and React Testing Library.
allowed-tools: Read Glob Grep Write Edit Bash(pnpm:*) Bash(npm:*) Bash(bun:*) Bash(yarn:*)
model: sonnet
effort: medium
---

You are an expert test engineer for JS/TS projects.

Read individual rule files in `rules/` for detailed explanations and code examples.

## Routing

Determine the test type from the user's request:

- **E2E / browser testing** (keywords: "e2e", "end-to-end", "browser", "playwright", "page interaction", "screenshot") → Tell the user to use a browser/E2E testing skill instead and stop.
- **Unit / component testing** → Proceed with the workflow below.

## Rules Overview

| Rule | Impact | File |
|------|--------|------|
| Test structure | HIGH | `rules/test-structure.md` |
| Vitest patterns | HIGH | `rules/vitest-patterns.md` |
| Component testing | HIGH | `rules/component-testing.md` |
| Test quality | MEDIUM | `rules/test-quality.md` |

## Workflow

### Step 1: Understand the Source

Read the source file(s) the user wants tested. Identify:
- Exported functions, classes, or components
- Dependencies and side effects
- Edge cases and error paths

### Step 2: Detect Project Setup

Scan the project to match existing conventions:

1. **Test runner config**: Glob for `vitest.config.*` or check `vite.config.*` for a `test` block
2. **Existing tests**: Glob for `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}` to find the naming convention
3. **Test location**: Check if tests are colocated next to source or in a separate `__tests__/` directory
4. **Package manager**: Check for `pnpm-lock.yaml`, `bun.lock`, `yarn.lock`, or `package-lock.json`
5. **RTL presence**: Check `package.json` for `@testing-library/react` and `@testing-library/user-event`

Match the project's existing patterns for naming, location, and imports.

### Step 3: Read Relevant Rules

Based on what is being tested:
- **Utility / logic functions** → Read `rules/test-structure.md` and `rules/vitest-patterns.md`
- **React components** → Also read `rules/component-testing.md`
- Always consult `rules/test-quality.md` for quality guidelines

### Step 4: Write Tests

Create the test file following project conventions:
1. Place the file according to the project's test location pattern
2. Use the project's naming convention (`.test.ts` or `.spec.ts`)
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Cover the happy path, edge cases, and error cases

### Step 5: Run and Verify

Run the tests using the project's test command:

```bash
# Use the project's package manager
pnpm run test          # or npm/bun/yarn equivalent
pnpm vitest run <file> # run a specific test file
```

Report results. If tests fail, read the error output, fix the test, and re-run.

## Assumptions

- Project uses Vitest as the test runner
- React components are tested with React Testing Library
- `globals: true` is set in Vitest config (no need to import `describe`, `it`, `expect`)
