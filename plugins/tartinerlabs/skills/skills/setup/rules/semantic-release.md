# semantic-release

Automated versioning and publishing based on conventional commits.

**Opt-in only** — install when the user explicitly requests it (e.g., `/setup semantic-release`).

## Install

```bash
<pm> add -D semantic-release @semantic-release/changelog @semantic-release/git
```

## Config

Create `release.config.js`:

```js
export default {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    ["@semantic-release/git", {
      assets: ["CHANGELOG.md", "package.json"],
      message: "chore(release): ${nextRelease.version}"
    }],
    "@semantic-release/github"
  ]
};
```
