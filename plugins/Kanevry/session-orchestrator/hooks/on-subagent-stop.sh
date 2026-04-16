#!/usr/bin/env bash
# on-subagent-stop.sh — SubagentStop hook for agent metrics
# Part of Session Orchestrator v2.0
#
# Logs a subagent_stop event to session metrics when a subagent completes.
# Extracts agent name from hook input JSON.
#
# Exit codes:
#   0 — always (informational, never blocking)

set -euo pipefail

# Source event bus library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../scripts/lib/events.sh" 2>/dev/null || true

# Read full stdin
INPUT=$(cat)

# Check jq available — graceful degradation
if ! command -v jq &>/dev/null; then
  exit 0
fi

# Find project root
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

# Extract agent name from input
AGENT=$(echo "$INPUT" | jq -r '.agent_name // "unknown"' 2>/dev/null) || AGENT="unknown"

# Ensure metrics directory exists
METRICS_DIR="$PROJECT_ROOT/.orchestrator/metrics"
mkdir -p "$METRICS_DIR"

# Log subagent stop event
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
jq -nc --arg ts "$TIMESTAMP" --arg agent "$AGENT" \
  '{"event":"subagent_stop","timestamp":$ts,"agent":$agent}' \
  >> "$METRICS_DIR/events.jsonl"

# Emit event to Clank Event Bus
AGENT_PAYLOAD=$(jq -nc --arg agent "$AGENT" '{"agent":$agent}' 2>/dev/null) || AGENT_PAYLOAD='{}'
so_emit_event "orchestrator.agent.stopped" "$AGENT_PAYLOAD" 2>/dev/null || true

exit 0
