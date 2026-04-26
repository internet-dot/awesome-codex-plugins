# Node Version

**Severity: MEDIUM**

Always use LTS aliases instead of hardcoded version numbers.

## Rule

Use `lts/*` for the current LTS release. This stays current automatically without manual updates.

## Incorrect

```yaml
# Hardcoded version — goes stale, requires manual bumps
- uses: actions/setup-node@v4
  with:
    node-version: '20'

# Version file — extra file to maintain
- uses: actions/setup-node@v4
  with:
    node-version-file: '.node-version'
```

## Correct

```yaml
# LTS alias — always resolves to the latest LTS
- uses: actions/setup-node@v4
  with:
    node-version: 'lts/*'
```

## Available Aliases

| Alias | Resolves to |
|-------|-------------|
| `lts/*` | Current LTS (recommended default) |
| `lts/-1` | Previous LTS (for compatibility testing) |
| `latest` | Latest release including non-LTS (avoid in CI) |

## Why This Matters

Hardcoded versions go stale and require manual updates when new LTS releases come out. LTS aliases ensure workflows always use a supported, stable version without maintenance overhead.
