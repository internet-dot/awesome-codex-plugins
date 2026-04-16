#!/usr/bin/env bash
set -euo pipefail

# MCP stdio server for session-orchestrator
# Speaks JSON-RPC 2.0 over stdin/stdout
#
# Exposes two read-only tools:
#   - session_config  — reads Session Config from project CLAUDE.md
#   - session_metrics — reads last 5 session metrics entries

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

respond() {
  local id="$1" result="$2"
  printf '{"jsonrpc":"2.0","id":%s,"result":%s}\n' "$id" "$result"
}

respond_error() {
  local id="$1" code="$2" msg="$3"
  printf '{"jsonrpc":"2.0","id":%s,"error":{"code":%s,"message":%s}}\n' \
    "$id" "$code" "$(printf '%s' "$msg" | jq -Rs .)"
}

text_content() {
  local text="$1"
  jq -nc --arg t "$text" '{"content":[{"type":"text","text":$t}]}'
}

# ---------------------------------------------------------------------------
# Verify jq is available (fatal — we cannot parse JSON without it)
# ---------------------------------------------------------------------------
if ! command -v jq >/dev/null 2>&1; then
  # Emit a single error and exit; without jq we cannot operate
  printf '{"jsonrpc":"2.0","id":null,"error":{"code":-32603,"message":"jq is required but not found in PATH"}}\n'
  exit 1
fi

# ---------------------------------------------------------------------------
# Protocol handlers
# ---------------------------------------------------------------------------

handle_initialize() {
  local id="$1"
  local result
  result=$(jq -nc '{
    "protocolVersion": "2024-11-05",
    "capabilities": {"tools": {}},
    "serverInfo": {
      "name": "session-orchestrator",
      "version": "2.0.0-beta.5"
    }
  }')
  respond "$id" "$result"
}

handle_tools_list() {
  local id="$1"
  local result
  result=$(jq -nc '{
    "tools": [
      {
        "name": "session_config",
        "description": "Reads Session Config section from the project CLAUDE.md",
        "inputSchema": {"type": "object", "properties": {}, "required": []}
      },
      {
        "name": "session_metrics",
        "description": "Reads the last 5 session metrics entries from .orchestrator/metrics/sessions.jsonl",
        "inputSchema": {"type": "object", "properties": {}, "required": []}
      }
    ]
  }')
  respond "$id" "$result"
}

handle_tools_call() {
  local id="$1" line="$2"

  local tool_name
  tool_name=$(printf '%s' "$line" | jq -r '.params.name // empty' 2>/dev/null) || true

  case "$tool_name" in
    session_config)
      tool_session_config "$id"
      ;;
    session_metrics)
      tool_session_metrics "$id"
      ;;
    *)
      respond_error "$id" -32602 "Unknown tool: $tool_name"
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

tool_session_config() {
  local id="$1"
  local project_root
  project_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
    respond "$id" "$(text_content "Error: not inside a git repository")"
    return
  }

  local claude_md="$project_root/CLAUDE.md"
  if [[ ! -f "$claude_md" ]]; then
    respond "$id" "$(text_content "No CLAUDE.md found at $claude_md")"
    return
  fi

  # Extract everything from "## Session Config" to the next heading or EOF
  local config
  config=$(sed -n '/^## Session Config$/,/^## /{/^## Session Config$/d;/^## /d;p;}' "$claude_md" 2>/dev/null) || true

  if [[ -z "$config" ]]; then
    respond "$id" "$(text_content "No '## Session Config' section found in CLAUDE.md")"
    return
  fi

  respond "$id" "$(text_content "$config")"
}

tool_session_metrics() {
  local id="$1"
  local project_root
  project_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
    respond "$id" "$(text_content "Error: not inside a git repository")"
    return
  }

  local metrics_file="$project_root/.orchestrator/metrics/sessions.jsonl"
  if [[ ! -f "$metrics_file" ]]; then
    metrics_file="$project_root/.claude/metrics/sessions.jsonl"
  fi
  if [[ ! -f "$metrics_file" ]]; then
    respond "$id" "$(text_content "No metrics found (checked .orchestrator/metrics/ and .claude/metrics/)")"
    return
  fi

  local entries
  entries=$(tail -n 5 "$metrics_file" 2>/dev/null) || true

  if [[ -z "$entries" ]]; then
    respond "$id" "$(text_content "No metrics found (file is empty)")"
    return
  fi

  respond "$id" "$(text_content "$entries")"
}

# ---------------------------------------------------------------------------
# Main loop — read JSON-RPC messages from stdin, one per line
# ---------------------------------------------------------------------------

while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  method=$(printf '%s' "$line" | jq -r '.method // empty' 2>/dev/null) || continue
  id=$(printf '%s' "$line" | jq -r '.id // empty' 2>/dev/null) || true

  case "$method" in
    initialize)
      handle_initialize "$id"
      ;;
    notifications/*)
      # Notifications require no response
      ;;
    tools/list)
      handle_tools_list "$id"
      ;;
    tools/call)
      handle_tools_call "$id" "$line"
      ;;
    *)
      respond_error "${id:-null}" -32601 "Method not found: $method"
      ;;
  esac
done
