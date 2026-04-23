#!/usr/bin/env bash
# checker.sh — POSIX wrapper for claude-md-drift-check.
#
# Usage:
#   bash checker.sh [VAULT_DIR] [--mode warn|hard|off] [--include-path <glob>]... [--skip-* ...]
#   VAULT_DIR=/path/to/vault bash checker.sh [--mode warn]
#
# Exit codes mirror checker.mjs:
#   0 — no errors, or warn mode, or skipped
#   1 — errors present and mode=hard
#   2 — invocation or infra error
#
# Output: JSON report on stdout.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER_MJS="${SCRIPT_DIR}/checker.mjs"

if [[ $# -ge 1 && -n "${1:-}" && "${1:-}" != --* ]]; then
  export VAULT_DIR="$1"
  shift
fi
: "${VAULT_DIR:=$PWD}"

if ! command -v node >/dev/null 2>&1; then
  echo '{"status":"infra-error","reason":"node not found in PATH"}' >&2
  exit 2
fi

if [[ ! -f "$CHECKER_MJS" ]]; then
  echo "{\"status\":\"infra-error\",\"reason\":\"checker.mjs not found at $CHECKER_MJS\"}" >&2
  exit 2
fi

export VAULT_DIR
exec node "$CHECKER_MJS" "$@"
