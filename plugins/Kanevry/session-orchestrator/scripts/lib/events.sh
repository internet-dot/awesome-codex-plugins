# events.sh — Clank Event Bus integration for session-orchestrator
# Sourced by hook scripts, not executed directly.
#
# Emits events to Clank's Event Bus at events.gotzendorfer.at.
# Graceful degradation: silently skips if CLANK_EVENT_SECRET is unset or curl is unavailable.

# Source platform detection if not already loaded
if [[ -z "${SO_PLATFORM:-}" ]]; then
  source "$(dirname "${BASH_SOURCE[0]}")/platform.sh" 2>/dev/null || true
fi

# so_emit_event — send an event to Clank's Event Bus (async, non-blocking)
#
# Usage: so_emit_event "orchestrator.session.started" '{"platform":"claude","project":"my-repo"}'
#
# Arguments:
#   $1 — event_type (required, e.g. "orchestrator.session.started")
#   $2 — payload JSON object (optional, defaults to "{}")
#
# Environment:
#   CLANK_EVENT_SECRET — Bearer token for Clank Event Bus auth (required, skip if unset)
#   CLANK_EVENT_URL    — Override event bus URL (optional, defaults to https://events.gotzendorfer.at)
so_emit_event() {
  local event_type="${1:?so_emit_event requires event_type as first argument}"
  local payload
  payload="${2:-{}}"
  local base_url="${CLANK_EVENT_URL:-https://events.gotzendorfer.at}"

  # Graceful skip: no secret → no events
  if [[ -z "${CLANK_EVENT_SECRET:-}" ]]; then
    return 0
  fi

  # Graceful skip: no curl → no events
  if ! command -v curl &>/dev/null; then
    return 0
  fi

  # Build request body with jq if available, fallback to printf
  local body
  if command -v jq &>/dev/null; then
    body=$(jq -nc \
      --arg type "$event_type" \
      --arg source "session-orchestrator" \
      --argjson payload "$payload" \
      '{"event_type":$type,"source":$source,"payload":$payload}') || return 0
  else
    body=$(printf '{"event_type":"%s","source":"session-orchestrator","payload":%s}' \
      "$event_type" "$payload")
  fi

  # Async POST — fire and forget, never block the hook
  (
    timeout 3 curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${CLANK_EVENT_SECRET}" \
      -d "$body" \
      "${base_url}/api/webhooks/events" \
      >/dev/null 2>&1
  ) &

  return 0
}
