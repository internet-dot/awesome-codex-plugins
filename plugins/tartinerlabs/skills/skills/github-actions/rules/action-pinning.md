# Action Pinning

**Severity: HIGH**

Pin all actions to prevent supply-chain attacks and ensure reproducible builds.

## Rule

- **GitHub-owned actions** (`actions/*`): use version tags (e.g., `@v4`)
- **Third-party actions** (everything else): pin to full commit SHA with version comment

## Incorrect

```yaml
# Third-party action using version tag — vulnerable to tag mutation
- uses: codecov/codecov-action@v4
- uses: JamesIves/github-pages-deploy-action@v4
```

## Correct

```yaml
# GitHub-owned — version tags are fine
- uses: actions/checkout@v4
- uses: actions/setup-node@v4

# Third-party — pinned to full commit SHA with version comment
- uses: codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673  # v5.0.7
- uses: JamesIves/github-pages-deploy-action@6c2391ed697a5e80688e3b2d0e42e74bac79deed  # v4.7.3
```

## How to Find the SHA

```bash
# Look up the commit SHA for a specific version tag
gh api repos/{owner}/{repo}/git/ref/tags/{tag} --jq '.object.sha'
```

## Why This Matters

Version tags are mutable — a malicious actor who gains access to a repository can point an existing tag to a different commit containing malicious code. Commit SHAs are immutable and cryptographically verified.
