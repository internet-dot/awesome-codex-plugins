#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

check() {
  if bash -c "$2"; then
    echo "PASS: $1"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $1"
    FAIL=$((FAIL + 1))
  fi
}

check "SKILL.md exists" "[ -f '$SKILL_DIR/SKILL.md' ]"
check "SKILL.md has YAML frontmatter" "head -1 '$SKILL_DIR/SKILL.md' | grep -q '^---$'"
check "SKILL.md has name: validation" "grep -q '^name: validation' '$SKILL_DIR/SKILL.md'"
check "SKILL.md wraps vibe" "grep -qF '\$vibe' '$SKILL_DIR/SKILL.md'"
check "SKILL.md wraps post-mortem" "grep -qF '\$post-mortem' '$SKILL_DIR/SKILL.md'"
check "SKILL.md wraps retro" "grep -qF '\$retro' '$SKILL_DIR/SKILL.md'"
check "SKILL.md documents validation lane budget guard" "grep -q 'Validation lane budget guard' '$SKILL_DIR/SKILL.md'"
check "SKILL.md documents expensive command policy" "grep -q 'Expensive Command Policy' '$SKILL_DIR/SKILL.md'"

echo
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]]
