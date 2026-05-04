#!/usr/bin/env bash
set -euo pipefail

# Council Validation - Packet structure, config, and output checks
# Validates council output directory contents and SKILL.md references
#
# Usage: validate-council.sh [council-output-dir]
# Exit 0 on pass, non-zero on failure

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SKILL_DIR/../.." && pwd)"

# Validate output directory argument to prevent argument injection
OUTPUT_DIR="${1:-.agents/council}"
if [[ "$OUTPUT_DIR" =~ ^-+ ]]; then
    echo "Error: OUTPUT_DIR cannot start with a dash (prevents argument injection)" >&2
    exit 1
fi

PASS=0
FAIL=0
WARN=0

pass() {
    echo "PASS: $1"
    PASS=$((PASS + 1))
}

fail() {
    echo "FAIL: $1"
    FAIL=$((FAIL + 1))
}

warn() {
    echo "WARN: $1"
    WARN=$((WARN + 1))
}

# ── Section 1: SKILL.md structural checks ──────────────────────────

echo "=== SKILL.md Structure ==="

if [[ -f "$SKILL_DIR/SKILL.md" ]]; then
    pass "SKILL.md exists"
else
    fail "SKILL.md missing"
fi

if head -1 "$SKILL_DIR/SKILL.md" 2>/dev/null | grep -q '^---$'; then
    pass "SKILL.md has YAML frontmatter"
else
    fail "SKILL.md missing YAML frontmatter"
fi

# ── Section 2: Reference file reachability ──────────────────────────

echo ""
echo "=== Reference File Reachability ==="

# Extract all references/ paths mentioned in SKILL.md
REFERENCED_FILES=$(grep -oE 'references/[a-zA-Z0-9_-]+\.md' "$SKILL_DIR/SKILL.md" 2>/dev/null | sort -u || true)

if [[ -z "$REFERENCED_FILES" ]]; then
    warn "No reference files mentioned in SKILL.md"
else
    while IFS= read -r ref; do
        ref_path="$SKILL_DIR/$ref"
        if [[ -f "$ref_path" ]]; then
            pass "Referenced file exists: $ref"
        else
            fail "Referenced file missing: $ref (mentioned in SKILL.md)"
        fi
    done <<< "$REFERENCED_FILES"
fi

# Check for orphaned reference files (exist on disk but not mentioned in SKILL.md)
if [[ -d "$SKILL_DIR/references" ]]; then
    for ref_file in "$SKILL_DIR"/references/*.md; do
        [[ -f "$ref_file" ]] || continue
        ref_basename="references/$(basename "$ref_file")"
        if echo "$REFERENCED_FILES" | grep -qF "$ref_basename"; then
            pass "Reference file reachable from SKILL.md: $ref_basename"
        else
            warn "Orphaned reference file (not mentioned in SKILL.md): $ref_basename"
        fi
    done
fi

# ── Section 3: Files referenced in SKILL.md that should exist ──────

echo ""
echo "=== External File References ==="

# Check schemas referenced in SKILL.md
SCHEMA_REFS=$(grep -oE 'schemas/[a-zA-Z0-9_-]+\.json' "$SKILL_DIR/SKILL.md" 2>/dev/null | sort -u || true)
if [[ -n "$SCHEMA_REFS" ]]; then
    while IFS= read -r schema; do
        schema_path="$SKILL_DIR/$schema"
        if [[ -f "$schema_path" ]]; then
            pass "Schema file exists: $schema"
        else
            fail "Schema file missing: $schema (referenced in SKILL.md)"
        fi
    done <<< "$SCHEMA_REFS"
fi

# Check skill cross-references (skills/*/SKILL.md)
SKILL_REFS=$(grep -oE 'skills/[a-zA-Z0-9_-]+/SKILL\.md' "$SKILL_DIR/SKILL.md" 2>/dev/null | sort -u || true)
if [[ -n "$SKILL_REFS" ]]; then
    while IFS= read -r skill_ref; do
        skill_path="$REPO_ROOT/$skill_ref"
        if [[ -f "$skill_path" ]]; then
            pass "Cross-referenced skill exists: $skill_ref"
        else
            fail "Cross-referenced skill missing: $skill_ref"
        fi
    done <<< "$SKILL_REFS"
fi

# ── Section 4: Judge count by mode ─────────────────────────────────

echo ""
echo "=== Judge Count Validation ==="

# Validate documented judge counts against SKILL.md mode table
# Expected: default=2, --deep=3, --mixed=3+3=6
SKILL_CONTENT=$(cat "$SKILL_DIR/SKILL.md" 2>/dev/null || true)

# Check default mode documents 2 agents
if echo "$SKILL_CONTENT" | grep -qE 'default.*\|.*2.*\|'; then
    pass "Default mode documents 2 judges"
else
    fail "Default mode should document 2 judges"
fi

# Check --deep mode documents 3 agents
if echo "$SKILL_CONTENT" | grep -qE '\-\-deep.*\|.*3.*\|'; then
    pass "--deep mode documents 3 judges"
else
    fail "--deep mode should document 3 judges"
fi

# Check --mixed mode documents the judge count (legacy "3+3" or new "2N (default N=3)")
if echo "$SKILL_CONTENT" | grep -qE '\-\-mixed.*\|.*(3\+3|2N)'; then
    pass "--mixed mode documents judge count (3+3 or 2N)"
else
    fail "--mixed mode should document judge count as 3+3 or 2N (default N=3)"
fi

# Check --mixed mode documents symmetric per-vendor persona pairing.
MIXED_CONTEXT=$(echo "$SKILL_CONTENT" | awk '/^\| `--mixed`/{flag=1; ctx=0} flag && ctx<12{print; ctx++}')
if echo "$SKILL_CONTENT$MIXED_CONTEXT" | grep -qiE 'same.*perspectives?.*(both|claude.*codex|two.*vendors)|paired per perspective|symmetric.*pairing'; then
    pass "--mixed mode documents symmetric persona pairing"
else
    fail "--mixed mode should document symmetric persona pairing (same N perspectives applied to both vendors)"
fi

# ── Section 5: Output file naming convention ────────────────────────

echo ""
echo "=== Output File Naming Convention ==="

# Expected pattern: YYYY-MM-DD-<type>-<target>.md
# Per SKILL.md: .agents/council/YYYY-MM-DD-<type>-<target>.md
NAMING_PATTERN='YYYY-MM-DD-<type>-<target>'
if echo "$SKILL_CONTENT" | grep -qF "$NAMING_PATTERN"; then
    pass "Naming convention documented: $NAMING_PATTERN"
else
    fail "Naming convention not documented in SKILL.md"
fi

# If the output directory exists, validate actual files match the convention
if [[ -d "$REPO_ROOT/$OUTPUT_DIR" ]]; then
    BAD_NAMES=0
    CHECKED_FILES=0
    for council_file in "$REPO_ROOT/$OUTPUT_DIR"/*.md; do
        [[ -f "$council_file" ]] || continue
        fname=$(basename "$council_file")
        CHECKED_FILES=$((CHECKED_FILES + 1))

        # Validate: YYYY-MM-DD-<type>-<target>.md
        # Core council types: validate, brainstorm, research, quick
        # Wrapper skill types: vibe, pre-mortem, postmortem, council (from wrapper skills)
        # Suffixes: optional -<vendor>-<perspective-or-id> for per-judge files
        #           optional -report for consolidated reports
        #           optional -judge-N for numbered judges
        VALID_TYPES="validate|brainstorm|research|quick|vibe|pre-mortem|postmortem|council|analyze|beads|consistency|final|justify|native|release|skills|codex|debate|adoption"
        if [[ "$fname" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-zA-Z0-9_-]+\.md$ ]]; then
            # Broad date-prefixed naming accepted; strict type check is a warning
            if [[ "$fname" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(${VALID_TYPES})-[a-zA-Z0-9_-]+\.md$ ]]; then
                pass "File matches naming convention: $fname"
            else
                warn "File is date-prefixed but uses non-standard type: $fname"
            fi
        else
            fail "File does not match naming convention (missing YYYY-MM-DD prefix): $fname"
            BAD_NAMES=$((BAD_NAMES + 1))
        fi
    done

    if [[ $CHECKED_FILES -eq 0 ]]; then
        warn "No .md files found in $OUTPUT_DIR to validate"
    fi
else
    warn "Output directory $OUTPUT_DIR does not exist (skipping file name checks)"
fi

# ── Section 6: Perspective uniqueness ───────────────────────────────

echo ""
echo "=== Perspective Uniqueness ==="

# Check that built-in presets define unique perspectives
if [[ -f "$SKILL_DIR/references/personas.md" ]]; then
    # Extract perspective names from personas.md (lines starting with ### or | name |)
    PERSPECTIVES=$(grep -E '^\| \*\*' "$SKILL_DIR/references/personas.md" 2>/dev/null | \
        sed 's/| \*\*\([^*]*\)\*\*.*/\1/' | sort || true)

    if [[ -n "$PERSPECTIVES" ]]; then
        UNIQUE_PERSPECTIVES=$(echo "$PERSPECTIVES" | sort -u)
        TOTAL=$(echo "$PERSPECTIVES" | wc -l | tr -d ' ')
        UNIQUE=$(echo "$UNIQUE_PERSPECTIVES" | wc -l | tr -d ' ')

        if [[ "$TOTAL" -eq "$UNIQUE" ]]; then
            pass "All $TOTAL perspective names in personas.md are unique"
        else
            DUPES=$(echo "$PERSPECTIVES" | sort | uniq -d)
            fail "Duplicate perspectives found in personas.md: $DUPES"
        fi
    else
        warn "Could not extract perspective names from personas.md"
    fi

    # Check presets.md for duplicate perspectives within each preset
    if [[ -f "$SKILL_DIR/references/presets.md" ]]; then
        PRESET_SECTIONS=$(grep -n '^### ' "$SKILL_DIR/references/presets.md" 2>/dev/null || true)
        if [[ -n "$PRESET_SECTIONS" ]]; then
            pass "Presets reference file exists with sections"
        else
            warn "No preset sections found in presets.md"
        fi
    else
        warn "presets.md not found (perspective preset validation skipped)"
    fi
else
    warn "personas.md not found (perspective uniqueness check skipped)"
fi

# If output directory has council files, check for duplicate perspectives in packets
if [[ -d "$REPO_ROOT/$OUTPUT_DIR" ]]; then
    for council_file in "$REPO_ROOT/$OUTPUT_DIR"/*.md; do
        [[ -f "$council_file" ]] || continue
        # Extract perspective assignments from council reports
        ASSIGNED=$(grep -oE 'Perspective:.*' "$council_file" 2>/dev/null | \
            sed 's/Perspective: *//' | sort || true)
        if [[ -n "$ASSIGNED" ]]; then
            fname=$(basename "$council_file")
            TOTAL_P=$(echo "$ASSIGNED" | wc -l | tr -d ' ')
            UNIQUE_P=$(echo "$ASSIGNED" | sort -u | wc -l | tr -d ' ')
            if [[ "$TOTAL_P" -eq "$UNIQUE_P" ]]; then
                pass "No duplicate perspectives in $fname"
            else
                DUPES_P=$(echo "$ASSIGNED" | sort | uniq -d)
                fail "Duplicate perspective assignment in $fname: $DUPES_P"
            fi
        fi
    done
fi

# ── Section 7: Consensus rules documented ──────────────────────────

echo ""
echo "=== Consensus Rules ==="

if echo "$SKILL_CONTENT" | grep -q 'All PASS.*PASS'; then
    pass "Consensus rule: All PASS -> PASS documented"
else
    fail "Missing consensus rule: All PASS -> PASS"
fi

if echo "$SKILL_CONTENT" | grep -q 'Any FAIL.*FAIL'; then
    pass "Consensus rule: Any FAIL -> FAIL documented"
else
    fail "Missing consensus rule: Any FAIL -> FAIL"
fi

if echo "$SKILL_CONTENT" | grep -qE 'Mixed.*WARN|DISAGREE'; then
    pass "Consensus rule: Mixed/disagreement handling documented"
else
    fail "Missing consensus rule: disagreement handling"
fi

# ── Summary ─────────────────────────────────────────────────────────

echo ""
echo "=== Summary ==="
echo ""
echo "| Result | Count |"
echo "|--------|-------|"
echo "| PASS   | $PASS |"
echo "| FAIL   | $FAIL |"
echo "| WARN   | $WARN |"
echo ""

if [[ $FAIL -gt 0 ]]; then
    echo "Status: FAILED ($FAIL failures)"
    exit 1
elif [[ $WARN -gt 0 ]]; then
    echo "Status: PASS with warnings ($WARN warnings)"
    exit 0
else
    echo "Status: PASS (all checks passed)"
    exit 0
fi
