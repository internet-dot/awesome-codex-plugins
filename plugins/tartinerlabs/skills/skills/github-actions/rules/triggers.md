# Triggers

**Severity: LOW**

Use sensible, scoped triggers to avoid unnecessary workflow runs.

## Rule

Always scope `push` and `pull_request` triggers to specific branches. Avoid triggering on every branch.

## Incorrect

```yaml
# Triggers on every branch push — wasteful
on: push

# Also wasteful
on:
  push:
  pull_request:
```

## Correct

```yaml
# Scoped to main branch
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## Path Filtering

For monorepos or projects with distinct areas, use path filters to only run relevant workflows:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
```

## Common Trigger Patterns

| Pattern | Use case |
|---------|----------|
| `push` + `pull_request` to main | Standard CI |
| `release: types: [published]` | Publish on release |
| `workflow_dispatch` | Manual trigger |
| `schedule: cron` | Periodic jobs (e.g., dependency updates) |

## Why This Matters

Overly broad triggers waste compute minutes and create noise in the Actions tab. Scoping triggers ensures workflows only run when relevant code changes.
