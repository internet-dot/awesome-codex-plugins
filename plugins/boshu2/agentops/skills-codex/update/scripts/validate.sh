#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check SKILL.md exists and has required frontmatter
if ! grep -q '^name: update' "$SKILL_DIR/SKILL.md"; then
  echo "FAIL: missing name in frontmatter"
  exit 1
fi

if grep -q '^metadata:' "$SKILL_DIR/SKILL.md" && ! grep -q '^[[:space:]]*tier:[[:space:]]*meta' "$SKILL_DIR/SKILL.md"; then
  echo "FAIL: missing tier in frontmatter"
  exit 1
fi

if ! grep -q 'scripts/install.sh' "$SKILL_DIR/SKILL.md"; then
  echo "FAIL: missing install command"
  exit 1
fi

echo "PASS: update skill validated"
