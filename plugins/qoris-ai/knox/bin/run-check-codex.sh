#!/usr/bin/env bash
# Codex hook entry — analogous to run-check.sh / run-check-cursor.sh.
# Codex injects PLUGIN_ROOT (and CLAUDE_PLUGIN_ROOT for Claude-Code compat) into the hook env.
PLUGIN_ROOT="${KNOX_ROOT:-${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}}}"
exec node "$PLUGIN_ROOT/bin/knox-check-codex"
