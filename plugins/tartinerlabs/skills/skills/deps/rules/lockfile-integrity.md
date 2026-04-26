---
title: Lockfile Integrity
impact: MEDIUM
tags: ci, github-actions, lockfile, tampering, supply-chain
---

**Rule**: Add a CI workflow that flags PRs where the lockfile changed without a corresponding `package.json` change, using the [`tartinerlabs/lockfile-integrity`](https://github.com/tartinerlabs/lockfile-integrity) action.

### Detection

Skip if a `.github/workflows/*.yml` file already contains `tartinerlabs/lockfile-integrity` or a step checking lockfile integrity or lockfile tampering.

### Template

Create `.github/workflows/lockfile-integrity.yml`:

```yaml
name: Lockfile Integrity

on:
  pull_request:
    paths:
      - pnpm-lock.yaml
      - package-lock.json
      - yarn.lock
      - bun.lock

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lockfile-integrity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: tartinerlabs/lockfile-integrity@e72908eb62a2ae8a85ae1b707a73c16469651d0f # v1.0.0
        with:
          base-ref: ${{ github.base_ref }}
```

### Adaptation

- Follow the project's CLAUDE.md action pinning rules:
  - GitHub-owned actions (`actions/*`): use version tags
  - Third-party actions: pin to full commit SHA with version comment
- Match action versions used in the project's existing workflows
- Replace `main` with the project's default branch if different (applies to `branches` trigger if used instead of `paths`)
- To pin to a specific lockfile instead of auto-detecting: add `lockfile: pnpm-lock.yaml` (or the detected lockfile name)
- To warn instead of failing (useful for gradual rollout): add `fail-on-warning: "false"`

### Known False Positives

- **Lockfile maintenance PRs** from Renovate — these intentionally update transitive dependencies without changing `package.json`. The check will fail as designed; reviewers can approve manually.
- **Deduplication runs** (`<pm> dedupe`) — these optimise the lockfile without manifest changes.
- **Monorepo workspace config changes** — pnpm uses a standalone `pnpm-workspace.yaml` (including catalogs in v9+) to define workspace membership. Editing this file changes the lockfile without any `package.json` dependency edit. Other package managers (npm, yarn, bun) define workspaces inside `package.json`, so they are already covered by the manifest check.
- **Package manager config changes** — files like `.npmrc`, `.yarnrc.yml`, `bunfig.toml`, or `.yarnrc` control registry URLs, resolution strategies, and peer dependency behaviour. Changing these can produce a different lockfile from the same `package.json`.

### Why This Matters

Lockfile tampering is a supply chain attack where an attacker modifies the lockfile to resolve a dependency to a malicious version without changing `package.json`. Since most code reviewers focus on source changes and skip lockfile diffs, this attack vector is easy to miss. This check surfaces suspicious lockfile-only changes for explicit review.
