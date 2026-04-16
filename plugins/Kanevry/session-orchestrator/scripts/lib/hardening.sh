#!/usr/bin/env bash
# hardening.sh — shared pure functions for PreToolUse/PostToolUse hook scripts.
#
# Design goals:
#   - Pure functions: no side effects beyond stdout/stderr and explicit exit codes
#   - Fail-closed semantics preserved: callers get deny behavior by default
#   - Independently testable via scripts/test/test-hardening.sh
#   - Source this file; do not execute directly
#
# Environment outputs (set by source_platform):
#   SO_PROJECT_DIR  — absolute path to the project root (canonicalized)

# Guard against double-sourcing
[[ -n "${_SO_HARDENING_SOURCED:-}" ]] && return 0
_SO_HARDENING_SOURCED=1

# ---------------------------------------------------------------------------
# jq availability
# ---------------------------------------------------------------------------

# require_jq — fail-closed check for jq. Emits a deny JSON and exits 2 when jq
# is missing and the caller requests deny-on-miss. In warn/informational mode,
# writes a stderr notice and returns 1 so callers can skip.
#
# Usage:
#   require_jq "enforce-scope"            # deny mode (default): exits 2 if missing
#   require_jq "post-edit-validate" warn  # warn mode: returns 1 if missing
require_jq() {
  local hook_name="${1:-hook}"
  local mode="${2:-deny}"
  if command -v jq &>/dev/null; then
    return 0
  fi
  case "$mode" in
    warn)
      echo "WARNING: $hook_name: jq not installed — skipping." >&2
      return 1
      ;;
    deny|*)
      printf '{"permissionDecision":"deny","reason":"%s: jq not installed — cannot verify. Install jq to enable enforcement."}\n' "$hook_name"
      exit 2
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Platform detection
# ---------------------------------------------------------------------------

# source_platform — locate and source scripts/lib/platform.sh from the caller's
# hook script directory with a fallback chain. Sets SO_PROJECT_DIR on success.
# Callers must export HOOK_SCRIPT_DIR (absolute path of the hook file) before
# calling, or pass it as the first argument.
source_platform() {
  local hook_dir="${1:-${HOOK_SCRIPT_DIR:-}}"
  if [[ -n "$hook_dir" && -f "$hook_dir/../scripts/lib/platform.sh" ]]; then
    # shellcheck disable=SC1091
    source "$hook_dir/../scripts/lib/platform.sh"
    return 0
  fi
  if [[ -n "${CLAUDE_PLUGIN_ROOT:-}" && -f "$CLAUDE_PLUGIN_ROOT/scripts/lib/platform.sh" ]]; then
    # shellcheck disable=SC1091
    source "$CLAUDE_PLUGIN_ROOT/scripts/lib/platform.sh"
    return 0
  fi
  if [[ -n "${CODEX_PLUGIN_ROOT:-}" && -f "$CODEX_PLUGIN_ROOT/scripts/lib/platform.sh" ]]; then
    # shellcheck disable=SC1091
    source "$CODEX_PLUGIN_ROOT/scripts/lib/platform.sh"
    return 0
  fi
  # Ultimate fallback — SO_PROJECT_DIR is the cwd
  SO_PROJECT_DIR="$(pwd)"
  return 0
}

# ---------------------------------------------------------------------------
# Scope manifest
# ---------------------------------------------------------------------------

# find_scope_file — echo the first existing wave-scope.json across platforms.
# Output empty when no manifest exists.
# Precedence: .cursor/ > .codex/ > .claude/ (matches prior hook behavior).
find_scope_file() {
  local root="${1:-$SO_PROJECT_DIR}"
  for dir in .cursor .codex .claude; do
    if [[ -f "$root/$dir/wave-scope.json" ]]; then
      echo "$root/$dir/wave-scope.json"
      return 0
    fi
  done
  # No scope file — echo empty and return 0 so callers using $(find_scope_file)
  # under `set -e` can safely check for emptiness instead of trapping on exit code.
  echo ""
  return 0
}

# get_enforcement_level — read the enforcement field from a scope file.
# Defaults to "strict" (fail-closed) when the field is missing or unparsable.
get_enforcement_level() {
  local scope_file="$1"
  local level
  level=$(jq -r '.enforcement // "strict"' "$scope_file" 2>/dev/null) || level="strict"
  echo "$level"
}

# ---------------------------------------------------------------------------
# Gate toggles (#77)
# ---------------------------------------------------------------------------

# gate_enabled — returns 0 if the named gate is enabled for the current scope
# manifest. Gates live under `.gates.<name>` in wave-scope.json. Missing gate
# entries default to enabled (true) — preserves existing behavior when the
# feature is unconfigured.
#
# Usage:
#   gate_enabled "$SCOPE_FILE" path-guard && { ... run check ... }
gate_enabled() {
  local scope_file="$1"
  local gate_name="$2"
  local value
  [[ -z "$scope_file" || ! -f "$scope_file" ]] && return 0
  # Use explicit null-check: `// true` treats false as falsy, so `.gates[$g] // true`
  # would return true when the gate is explicitly false. Use `if ... == null then ...`
  # to preserve the literal false value.
  value=$(jq -r --arg g "$gate_name" '(.gates[$g]) as $v | if $v == null then "true" else ($v | tostring) end' "$scope_file" 2>/dev/null) || value="true"
  [[ "$value" == "true" ]]
}

# ---------------------------------------------------------------------------
# Path matching
# ---------------------------------------------------------------------------

# path_matches_pattern — returns 0 if relative path matches a single pattern.
# Supports:
#   - Directory prefix: "src/" matches any file under src/
#   - Recursive glob:   "src/**/*.ts" matches any .ts under src at any depth
#   - Single-segment glob: "src/*.ts" matches only immediate children
#   - Exact match:      "path/to/file.ts"
#
# Usage:
#   path_matches_pattern "src/foo.ts" "src/**/*.ts" && echo match
path_matches_pattern() {
  local rel_path="$1"
  local pattern="$2"
  local regex

  [[ -z "$pattern" ]] && return 1

  # Directory prefix
  if [[ "$pattern" == */ && "$rel_path" == "$pattern"* ]]; then
    return 0
  fi

  # Recursive glob (**)
  if [[ "$pattern" == *'**'* ]]; then
    regex="$pattern"
    regex="${regex//./\\.}"
    regex="${regex//+/\\+}"
    regex="${regex//\?/\\?}"
    regex="${regex//|/\\|}"
    regex="${regex//\[/\\[}"
    regex="${regex//\]/\\]}"
    regex="${regex//\(/\\(}"
    regex="${regex//\)/\\)}"
    regex="${regex//\*\*\//<<DSLASH>>}"
    regex="${regex//\*\*/<<DBL>>}"
    regex="${regex//\*/[^/]*}"
    regex="${regex//<<DSLASH>>/(.*\/)?}"
    regex="${regex//<<DBL>>/.*}"
    regex="^${regex}$"
    [[ "$rel_path" =~ $regex ]] && return 0
    return 1
  fi

  # Single-segment glob
  if [[ "$pattern" == *'*'* ]]; then
    regex="$pattern"
    regex="${regex//./\\.}"
    regex="${regex//+/\\+}"
    regex="${regex//\?/\\?}"
    regex="${regex//|/\\|}"
    regex="${regex//\[/\\[}"
    regex="${regex//\]/\\]}"
    regex="${regex//\(/\\(}"
    regex="${regex//\)/\\)}"
    regex="${regex//\*/[^/]*}"
    regex="^${regex}$"
    [[ "$rel_path" =~ $regex ]] && return 0
    return 1
  fi

  # Exact match
  [[ "$rel_path" == "$pattern" ]]
}

# ---------------------------------------------------------------------------
# Command classification
# ---------------------------------------------------------------------------

# command_matches_blocked — returns 0 if command contains the blocked pattern
# with word boundaries (start-of-command or whitespace, followed by pattern,
# followed by whitespace or end-of-command).
#
# Usage:
#   command_matches_blocked "rm -rf /foo" "rm -rf" && echo blocked
command_matches_blocked() {
  local command="$1"
  local pattern="$2"
  [[ -z "$pattern" ]] && return 1
  [[ "$command" =~ (^|[[:space:]])"$pattern"([[:space:]]|$) ]]
}

# ---------------------------------------------------------------------------
# Decision emission (actionable suggestions — #78)
# ---------------------------------------------------------------------------

# emit_deny — print a JSON deny decision and exit 2. Optional third argument
# provides an actionable suggestion appended to the reason string.
emit_deny() {
  local reason="$1"
  local suggestion="${2:-}"
  local full_reason="$reason"
  [[ -n "$suggestion" ]] && full_reason="$reason — $suggestion"
  jq -nc --arg r "$full_reason" '{"permissionDecision":"deny","reason":$r}'
  exit 2
}

# emit_warn — write a stderr warning and exit 0 (caller proceeds).
emit_warn() {
  local reason="$1"
  echo "⚠ $reason" >&2
  exit 0
}

# suggest_for_scope_violation — build an actionable suggestion for a scope
# violation (used by enforce-scope.sh in denial messages).
suggest_for_scope_violation() {
  local rel_path="$1"
  local allowed="$2"
  if [[ -z "$allowed" ]]; then
    echo "No paths are currently allowed for this wave. If this edit is intentional, pause the session and adjust the wave scope."
  else
    echo "Allowed paths: [$allowed]. If '$rel_path' belongs to this wave, add its directory to the plan's wave scope and restart the wave."
  fi
}

# suggest_for_command_block — build an actionable suggestion for a blocked
# command.
suggest_for_command_block() {
  local pattern="$1"
  case "$pattern" in
    "rm -rf")
      echo "Destructive deletion is blocked during wave execution. Move specific files instead, or pause the session and perform the deletion manually with user confirmation."
      ;;
    "git push --force"|"git push -f")
      echo "Force-push is blocked. Use 'git push --force-with-lease' if rewriting shared history is truly necessary, and only after coordinator approval."
      ;;
    "git reset --hard")
      echo "Hard reset is blocked. Use 'git reset --soft' or 'git stash' to preserve changes, and only proceed after coordinator review."
      ;;
    "git checkout -- .")
      echo "Whole-tree discard is blocked. Target specific files with 'git checkout -- <path>' after confirming no live work will be lost."
      ;;
    *)
      echo "Blocked command pattern '$pattern' is not permitted during wave execution. Pause the session to run this outside the wave if necessary."
      ;;
  esac
}
