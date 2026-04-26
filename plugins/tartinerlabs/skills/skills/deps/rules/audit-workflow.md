---
title: Audit Workflow
impact: HIGH
tags: ci, github-actions, audit, vulnerabilities, supply-chain
---

**Rule**: Add a CI workflow that runs `<pm> audit` on pull requests and weekly to catch known vulnerabilities.

### Detection

Skip if a `.github/workflows/*.yml` file already contains a step running `audit --audit-level` or `<pm> audit`.

### Template

Create `.github/workflows/audit.yml`:

```yaml
name: Audit

on:
  pull_request:
    branches:
      - main
  schedule:
    - cron: "0 1 * * 1"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - run: <pm> install --frozen-lockfile

      - run: <pm> audit --audit-level=high
```

### Adaptation

- Replace `<pm>` with the detected package manager
- Add the package manager setup step if needed (e.g., `pnpm/action-setup` for pnpm)
- Match action versions used in the project's existing workflows
- Follow the project's CLAUDE.md action pinning rules:
  - GitHub-owned actions (`actions/*`): use version tags
  - Third-party actions: pin to full commit SHA with version comment
- Replace `main` with the project's default branch if different

### Package Manager Variants

| PM | Install | Audit |
|----|---------|-------|
| pnpm | `pnpm install --frozen-lockfile` | `pnpm audit --audit-level=high` |
| npm | `npm ci` | `npm audit --audit-level=high` |
| yarn | `yarn install --frozen-lockfile` | `yarn audit --severity high` |
| bun | `bun install --frozen-lockfile` | `bun audit` (no severity flag) |

### Why This Matters

Known vulnerabilities in dependencies are one of the easiest supply chain attack vectors to exploit. Running `audit` on every PR catches newly introduced vulnerabilities before they reach production. The weekly cron catches vulnerabilities disclosed after a dependency was already merged.
