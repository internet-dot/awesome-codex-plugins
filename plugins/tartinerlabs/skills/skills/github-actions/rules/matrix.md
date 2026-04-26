# Matrix Strategy

**Severity: LOW**

Use matrix strategies to run parallel tasks like lint, test, and build with fast failure.

## Rule

When a CI workflow has multiple independent commands (lint, test, build), use a matrix strategy to run them in parallel instead of sequentially in a single job.

## Incorrect

```yaml
# Sequential — slow, waits for each step to finish before starting the next
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build
```

## Correct

```yaml
# Parallel — all tasks run simultaneously, fails fast on first failure
jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        command: [check, test, build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm ${{ matrix.command }}
```

## Fail Fast

`fail-fast: true` cancels all remaining matrix jobs as soon as one fails. This saves compute minutes and gives faster feedback — if lint fails, there's no point waiting for build to finish.

## When to Use

- CI pipelines with multiple independent commands (lint, test, build, typecheck)
- Tasks that don't depend on each other's output

## When NOT to Use

- Commands that must run in order (e.g., build before deploy)
- Single-command workflows where a matrix adds unnecessary complexity

## Why This Matters

Running tasks in parallel reduces total CI time from the sum of all tasks to the duration of the slowest task. Combined with `fail-fast`, broken builds surface faster.
