# worktree.sh — git worktree helpers for session-orchestrator
# Sourced by callers, not executed directly.
# Provides worktree create/cleanup for platforms without built-in isolation.

# create_worktree <branch-suffix> [base-ref]
# Creates a git worktree for isolated agent work.
# Returns the worktree path via stdout.
# Args:
#   branch-suffix: unique suffix for the worktree branch (e.g., "wave2-agent1")
#   base-ref: git ref to base the worktree on (default: HEAD)
# Example: path=$(create_worktree "wave2-agent1")
create_worktree() {
  local suffix="${1:?Usage: create_worktree <suffix> [base-ref]}"
  local base="${2:-HEAD}"
  local branch="so-worktree-${suffix}"
  local worktree_dir="${TMPDIR:-/tmp}/so-worktrees/${branch}"

  mkdir -p "$(dirname "$worktree_dir")"
  git worktree add -b "$branch" "$worktree_dir" "$base" 2>/dev/null || {
    # Branch may already exist from a previous failed run — remove and retry
    git worktree remove "$worktree_dir" --force 2>/dev/null || true
    git branch -D "$branch" 2>/dev/null || true
    git worktree add -b "$branch" "$worktree_dir" "$base"
  }

  echo "$worktree_dir"
}

# cleanup_worktree <worktree-path>
# Removes a worktree and its associated branch.
# If the worktree has uncommitted changes, emits a warning to stderr.
cleanup_worktree() {
  local worktree_path="${1:?Usage: cleanup_worktree <path>}"

  [ ! -d "$worktree_path" ] && return 0

  # Check if worktree has uncommitted changes
  if (cd "$worktree_path" && [ -n "$(git status --porcelain)" ]); then
    echo "WARNING: worktree at $worktree_path has uncommitted changes" >&2
  fi

  # Get the branch name before removing
  local branch=""
  branch=$(cd "$worktree_path" && git rev-parse --abbrev-ref HEAD 2>/dev/null) || branch=""

  # Remove worktree
  git worktree remove "$worktree_path" --force 2>/dev/null || true

  # Clean up the temporary branch
  if [ -n "$branch" ]; then
    case "$branch" in
      so-worktree-*) git branch -D "$branch" 2>/dev/null || true ;;
    esac
  fi
}

# cleanup_all_worktrees
# Removes all session-orchestrator worktrees (so-worktree-* branches).
cleanup_all_worktrees() {
  git worktree list --porcelain | while IFS= read -r line; do
    case "$line" in
      "worktree "*)
        local path="${line#worktree }"
        case "$path" in
          *so-worktree*) cleanup_worktree "$path" ;;
        esac
        ;;
    esac
  done

  # Prune any stale worktree references
  git worktree prune 2>/dev/null || true
}
