#!/usr/bin/env bash
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0

check() { if bash -c "$2"; then echo "PASS: $1"; PASS=$((PASS + 1)); else echo "FAIL: $1"; FAIL=$((FAIL + 1)); fi; }

check "SKILL.md exists" "[ -f '$SKILL_DIR/SKILL.md' ]"
check "SKILL.md has YAML frontmatter" "head -1 '$SKILL_DIR/SKILL.md' | grep -q '^---$'"
check "SKILL.md has name: rpi" "grep -q '^name: rpi' '$SKILL_DIR/SKILL.md'"
check "references/ directory exists" "[ -d '$SKILL_DIR/references' ]"
check "references/ has at least 3 files" "[ \$(ls '$SKILL_DIR/references/' | wc -l) -ge 3 ]"
check "SKILL.md mentions research phase" "grep -qi 'research' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions plan phase" "grep -qiE '/plan|plan' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions pre-mortem phase" "grep -qi 'pre-mortem' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions crank phase" "grep -qi '/crank' '$SKILL_DIR/SKILL.md'"
check "SKILL.md mentions vibe phase" "grep -qiE '/vibe|vibe' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "SKILL.md mentions post-mortem phase" "grep -qi 'post-mortem' '$SKILL_DIR/SKILL.md'"
check "RPI docs mention next-work handoff metadata" "grep -q 'queue claim/finalize metadata' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "phase-data-contracts documents claim lifecycle" "grep -q 'claim_status' '$SKILL_DIR/references/phase-data-contracts.md' && grep -q 'release the claim back to available state' '$SKILL_DIR/references/phase-data-contracts.md'"
check "gate4-loop-and-spawn documents claim before consume" "grep -q 'claim the current cycle' '$SKILL_DIR/references/gate4-loop-and-spawn.md' && grep -q 'Never mark an item consumed at pick-time' '$SKILL_DIR/references/gate4-loop-and-spawn.md'"
check "RPI docs mention repo execution profile" "grep -qi 'repo execution profile' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "RPI docs mention execution packet" "grep -qi 'execution packet' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "RPI docs mention contract_surfaces" "grep -q 'contract_surfaces' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "RPI docs mention done_criteria" "grep -q 'done_criteria' '$SKILL_DIR/SKILL.md' '$SKILL_DIR/references/phase-data-contracts.md'"
check "phase-data-contracts documents execution packet" "grep -q 'execution_packet' '$SKILL_DIR/references/phase-data-contracts.md' && grep -qi 'repo execution profile' '$SKILL_DIR/references/phase-data-contracts.md'"

echo ""; echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] && exit 0 || exit 1
