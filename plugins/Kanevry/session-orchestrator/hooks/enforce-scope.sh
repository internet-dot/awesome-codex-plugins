#!/usr/bin/env bash
# enforce-scope.sh — PreToolUse hook for Edit/Write scope enforcement
# Part of Session Orchestrator v2.0
#
# Validates that Edit/Write tool calls target files within the current
# wave's allowed scope. Reads scope manifest from .claude/wave-scope.json,
# .codex/wave-scope.json, or .cursor/wave-scope.json.
#
# Exit codes:
#   0 — allow (or no scope manifest / enforcement off / path-guard disabled)
#   2 — deny (strict mode, file outside allowed paths)

set -euo pipefail

INPUT=$(cat)

HOOK_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$HOOK_SCRIPT_DIR/../scripts/lib/hardening.sh"

require_jq "enforce-scope"

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || TOOL_NAME=""
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || FILE_PATH=""

[[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]] && exit 0
[[ -z "$FILE_PATH" ]] && exit 0

source_platform "$HOOK_SCRIPT_DIR"
PROJECT_ROOT="${SO_PROJECT_DIR:-$(pwd)}"
PROJECT_ROOT=$(realpath "$PROJECT_ROOT" 2>/dev/null || echo "$PROJECT_ROOT")

SCOPE_FILE=$(find_scope_file "$PROJECT_ROOT")
[[ -z "$SCOPE_FILE" ]] && exit 0

# Per-gate toggle (#77) — skip this hook if path-guard is disabled
gate_enabled "$SCOPE_FILE" "path-guard" || exit 0

ENFORCEMENT=$(get_enforcement_level "$SCOPE_FILE")
[[ "$ENFORCEMENT" == "off" ]] && exit 0

# Resolve symlinks in file path — use directory resolution for new files that don't exist yet
FILE_DIR=$(dirname "$FILE_PATH")
FILE_BASE=$(basename "$FILE_PATH")
FILE_DIR=$(realpath "$FILE_DIR" 2>/dev/null || echo "$FILE_DIR")
FILE_PATH="$FILE_DIR/$FILE_BASE"

REL_PATH="${FILE_PATH#"$PROJECT_ROOT"/}"

# File outside project root
if [[ "$REL_PATH" == /* ]]; then
  case "$ENFORCEMENT" in
    strict)
      SUGGESTION=$(suggest_for_scope_violation "$FILE_PATH" "")
      emit_deny "File outside project root: $FILE_PATH" "$SUGGESTION"
      ;;
    warn)
      emit_warn "enforce-scope: $FILE_PATH is outside project root — proceeding (warn mode)"
      ;;
  esac
fi

# Check against allowed paths
MATCHED=false
while IFS= read -r pattern; do
  [[ -z "$pattern" ]] && continue
  if path_matches_pattern "$REL_PATH" "$pattern"; then
    MATCHED=true
    break
  fi
done < <(jq -r '.allowedPaths[]? // empty' "$SCOPE_FILE" 2>/dev/null)

if [[ "$MATCHED" == false ]]; then
  ALLOWED=$(jq -r '.allowedPaths | join(", ")' "$SCOPE_FILE" 2>/dev/null)
  case "$ENFORCEMENT" in
    strict)
      SUGGESTION=$(suggest_for_scope_violation "$REL_PATH" "$ALLOWED")
      emit_deny "Scope violation: $REL_PATH not in allowed paths [$ALLOWED]" "$SUGGESTION"
      ;;
    warn)
      emit_warn "enforce-scope: $REL_PATH not in allowed paths [$ALLOWED] — proceeding (warn mode)"
      ;;
  esac
fi

exit 0
