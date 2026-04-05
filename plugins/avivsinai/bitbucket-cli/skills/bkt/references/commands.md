# Bitbucket CLI Command Reference

Complete command reference for `bkt`. Run `bkt <command> --help` for details.

## Authentication

### Login
```bash
# Data Center - guided flow
bkt auth login https://bitbucket.example.com --web

# Data Center - direct credentials
bkt auth login https://bitbucket.example.com --username alice --token <PAT>

# Bitbucket Cloud - guided flow
bkt auth login https://bitbucket.org --kind cloud --web

# Bitbucket Cloud - direct credentials
bkt auth login https://bitbucket.org --kind cloud --username <email> --token <api-token>
```

Options:
- `--kind` — Deployment type: `dc` (default) or `cloud`
- `--username` — Username (DC: PAT owner, Cloud: Atlassian email)
- `--token` — Authentication token
- `--web` — Open browser to create token
- `--allow-insecure-store` — Allow encrypted file fallback

**Bitbucket Cloud Token Requirements:**
When using `--kind cloud`, create an API token with scopes at Atlassian:
- Select "Bitbucket" as the application
- Required: Account: Read
- Recommended: Repositories (Read/Write), Pull requests (Read/Write)
- Optional: Issues (Read/Write)

### Status and Logout
```bash
bkt auth status                           # Show configured hosts and contexts
bkt auth logout <host>                    # Remove stored credentials
```

## Context Management

```bash
# Create context for Data Center
bkt context create dc-prod --host bitbucket.example.com --project ABC --set-active

# Create context for Cloud
bkt context create cloud-team --host bitbucket.org --workspace myteam --repo api --set-active

# List contexts (* = active)
bkt context list

# Switch context
bkt context use cloud-team

# Delete context
bkt context delete old-context
```

Options for `context create`:
- `--host` — Host key or base URL (required)
- `--project` — Default project key (DC, required for DC)
- `--workspace` — Default workspace (Cloud, required for Cloud)
- `--repo` — Default repository slug
- `--set-active` — Set as active context

## Repository Commands

### List and View
```bash
bkt repo list                             # List repos in default project/workspace
bkt repo list --limit 50
bkt repo list --project OTHER             # Override project (DC)
bkt repo list --workspace other-team      # Override workspace (Cloud)

bkt repo view <slug>                      # View repo details
bkt repo view platform-api --project DATA
```

### Create
```bash
bkt repo create <name>
bkt repo create data-pipeline --description "Data ingestion pipeline"
bkt repo create api --project DATA --public --forkable
bkt repo create frontend --workspace myteam --cloud-project PROJ
```

Options:
- `--project` / `--workspace` — Target location
- `--description` — Repository description
- `--public` — Create as public
- `--forkable` — Allow forking (DC)
- `--default-branch` — Set default branch
- `--scm` — SCM type (default: git)

### Clone and Browse
```bash
bkt repo clone <slug>                     # Clone via HTTPS
bkt repo clone <slug> --ssh               # Clone via SSH
bkt repo clone <slug> --dest ./mydir      # Custom destination

bkt repo browse                           # Print repo web URL
bkt repo browse platform-api
```

## Pull Request Commands

### List and View
```bash
bkt pr list                               # List open PRs
bkt pr list --state OPEN                  # Filter by state (OPEN, MERGED, DECLINED)
bkt pr list --state MERGED --limit 50
bkt pr list --mine                        # PRs authored by you

bkt pr view <id>                          # View PR details
bkt pr view 42 --web                      # Open in browser
```

### Create
```bash
bkt pr create --title "feat: add caching" --source feature/cache --target main

# With reviewers and options
bkt pr create \
  --title "Add user auth" \
  --source feature/auth \
  --target main \
  --description "Implements OAuth2 flow" \
  --reviewer alice \
  --reviewer bob \
  --close-source

# Create as draft
bkt pr create --title "WIP: refactor" --source refactor/auth --target main --draft
```

Required flags: `--title`, `--source`, `--target`

Options:
- `--description` — PR description
- `--reviewer` — Reviewer username (repeatable)
- `--close-source` — Close source branch on merge
- `--draft` — Create pull request as a draft (DC 8.18+, Cloud always supported)

### Edit
```bash
bkt pr edit <id> --title "New title"
bkt pr edit <id> --body "Updated description"
bkt pr edit <id> -t "Fix login bug" -b "Resolves session timeout issue"
```

### Publish (Draft Status)
```bash
bkt pr publish <id>                       # Mark draft PR as ready for review
bkt pr publish --undo <id>                # Convert PR back to draft
bkt pr ready <id>                         # Alias for publish
```

Options:
- `--undo` — Convert a published pull request back to draft

### Review and Merge
```bash
bkt pr approve <id>                       # Approve PR

bkt pr comment <id> --text "LGTM"         # Add comment
bkt pr comment <id> --text "Fix this" --pending  # Pending (draft) comment
bkt pr comment <id> --text "Nit" --file src/app.go --to-line 42  # Inline comment
bkt pr comment <id> --text "Reply" --parent 99                   # Threaded reply
```

Comment options:
- `--text` — Comment text (required)
- `--pending` — Create as pending/draft review comment
- `--file` — File path in the diff (requires `--from-line` or `--to-line`)
- `--from-line` — Line in the old file (removed/source side)
- `--to-line` — Line in the new file (added/destination side)
- `--parent` — Parent comment ID for threaded replies

```bash
bkt pr merge <id>                         # Merge PR
bkt pr merge <id> --message "merge: feature" --strategy fast-forward
bkt pr merge <id> --close-source=false    # Keep source branch
```

Merge options:
- `--message` — Merge commit message
- `--strategy` — Merge strategy (e.g., `fast-forward`)
- `--close-source` — Close source branch (default: true)

### Build/CI Checks
```bash
bkt pr checks <id>                        # Show build status
bkt pr checks <id> --wait                 # Wait for completion
bkt pr checks <id> --wait --timeout 10m   # With timeout
bkt pr checks <id> --wait --fail-fast     # Exit on first failure
bkt pr checks <id> --wait --interval 15s  # Custom poll interval
bkt pr checks <id> --wait --max-interval 3m  # Backoff cap
bkt pr checks <id> --web                  # Open first build URL
```

### Checkout and Diff
```bash
bkt pr checkout <id>                      # Fetch to pr/<id> branch
bkt pr checkout <id> --branch my-review   # Custom local branch name
bkt pr checkout <id> --remote upstream    # Custom remote

bkt pr diff <id>                          # Show PR diff
bkt pr diff <id> --stat                   # Show diff statistics
```

### Tasks (DC)
```bash
bkt pr task list <id>                     # List tasks on a PR
bkt pr task create <id> --text "Add tests"
bkt pr task complete <id> <task-id>       # Mark task complete
bkt pr task reopen <id> <task-id>         # Reopen completed task
```

### Code Suggestions (DC)
```bash
bkt pr suggestion <id> <comment-id> <suggestion-id>           # Apply a suggestion
bkt pr suggestion <id> <comment-id> <suggestion-id> --preview # Preview only
```

### Auto-merge
```bash
bkt pr auto-merge enable <id>             # Enable auto-merge when checks pass
bkt pr auto-merge disable <id>            # Disable auto-merge
bkt pr auto-merge status <id>             # Check auto-merge status
```

### Reactions (DC)
```bash
bkt pr reaction list <id> <comment-id>              # List reactions on a comment
bkt pr reaction add <id> <comment-id> --emoji thumbsup
bkt pr reaction remove <id> <comment-id> --emoji thumbsup
```

### Reviewer Groups (DC)
```bash
bkt pr reviewer-group list                          # List default reviewer groups
bkt pr reviewer-group add <group>                   # Add group as default reviewer
bkt pr reviewer-group remove <group>                # Remove group from defaults
```

## Branch Commands

### List and Create
```bash
bkt branch list
bkt branch list --filter "feature/*"      # Filter by pattern
bkt branch list --limit 100

bkt branch create <name> --from <ref>     # Create from branch/commit
bkt branch create release/1.9 --from main
bkt branch create hotfix --from abc123 --message "Emergency fix"
```

### Delete and Manage
```bash
bkt branch delete <name>
bkt branch delete feature/old --dry-run   # Validate without deleting

bkt branch set-default <name>             # Set default branch (DC)
```

### Branch Protection (DC)
```bash
bkt branch protect list                             # List branch restrictions
bkt branch protect add <branch> --type <type>       # Add restriction
bkt branch protect remove <id>                      # Remove restriction by ID
```

Protection types: `no-creates`, `no-deletes`, `fast-forward-only`, `require-approvals`

Example:
```bash
bkt branch protect add main --type fast-forward-only
bkt branch protect add "release/*" --type require-approvals
```

### Rebase (DC)
```bash
bkt branch rebase <branch>                # Rebase branch
bkt branch rebase <branch> --interactive  # Interactive rebase
bkt branch rebase <branch> --no-fetch     # Skip fetch before rebase
```

## Issue Commands (Bitbucket Cloud Only)

### List and View
```bash
bkt issue list                            # List open issues
bkt issue list --state open               # Filter by state
bkt issue list --kind bug                 # Filter by kind
bkt issue list --priority major           # Filter by priority
bkt issue list --assignee {uuid}          # Filter by assignee

bkt issue view <id>
bkt issue view 42 --comments              # Include comments
bkt issue view 42 --web                   # Open in browser
```

States: `new`, `open`, `resolved`, `on hold`, `invalid`, `duplicate`, `wontfix`, `closed`
Kinds: `bug`, `enhancement`, `proposal`, `task`
Priorities: `trivial`, `minor`, `major`, `critical`, `blocker`

### Create and Edit
```bash
bkt issue create -t "Title" -b "Description"
bkt issue create -t "Login broken" -k bug -p major
bkt issue create -t "Add dark mode" -k enhancement -a "{assignee-uuid}"

bkt issue edit <id> --title "New title"
bkt issue edit <id> --state resolved --priority critical
bkt issue edit <id> --assignee "{uuid}"
```

### Lifecycle
```bash
bkt issue close <id>                      # Close issue
bkt issue reopen <id>                     # Reopen closed issue
bkt issue delete <id>                     # Delete (prompts for confirm)
bkt issue delete <id> --confirm           # Skip confirmation
```

### Comments and Status
```bash
bkt issue comment <id> -b "Comment text"  # Add comment
bkt issue comment <id> --list             # List comments

bkt issue status                          # Issues assigned to/created by you
```

### Attachments
```bash
bkt issue attachment list <id>            # List attachments on an issue
bkt issue attachment upload <id> <files>...  # Upload file(s)
bkt issue attachment download <id> <filename>  # Download specific file
bkt issue attachment download <id> --all  # Download all attachments
bkt issue attachment download <id> --pattern "*.png"  # Download by pattern
bkt issue attachment download <id> --all --dir ./attachments  # To directory
bkt issue attachment download <id> --all --skip-existing  # Skip existing files
bkt issue attachment delete <id> <filename>  # Delete (prompts for confirm)
bkt issue attachment delete <id> <filename> --confirm  # Skip confirmation
```

## Webhook Commands

```bash
bkt webhook list
bkt webhook list --project DATA --repo api

bkt webhook create --name "CI Hook" --url https://ci.example.com/hook --event repo:refs_changed
bkt webhook create --name "Deploy" --url https://deploy.example.com --event pr:merged --active=false

bkt webhook delete <id>

bkt webhook test <id>                     # Trigger test delivery
```

Options for `webhook create`:
- `--name` — Webhook name (required)
- `--url` — Callback URL (required)
- `--event` — Events to subscribe to (required, repeatable)
- `--active` — Whether webhook starts active (default: true)

Events (DC): `repo:refs_changed`, `repo:forked`, `repo:comment:added`, `repo:comment:edited`, `repo:comment:deleted`, `pr:opened`, `pr:merged`, `pr:declined`, `pr:deleted`, `pr:comment:added`, etc.

## Pipeline Commands (Cloud Only)

```bash
# Trigger pipeline
bkt pipeline run --ref main
bkt pipeline run --workspace myteam --repo api --ref main
bkt pipeline run --ref main --var ENV=staging --var DEBUG=true

# List recent pipelines
bkt pipeline list
bkt pipeline list --limit 50

# View pipeline details
bkt pipeline view <uuid>

# Fetch pipeline logs
bkt pipeline logs <uuid>                  # Logs from last step
bkt pipeline logs <uuid> --step <step-uuid>  # Specific step logs
```

## Permission Commands (DC)

### Project Permissions
```bash
bkt perms project list --project DATA               # List project permissions
bkt perms project grant --project DATA --user alice --perm PROJECT_WRITE
bkt perms project revoke --project DATA --user alice
```

Project permissions: `PROJECT_READ`, `PROJECT_WRITE`, `PROJECT_ADMIN`

### Repository Permissions
```bash
bkt perms repo list --project DATA --repo platform-api
bkt perms repo grant --project DATA --repo api --user alice --perm REPO_WRITE
bkt perms repo revoke --project DATA --repo api --user alice
```

Repository permissions: `REPO_READ`, `REPO_WRITE`, `REPO_ADMIN`

## Status Commands

```bash
# Build status for a commit (DC only)
bkt status commit <sha>

# Build status for PR head commit (DC only)
bkt status pr <id>
bkt status pr 42 --project DATA --repo api

# Pipeline status (Cloud only)
bkt status pipeline <uuid>

# API rate limit status
bkt status rate-limit
```

## Project Commands (DC)

```bash
bkt project list                          # List all projects
bkt project list --limit 50               # Limit results
bkt project list --host bitbucket.example.com  # Override host
```

## Admin Commands (DC)

### Secrets Management
```bash
bkt admin secrets rotate                  # Rotate encryption keys
```

### Logging Configuration
```bash
bkt admin logging get                     # Show current logging config
bkt admin logging set --level DEBUG       # Set logging level
bkt admin logging set --async             # Enable async logging
```

Logging levels: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`

## API Escape Hatch

For any endpoint not wrapped by a command:

```bash
# Data Center
bkt api /rest/api/1.0/projects --param limit=100
bkt api /rest/api/1.0/projects/ABC/repos --json

# Cloud
bkt api /repositories --param workspace=myteam
bkt api /repositories/myteam/api --field pagelen=50

# POST/PUT/DELETE with fields
bkt api /rest/api/1.0/projects/ABC/repos -X POST --field name=demo --field scmId=git

# POST with raw JSON body
bkt api /repositories/myteam/api/issues -X POST --input '{"title": "Bug report"}'
```

Options:
- `--param key=value` / `-P` — Query parameter (repeatable)
- `--field key=value` / `-F` — Request body field (repeatable)
- `-X METHOD` — HTTP method (defaults to GET, or POST if body supplied)
- `--input <json>` / `-d` — Raw JSON string as request body
- `--header "Key: Value"` / `-H` — Add HTTP header (repeatable)

## Extension Commands

```bash
bkt extension list                        # List installed extensions
bkt extension install <repo>              # Install from GitHub
bkt extension install avivsinai/bkt-hello
bkt extension remove <name>
bkt extension exec <name> -- --flag=1     # Execute extension
```

## Global Options

All commands support:
- `--json` — JSON output
- `--yaml` — YAML output
- `--context <name>` — Use specific context
- `--project <key>` — Override project (DC)
- `--workspace <name>` — Override workspace (Cloud)
- `--repo <slug>` — Override repository
- `--help` — Command help

## Environment Variables

- `BKT_CONFIG_DIR` — Config directory override
- `BKT_ALLOW_INSECURE_STORE` — Allow file-based credential storage (set to `1`)
- `BKT_KEYRING_TIMEOUT` — Keyring operation timeout (for example `2m`)
