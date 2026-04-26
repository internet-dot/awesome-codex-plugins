---
title: Dependency Review
impact: HIGH
tags: ci, github-actions, dependency-review, supply-chain
---

**Rule**: Add a CI workflow that blocks PRs introducing dependencies with known vulnerabilities.

### Detection

Skip if a `.github/workflows/*.yml` file already contains `dependency-review-action`.

### Template

Create `.github/workflows/dependency-review.yml`:

```yaml
name: Dependency Review

on:
  pull_request:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/dependency-review-action@v4
```

### Adaptation

- Match action versions used in the project's existing workflows
- Follow the project's action pinning rules
- Replace `main` with the project's default branch if different
- No package manager setup needed — the action uses GitHub's dependency graph API

### How It Works

`actions/dependency-review-action` compares the dependency manifest between the PR's base and head commits. It fails the check if the PR introduces dependencies with known vulnerabilities (CVEs). The `pull-requests: write` permission allows it to post an inline comment summarising the findings.

### Why This Matters

Unlike `<pm> audit` which checks existing dependencies, dependency review specifically targets what a PR *changes*. It catches vulnerable new dependencies before they enter the lockfile, acting as a gate rather than a retrospective scan.
