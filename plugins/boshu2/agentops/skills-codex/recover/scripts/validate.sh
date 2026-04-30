#!/usr/bin/env bash
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0

check() { if bash -c "$2"; then echo "PASS: $1"; PASS=$((PASS + 1)); else echo "FAIL: $1"; FAIL=$((FAIL + 1)); fi; }

check "SKILL.md exists" "[ -f '$SKILL_DIR/SKILL.md' ]"
check "SKILL.md has YAML frontmatter" "head -1 '$SKILL_DIR/SKILL.md' | grep -q '^---$'"
check "SKILL.md has name: recover" "grep -q '^name: recover' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions compaction" "grep -qi 'compaction' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions context recovery" "grep -qi 'context.*recovery\|recovery.*context\|recover.*context' '$SKILL_DIR/SKILL.md'"
check "SKILL.md has tier: session when metadata is present" "! grep -q '^metadata:' '$SKILL_DIR/SKILL.md' || grep -q '^[[:space:]]*tier:[[:space:]]*session' '$SKILL_DIR/SKILL.md'"

echo ""; echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] && exit 0 || exit 1
