#!/usr/bin/env bash
# build.sh — skill-builder mode dispatcher
# Usage:
#   build.sh from-scratch <skill-name>
#   build.sh from-template <skill-name> --like <existing-skill>
#   build.sh absorb-external <skill-name> --from <path-to-external-SKILL.md>
#   build.sh from-pattern   # alpha: passthrough to ao flywheel close-loop
#
# Always runs skill-auditor on the new skill as a self-check before declaring success.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
INIT_SH="$SCRIPT_DIR/init.sh"
AUDITOR_SH="$REPO_ROOT/skills/skill-auditor/scripts/audit.sh"

usage() {
  cat <<EOF
Usage:
  $0 from-scratch <skill-name>
  $0 from-template <skill-name> --like <existing-skill>
  $0 absorb-external <skill-name> --from <path-to-external-SKILL.md>
  $0 from-pattern    # alpha: passthrough to ao flywheel close-loop

Modes:
  from-scratch     Interactive scaffold from canonical template
  from-template    Copy structure from a sibling skill
  absorb-external  Wrap an external SKILL.md in AgentOps frontmatter
  from-pattern     ALPHA — delegates to 'ao flywheel close-loop'.
                   Outputs at .agents/knowledge/promoted/, NOT shaped as SKILL.md drafts.
                   Use from-scratch or absorb-external for SKILL.md output today.
EOF
  exit 2
}

[[ $# -lt 1 ]] && usage

MODE="$1"
shift

case "$MODE" in
  from-pattern)
    # Alpha passthrough — explicitly documented in SKILL.md
    echo "[skill-builder] from-pattern is ALPHA — delegating to 'ao flywheel close-loop'"
    echo "[skill-builder] Output will NOT be a SKILL.md draft; it lands at .agents/knowledge/promoted/"
    exec ao flywheel close-loop "$@"
    ;;

  from-scratch)
    [[ $# -lt 1 ]] && { echo "Error: from-scratch requires <skill-name>" >&2; usage; }
    SKILL_NAME="$1"; shift
    bash "$INIT_SH" --interactive "$SKILL_NAME" "$@"
    ;;

  from-template)
    [[ $# -lt 1 ]] && { echo "Error: from-template requires <skill-name>" >&2; usage; }
    SKILL_NAME="$1"; shift
    bash "$INIT_SH" --like-flag-mode "$SKILL_NAME" "$@"
    ;;

  absorb-external)
    [[ $# -lt 1 ]] && { echo "Error: absorb-external requires <skill-name>" >&2; usage; }
    SKILL_NAME="$1"; shift
    bash "$INIT_SH" --absorb "$SKILL_NAME" "$@"
    ;;

  *)
    echo "Error: unknown mode '$MODE'" >&2
    usage
    ;;
esac

# Post-build self-audit (mandatory per Critical Constraints)
NEW_SKILL_DIR="$REPO_ROOT/skills/$SKILL_NAME"
if [[ ! -d "$NEW_SKILL_DIR" ]]; then
  echo "[skill-builder] ERROR: expected $NEW_SKILL_DIR to exist after init.sh" >&2
  exit 1
fi

if [[ -x "$AUDITOR_SH" ]]; then
  echo ""
  echo "[skill-builder] Running self-audit on $NEW_SKILL_DIR..."
  if bash "$AUDITOR_SH" "$NEW_SKILL_DIR"; then
    echo "[skill-builder] Self-audit PASS or WARN — build complete"
  else
    echo "[skill-builder] Self-audit FAIL — build aborted" >&2
    exit 1
  fi
else
  echo "[skill-builder] WARN: skill-auditor not found at $AUDITOR_SH; skipping self-audit" >&2
fi
