---
title: Renovate Configuration
impact: MEDIUM
tags: renovate, dependency-updates, automerge, pinning, supply-chain
---

**Rule**: Configure Renovate for automated dependency updates with pinning strategy, package grouping, and controlled auto-merge.

### Detection

Skip this rule if any of these exist:
- `renovate.json`
- `.renovaterc`
- `.renovaterc.json`
- `renovate` key in `package.json`

### Template Configuration

Create `renovate.json` at the project root:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "rangeStrategy": "pin",
  "schedule": ["before 9am on Monday"],
  "packageRules": [
    {
      "description": "Auto-merge patch updates for devDependencies",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["patch"],
      "automerge": true
    }
  ],
  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["before 9am on the first day of the month"]
  }
}
```

### Package Grouping

Scan `package.json` for related packages and add group rules. Create a group for scoped packages (`@scope/*`) that have 2+ packages from the same scope.

Well-known ecosystems to group (only add for packages that exist in the project):

| Group | Packages |
|-------|----------|
| semantic-release | `semantic-release`, `@semantic-release/*` |
| commitlint | `@commitlint/*` |
| testing-library | `@testing-library/*` |
| sentry | `@sentry/*` |
| heroui | `@heroui/*` |
| eslint | `eslint`, `eslint-*`, `@eslint/*` |
| vitest | `vitest`, `@vitest/*` |

Example group rule:

```json
{
  "description": "Group @commitlint packages",
  "matchPackageNames": ["@commitlint/*"],
  "groupName": "commitlint"
}
```

### Why This Matters

Pinned versions without automated updates become a liability — they go stale and accumulate vulnerabilities. Renovate creates explicit, reviewable PRs for each update, maintaining the security benefit of pinning while keeping dependencies current. Grouping related packages prevents version skew within ecosystems.
