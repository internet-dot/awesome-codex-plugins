# Caching

**Severity: MEDIUM**

Cache package manager dependencies to speed up workflow runs.

## Rule

Always enable caching when using setup actions for Node.js, Python, Go, or other ecosystems.

## Incorrect

```yaml
# No caching — downloads all dependencies every run
- uses: actions/setup-node@v4
  with:
    node-version: 'lts/*'
- run: pnpm install --frozen-lockfile
```

## Correct

```yaml
# Caching enabled — reuses dependencies across runs
- uses: actions/setup-node@v4
  with:
    node-version: 'lts/*'
    cache: 'pnpm'
- run: pnpm install --frozen-lockfile
```

## Cache Parameters by Ecosystem

| Setup Action | Cache Parameter |
|-------------|----------------|
| `actions/setup-node@v4` | `cache: 'pnpm'` / `'npm'` / `'yarn'` |
| `actions/setup-python@v5` | `cache: 'pip'` / `'pipenv'` / `'poetry'` |
| `actions/setup-go@v5` | `cache: true` |
| `actions/setup-java@v4` | `cache: 'maven'` / `'gradle'` |

## Why This Matters

Without caching, every workflow run downloads and installs all dependencies from scratch. Caching can reduce install times from minutes to seconds, saving compute minutes and providing faster feedback.
