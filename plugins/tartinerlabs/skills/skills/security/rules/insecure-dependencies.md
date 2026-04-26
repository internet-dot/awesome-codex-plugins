---
title: Insecure Dependencies
impact: MEDIUM
tags: dependencies, audit, npm, pnpm, yarn, bun, vulnerabilities
---

**Rule**: Check for known vulnerabilities in project dependencies.

### How to Audit

```bash
# npm
npm audit

# pnpm
pnpm audit

# yarn
yarn audit

# bun
bun audit

# Check for outdated packages
npm outdated
pnpm outdated
yarn outdated
bun outdated
```

### What to Check

- Packages with known CVEs (Critical and High severity)
- Severely outdated packages (multiple major versions behind)
- Packages that have been deprecated or abandoned

### Remediation

- Update vulnerable packages: `npm audit fix` / `pnpm audit --fix` or manual version bumps
- Replace abandoned packages with actively maintained alternatives
- Pin dependency versions to avoid unexpected updates
