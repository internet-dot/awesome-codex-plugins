#!/usr/bin/env bash
# enforce-commands.sh — PreToolUse hook for Bash command restrictions
# Part of Session Orchestrator v2.0
#
# Reads wave-scope.json and blocks dangerous Bash commands during wave execution.
# Enforcement levels: strict (deny), warn (allow + stderr warning), off (skip).

set -euo pipefail

INPUT=$(cat)

HOOK_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$HOOK_SCRIPT_DIR/../scripts/lib/hardening.sh"

require_jq "enforce-commands"

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || TOOL_NAME=""
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null) || COMMAND=""

[[ "$TOOL_NAME" != "Bash" ]] && exit 0
[[ -z "$COMMAND" ]] && exit 0

source_platform "$HOOK_SCRIPT_DIR"
PROJECT_ROOT="${SO_PROJECT_DIR:-$(pwd)}"

SCOPE_FILE=$(find_scope_file "$PROJECT_ROOT")
[[ -z "$SCOPE_FILE" ]] && exit 0

# Per-gate toggle (#77) — skip this hook if command-guard is disabled
gate_enabled "$SCOPE_FILE" "command-guard" || exit 0

ENFORCEMENT=$(get_enforcement_level "$SCOPE_FILE")
[[ "$ENFORCEMENT" == "off" ]] && exit 0

# Check configured blocked patterns
while IFS= read -r pattern; do
  [[ -z "$pattern" ]] && continue
  if command_matches_blocked "$COMMAND" "$pattern"; then
    case "$ENFORCEMENT" in
      strict)
        SUGGESTION=$(suggest_for_command_block "$pattern")
        emit_deny "Blocked command: $pattern found in: $COMMAND" "$SUGGESTION"
        ;;
      warn)
        emit_warn "enforce-commands: blocked pattern '$pattern' found in command — proceeding (warn mode)"
        ;;
    esac
  fi
done < <(jq -r '.blockedCommands[]? // empty' "$SCOPE_FILE" 2>/dev/null)

# Fallback safety list when blockedCommands is empty
BLOCKED_COUNT=$(jq -r '.blockedCommands | length // 0' "$SCOPE_FILE" 2>/dev/null) || BLOCKED_COUNT=0
if [[ "$BLOCKED_COUNT" -eq 0 ]]; then
  for pattern in "rm -rf" "git push --force" "git reset --hard" "DROP TABLE" "git checkout -- ."; do
    if command_matches_blocked "$COMMAND" "$pattern"; then
      case "$ENFORCEMENT" in
        strict)
          SUGGESTION=$(suggest_for_command_block "$pattern")
          emit_deny "Blocked by fallback safety list: $pattern found in: $COMMAND" "$SUGGESTION"
          ;;
        warn)
          emit_warn "enforce-commands: fallback blocklist pattern '$pattern' found in command — proceeding (warn mode)"
          ;;
      esac
    fi
  done
fi

exit 0
