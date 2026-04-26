# Concurrency

**Severity: MEDIUM**

Use concurrency groups to cancel redundant in-progress runs.

## Rule

Add a `concurrency` block to every workflow that cancels in-progress runs when a new commit is pushed to the same branch.

## Incorrect

```yaml
# No concurrency — multiple runs stack up on rapid pushes
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
```

## Correct

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
```

## When NOT to Cancel

For deployment workflows to production, you may want to queue instead of cancel:

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false  # queue instead of cancel
```

## Why This Matters

Without concurrency groups, pushing multiple commits in quick succession creates parallel workflow runs that waste compute minutes and may cause race conditions in deployments.
