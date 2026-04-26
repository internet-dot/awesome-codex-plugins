---
title: .npmrc Security Flags
impact: HIGH
tags: npmrc, registry, ignore-scripts, save-exact, supply-chain
---

**Rule**: Configure the package manager to block install-time malware, lock to the official registry, and pin exact versions by default.

### Required Flags

| Flag | Value | Purpose |
|------|-------|---------|
| `ignore-scripts` | `true` | Block postinstall scripts (primary malware vector) |
| `registry` | `https://registry.npmjs.org/` | Lock to official registry, prevent rogue registries |
| `save-exact` | `true` | Pin exact versions on `<pm> add` (no `^` or `~` ranges) |

### pnpm / npm (`.npmrc`)

```ini
ignore-scripts=true
registry=https://registry.npmjs.org/
save-exact=true
```

### yarn (`.yarnrc.yml`)

```yaml
enableScripts: false
npmRegistryServer: "https://registry.npmjs.org"
defaultSemverRangePrefix: ""
```

### bun (`bunfig.toml`)

Bun does not support `ignore-scripts` or `save-exact` via config. Add to `.npmrc` as bun reads it for registry settings:

```ini
registry=https://registry.npmjs.org/
```

### Merging with Existing Config

If a config file already exists:
1. Read the existing file
2. Add only missing flags — do not overwrite existing settings
3. Preserve comments and formatting

### Tradeoff: `ignore-scripts=true`

This blocks ALL lifecycle scripts during install, including the project's own `prepare` script (commonly used by Husky for git hooks).

**Mitigation**: After a fresh clone, run the prepare script manually:
- `pnpm exec husky` (if using Husky)
- Or `<pm> run prepare`

This is a one-time cost per clone. Git hooks work normally after initialisation.

### Why This Matters

Install-time scripts (`postinstall`, `preinstall`) are the primary vector for npm supply chain attacks. Malicious packages execute arbitrary code the moment they are installed. Blocking scripts by default eliminates this attack surface entirely.
