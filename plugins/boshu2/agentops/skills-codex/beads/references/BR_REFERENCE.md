# br Command Reference

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (machine-readable) — **ALWAYS use for agents** |
| `--quiet` / `-q` | Suppress output |
| `--verbose` / `-v` | Increase verbosity (-vv for debug) |
| `--no-color` | Disable colored output |
| `--db <path>` | Override database path |
| `--actor <name>` | Set actor for audit trail |
| `--lock-timeout <ms>` | SQLite busy timeout |
| `--no-db` | JSONL-only mode (skip DB) |
| `--allow-stale` | Bypass freshness check |
| `--no-auto-flush` | Skip auto-export after mutations |
| `--no-auto-import` | Skip auto-import before reads |

---

## Issue Lifecycle

```bash
br init                              # Initialize workspace in .beads/
br create "Title" -p 1 --type bug    # Create issue (p=priority 0-4)
br q "Quick note"                    # Quick capture (ID only output)
br show <id>                         # Show issue details
br update <id> --priority 0          # Update issue fields
br close <id> --reason "Done"        # Close issue with reason
br reopen <id>                       # Reopen closed issue
br delete <id>                       # Delete issue (tombstone)
```

### Create Options

```bash
br create "Title" \
  --priority 1 \           # 0-4 scale
  --type task \            # task, bug, feature, etc.
  --assignee "user@..." \  # Optional assignee
  --description "..."      # Detailed description
```

### Update Options

```bash
br update <id> \
  --title "New title" \
  --priority 0 \
  --status in_progress \   # open, in_progress, closed
  --assignee "new@..."
```

---

## Querying

```bash
br list                              # List all issues
br list --status open                # Filter by status
br list --priority 0-1               # Filter by priority range
br list --assignee alice             # Filter by assignee
br list --json                       # JSON output (for agents)

br ready                             # Actionable work (not blocked)
br ready --json                      # JSON for agents

br blocked                           # Show blocked issues
br blocked --json

br search "authentication"           # Full-text search
br stale --days 30                   # Show stale issues
br count --by status                 # Count with grouping
```

---

## Dependencies

```bash
br dep add br-child br-parent        # child depends on parent
br dep remove br-child br-parent     # Remove dependency
br dep list <id>                     # List dependencies for issue
br dep tree <id>                     # Show dependency tree
br dep cycles                        # Find circular dependencies
```

**Critical:** `br dep cycles` must return empty. Circular dependencies break the graph.

---

## Labels

```bash
br label add <id> backend auth       # Add multiple labels
br label remove <id> urgent          # Remove label
br label list <id>                   # List issue's labels
br label list-all                    # All labels in project
```

---

## Comments

```bash
br comments add <id> "Found root cause"       # Add comment
br comments list <id>                         # List comments
```

---

## Sync

**Sync is always explicit. br NEVER auto-commits.**

```bash
br sync --flush-only                 # Export DB to JSONL
br sync --import-only                # Import JSONL to DB
br sync --status                     # Check sync status
```

---

## Skills

```bash
# Show sync status between canonical repo and global skills
br skills sync-status
br skills sync-status --json
br skills sync-status --verbose
br skills sync-status --canonical /path/to/repo/.claude/skills
br skills sync-status --global ~/.claude/skills
```

### Workflow

```bash
# After making changes:
br sync --flush-only
git add .beads/ && git commit -m "Update issues"

# After pulling:
git pull
br sync --import-only
```

---

## System

```bash
br doctor                            # Run diagnostics
br stats                             # Project statistics
br config list                       # Show all config
br config get issue-prefix           # Get specific value
br config set issue-prefix=myproject # Set value
br version                           # Show version
br upgrade                           # Self-update (if enabled)
```

---

## JSON Output Examples

```bash
# Get first ready issue
br ready --json | jq '.[0]'

# Filter high priority
br list --json | jq '.[] | select(.priority <= 1)'

# Get specific issue
br show <id> --json | jq '.title'
```
