---
name: bkt
version: 0.17.0
description: Bitbucket CLI for Data Center and Cloud. Use when users need to manage repositories, pull requests, branches, issues, webhooks, or pipelines in Bitbucket. Triggers include "bitbucket", "bkt", "pull request", "PR", "repo list", "branch create", "Bitbucket Data Center", "Bitbucket Cloud", "keyring timeout".
metadata:
  short-description: Bitbucket CLI for repos, PRs, branches
  compatibility: claude-code, codex-cli
---

# Bitbucket CLI (bkt)

`bkt` is a unified CLI for **Bitbucket Data Center** and **Bitbucket Cloud**. It mirrors `gh` ergonomics and provides structured JSON/YAML output for automation.

## Dependency Check

**Before executing any `bkt` command**, verify the CLI is installed:

```bash
bkt --version
```

If the command fails or `bkt` is not found, install it using one of these methods:

| Platform | Command |
|----------|---------|
| macOS/Linux | `brew install avivsinai/tap/bitbucket-cli` |
| Windows | `scoop bucket add avivsinai https://github.com/avivsinai/scoop-bucket && scoop install bitbucket-cli` |
| Go | `go install github.com/avivsinai/bitbucket-cli/cmd/bkt@latest` |
| Binary | Download from [GitHub Releases](https://github.com/avivsinai/bitbucket-cli/releases) |

**Only proceed with `bkt` commands after confirming installation succeeds.**

## Authentication

```bash
# Data Center (opens browser for PAT creation)
bkt auth login https://bitbucket.example.com --web

# Data Center (direct)
bkt auth login https://bitbucket.example.com --username alice --token <PAT>

# Bitbucket Cloud
bkt auth login https://bitbucket.org --kind cloud --web

# Check auth status
bkt auth status
```

**Bitbucket Cloud Token Requirements:**
- Create an "API token with scopes" (not a general API token)
- Select **Bitbucket** as the application
- Required scope: **Account: Read** (`read:user:bitbucket`)
- Additional scopes as needed: Repositories, Pull requests, Issues

## Contexts

Contexts store host, project/workspace, and default repo settings:

```bash
# Create context for Data Center
bkt context create dc-prod --host bitbucket.example.com --project ABC --set-active

# Create context for Cloud
bkt context create cloud-team --host bitbucket.org --workspace myteam --set-active

# List and switch contexts
bkt context list
bkt context use cloud-team
```

## Quick Command Reference

| Task | Command |
|------|---------|
| List repos | `bkt repo list` |
| View repo | `bkt repo view <slug>` |
| Clone repo | `bkt repo clone <slug> --ssh` |
| Create repo | `bkt repo create <name> --description "..."` |
| List PRs | `bkt pr list --state OPEN` |
| View PR | `bkt pr view <id>` |
| Create PR | `bkt pr create --title "..." --source feature --target main` |
| Create draft PR | `bkt pr create --title "..." --source feature --target main --draft` |
| Publish draft PR | `bkt pr publish <id>` |
| Unpublish PR | `bkt pr publish --undo <id>` |
| Merge PR | `bkt pr merge <id>` |
| PR checks | `bkt pr checks <id> --wait` |
| List branches | `bkt branch list` |
| Create branch | `bkt branch create <name> --from main` |
| Delete branch | `bkt branch delete <name>` |
| List issues (Cloud) | `bkt issue list --state open` |
| Create issue | `bkt issue create -t "Bug title" -k bug` |
| Webhooks | `bkt webhook list` |
| Run pipeline | `bkt pipeline run --ref main` |
| API escape hatch | `bkt api /rest/api/1.0/projects` |

## Repository Operations

```bash
bkt repo list --limit 20
bkt repo list --workspace myteam          # Cloud workspace override
bkt repo view platform-api
bkt repo create data-pipeline --description "Data ingestion" --project DATA
bkt repo browse --project DATA --repo platform-api
bkt repo clone platform-api --ssh
```

## Pull Request Workflows

```bash
# List and view
bkt pr list --state OPEN --limit 10
bkt pr list --mine                        # PRs you authored
bkt pr view 42
bkt pr view 42 --web                      # Open in browser

# Create and edit
bkt pr create --title "feat: cache" --source feature/cache --target main --reviewer alice
bkt pr create --title "WIP: refactor" --source refactor/auth --target main --draft

bkt pr edit 123 --title "New title" --body "Updated description"

# Publish / unpublish draft PRs
bkt pr publish 42                         # Mark draft PR as ready for review
bkt pr publish --undo 42                  # Convert PR back to draft

# Review and merge
bkt pr approve 42
bkt pr comment 42 --text "LGTM"
bkt pr comment 42 --text "Needs refactor" --pending   # Pending (draft) comment
bkt pr merge 42 --message "merge: feature/cache"
bkt pr merge 42 --strategy fast-forward

# CI/build status
bkt pr checks 42                          # Show build status
bkt pr checks 42 --wait                   # Wait for builds to complete
bkt pr checks 42 --wait --timeout 5m      # With timeout
bkt pr checks 42 --fail-fast              # Exit on first failure

# Checkout locally
bkt pr checkout 42                        # Fetches to pr/42 branch
```

## Branch Management

```bash
bkt branch list
bkt branch list --filter "feature/*"
bkt branch create release/1.9 --from main
bkt branch delete feature/old-stuff
bkt branch set-default main               # DC only
bkt branch protect add main --type fast-forward-only  # DC only
```

## Issue Tracking (Bitbucket Cloud Only)

```bash
bkt issue list --state open --kind bug
bkt issue view 42 --comments
bkt issue create -t "Login broken" -k bug -p major
bkt issue edit 42 --assignee "{uuid}" --priority critical
bkt issue close 42
bkt issue reopen 42
bkt issue comment 42 -b "Fixed in v1.2.0"
bkt issue status                          # Your assigned/created issues
```

Issue kinds: `bug`, `enhancement`, `proposal`, `task`
Priorities: `trivial`, `minor`, `major`, `critical`, `blocker`

## Webhooks

```bash
bkt webhook list
bkt webhook create --name "CI" --url https://ci.example.com/hook --event repo:refs_changed
bkt webhook delete <id>
bkt webhook test <id>
```

## Pipelines (Cloud)

```bash
bkt pipeline run --ref main --var ENV=staging
bkt pipeline list                         # Recent runs
bkt pipeline view <uuid>                  # Pipeline details
bkt pipeline logs <uuid>                  # Fetch logs
bkt status pipeline <uuid>                # Alt: status check
```

## Permissions (DC)

```bash
bkt perms project list --project DATA
bkt perms project grant --project DATA --user alice --perm PROJECT_WRITE
bkt perms repo list --project DATA --repo platform-api
bkt perms repo grant --project DATA --repo api --user alice --perm REPO_WRITE
```

## Raw API Access

For endpoints not yet wrapped:

```bash
bkt api /rest/api/1.0/projects --param limit=100 --json
bkt api /repositories --param workspace=myteam --field pagelen=50
```

## Output Modes

All commands support structured output:

```bash
bkt pr list --json                        # JSON output
bkt pr list --yaml                        # YAML output
bkt pr list --json | jq '.pull_requests[0].title'
```

## Global Options

- `--json` / `--yaml` — Structured output
- `--context <name>` — Use specific context
- `--project <key>` — Override project (DC)
- `--workspace <name>` — Override workspace (Cloud)
- `--repo <slug>` — Override repository

## Environment Variables

- `BKT_CONFIG_DIR` — Config directory override
- `BKT_ALLOW_INSECURE_STORE` — Allow file-based credential storage
- `BKT_KEYRING_TIMEOUT` — Keyring operation timeout (for example `2m`)

## References

- **Full command reference**: See [references/commands.md](references/commands.md)
