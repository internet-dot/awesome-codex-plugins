#!/usr/bin/env bash
# post-edit-validate.sh — PostToolUse hook for incremental validation after Edit/Write
# Part of Session Orchestrator v2.0
#
# Runs incremental typecheck on the file that was just edited.
# This is informational only — it NEVER blocks (always exits 0).
#
# Exit codes:
#   0 — always (PostToolUse hooks are informational)

set -euo pipefail

INPUT=$(cat)

HOOK_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$HOOK_SCRIPT_DIR/../scripts/lib/hardening.sh"

# Warn mode — this is informational and must never block
if ! require_jq "post-edit-validate" warn; then
  exit 0
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || TOOL_NAME=""
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || FILE_PATH=""

[[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]] && exit 0
[[ -z "$FILE_PATH" ]] && exit 0

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

source_platform "$HOOK_SCRIPT_DIR"
PROJECT_ROOT="${SO_PROJECT_DIR:-$(pwd)}"

# Per-gate toggle (#77) — skip this hook if post-edit-validate is disabled
SCOPE_FILE=$(find_scope_file "$PROJECT_ROOT")
if [[ -n "$SCOPE_FILE" ]]; then
  gate_enabled "$SCOPE_FILE" "post-edit-validate" || exit 0
fi

REL_PATH="${FILE_PATH#"$PROJECT_ROOT"/}"

# Resolve typecheck command: config → tsgo → tsc → npx tsc
TYPECHECK_CMD=""
CONFIG_SCRIPT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-}}/scripts/parse-config.sh"
if [[ -n "${CLAUDE_PLUGIN_ROOT:-}" && -x "$CONFIG_SCRIPT" ]]; then
  TYPECHECK_CMD=$(bash "$CONFIG_SCRIPT" "typecheck-command" 2>/dev/null) || TYPECHECK_CMD=""
fi
if [[ -z "$TYPECHECK_CMD" ]]; then
  if command -v tsgo &>/dev/null; then TYPECHECK_CMD="tsgo"
  elif command -v tsc &>/dev/null; then TYPECHECK_CMD="tsc --noEmit"
  elif command -v npx &>/dev/null; then TYPECHECK_CMD="npx tsc --noEmit"
  fi
fi
if [[ -z "$TYPECHECK_CMD" ]]; then
  jq -nc --arg file "$REL_PATH" --arg reason "no typecheck command found" '{"check":"typecheck","status":"skip","file":$file,"reason":$reason}' >&2
  exit 0
fi

# Portable millisecond timestamp (macOS BSD date lacks %N)
now_ms() {
  if command -v gdate &>/dev/null; then
    gdate +%s%3N
  elif date +%s%3N 2>/dev/null | grep -qv 'N'; then
    date +%s%3N
  else
    echo "$(date +%s)000"
  fi
}

START_MS=$(now_ms)
if timeout 2 bash -c "$TYPECHECK_CMD" >/dev/null 2>&1; then
  STATUS="pass"
else
  STATUS="fail"
fi
END_MS=$(now_ms)
DURATION_MS=$(( END_MS - START_MS ))
[[ "$DURATION_MS" -lt 0 ]] && DURATION_MS=0

jq -nc --arg file "$REL_PATH" --arg status "$STATUS" --argjson ms "$DURATION_MS" '{"check":"typecheck","status":$status,"file":$file,"duration_ms":$ms}' >&2

exit 0
