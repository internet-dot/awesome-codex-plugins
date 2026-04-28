#!/usr/bin/env bash
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0

check() { if bash -c "$2"; then echo "PASS: $1"; PASS=$((PASS + 1)); else echo "FAIL: $1"; FAIL=$((FAIL + 1)); fi; }

check "SKILL.md exists" "[ -f '$SKILL_DIR/SKILL.md' ]"
check "SKILL.md has YAML frontmatter" "head -1 '$SKILL_DIR/SKILL.md' | grep -q '^---$'"
check "SKILL.md has name: goals" "grep -q '^name: goals' '$SKILL_DIR/SKILL.md'"
check "SKILL.md has tier: product when metadata is present" "! grep -q '^metadata:' '$SKILL_DIR/SKILL.md' || grep -q '^[[:space:]]*tier:[[:space:]]*product' '$SKILL_DIR/SKILL.md'"
check "SKILL.md documents measure mode" "grep -q '## Measure Mode' '$SKILL_DIR/SKILL.md'"
check "SKILL.md documents steer mode" "grep -q '## Steer Mode' '$SKILL_DIR/SKILL.md'"
check "SKILL.md documents prune mode" "grep -q '## Prune Mode' '$SKILL_DIR/SKILL.md'"
check "SKILL.md references GOALS.yaml" "grep -q 'GOALS.yaml' '$SKILL_DIR/SKILL.md'"
check "SKILL.md references evolve skill" "grep -Eq '(/|\\$)evolve' '$SKILL_DIR/SKILL.md'"
check "references/generation-heuristics.md exists" "[ -f '$SKILL_DIR/references/generation-heuristics.md' ]"
check "generation-heuristics has quality criteria" "grep -q 'Quality Criteria' '$SKILL_DIR/references/generation-heuristics.md'"
check "generation-heuristics has scan sources" "grep -q 'Scan Sources' '$SKILL_DIR/references/generation-heuristics.md'"

echo ""; echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] && exit 0 || exit 1
