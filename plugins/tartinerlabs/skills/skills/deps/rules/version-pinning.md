---
title: Version Pinning
impact: HIGH
tags: pin, exact, semver, caret, tilde, lockfile, supply-chain
---

**Rule**: Pin all dependency versions to exact resolved versions from the lockfile. Remove all `^` and `~` range specifiers.

### How to Pin

1. Open `package.json` (and `packages/*/package.json` in monorepos)
2. For each dependency in `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`:
   - Remove the `^` or `~` prefix
   - Use the exact version resolved in the lockfile

### Incorrect

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "~4.17.21"
  }
}
```

### Correct

```json
{
  "dependencies": {
    "express": "4.18.2",
    "lodash": "4.17.21"
  }
}
```

### Monorepo Handling

- Check all `packages/*/package.json` files
- Check pnpm catalog in `pnpm-workspace.yaml` (the `catalog:` field)
- Pin workspace protocol references (`workspace:*`) are fine — leave them as-is

### Exception: Expo / React Native

Preserve `~` for Expo SDK packages. Expo requires compatible minor versions across its SDK:

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "~0.74.0"
  }
}
```

**Detection**: If `expo` is in dependencies, preserve `~` for all `expo-*` and `react-native*` packages.

### Why This Matters

Range specifiers (`^`, `~`) allow automatic installation of newer versions that may contain breaking changes, regressions, or supply chain attacks. Pinning to exact versions ensures reproducible builds and gives Renovate (or Dependabot) full control over when versions change — through explicit, reviewable PRs.
