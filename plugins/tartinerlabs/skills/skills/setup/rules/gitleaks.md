# GitLeaks

Secrets detection in pre-commit hook to prevent accidental credential leaks.

## Prerequisite

GitLeaks must be installed on the system:

```bash
brew install gitleaks
```

## Hook

Add to `.husky/pre-commit` as the **first command** (before lint-staged):

```bash
gitleaks protect --staged --verbose
```

This runs before lint-staged so secrets are caught before any other processing.
