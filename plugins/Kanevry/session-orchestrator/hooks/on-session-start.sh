#!/usr/bin/env bash
# on-session-start.sh — SessionStart hook for Clank Event Bus notification
# Part of Session Orchestrator v2.0
#
# Emits orchestrator.session.started event to Clank's Event Bus.
# Gracefully skips if CLANK_EVENT_SECRET is not configured.
#
# Exit codes:
#   0 — always (informational, never blocking)

set -euo pipefail

# Source event bus library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../scripts/lib/events.sh" 2>/dev/null || {
  if [[ -n "${CLAUDE_PLUGIN_ROOT:-}" ]]; then
    source "$CLAUDE_PLUGIN_ROOT/scripts/lib/events.sh" 2>/dev/null || exit 0
  elif [[ -n "${CODEX_PLUGIN_ROOT:-}" ]]; then
    source "$CODEX_PLUGIN_ROOT/scripts/lib/events.sh" 2>/dev/null || exit 0
  else
    exit 0
  fi
}

# Build payload
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

PAYLOAD=$(jq -nc \
  --arg platform "${SO_PLATFORM:-unknown}" \
  --arg project "$PROJECT_NAME" \
  --arg branch "$BRANCH" \
  '{"platform":$platform,"project":$project,"branch":$branch}' 2>/dev/null) || PAYLOAD='{}'

so_emit_event "orchestrator.session.started" "$PAYLOAD"

exit 0
