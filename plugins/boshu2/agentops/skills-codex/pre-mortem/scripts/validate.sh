#!/usr/bin/env bash
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0

check() { if bash -c "$2"; then echo "PASS: $1"; PASS=$((PASS + 1)); else echo "FAIL: $1"; FAIL=$((FAIL + 1)); fi; }

check "SKILL.md exists" "[ -f '$SKILL_DIR/SKILL.md' ]"
check "SKILL.md has YAML frontmatter" "head -1 '$SKILL_DIR/SKILL.md' | grep -q '^---$'"
check "SKILL.md has name: pre-mortem" "grep -q '^name: pre-mortem' '$SKILL_DIR/SKILL.md'"
check "references/ directory exists" "[ -d '$SKILL_DIR/references' ]"
check "references/ has at least 3 files" "[ \$(ls '$SKILL_DIR/references/' | wc -l) -ge 3 ]"
check "SKILL.md mentions council delegation" "grep -Eq '(/|\\$)council' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions compiled pre-mortem checks" "grep -q '\.agents/pre-mortem-checks' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions finding registry fallback" "grep -q 'registry.jsonl' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions known_risks" "grep -q 'known_risks' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions dedup_key" "grep -q 'dedup_key' '$SKILL_DIR/SKILL.md'"
check "SKILL.md refreshes finding compiler after writes" "grep -q 'finding-compiler.sh' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions plan-review preset" "grep -qi 'plan-review' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions PASS/WARN/FAIL verdicts" "grep -q 'PASS.*WARN.*FAIL\|PASS | WARN | FAIL' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions .agents/council/ output path" "grep -q '\.agents/council/' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions pre-mortem report format" "grep -qi 'pre-mortem report\|Pre-Mortem:' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions --deep mode" "grep -q '\-\-deep' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions --mixed mode" "grep -q '\-\-mixed' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions --debate mode" "grep -q '\-\-debate' '$SKILL_DIR/SKILL.md'"

echo ""; echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] && exit 0 || exit 1
