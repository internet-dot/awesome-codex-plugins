#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA_FILE="$SKILL_DIR/schemas/verdict.json"
RUN_ID="2026-04-12-mixed-smoke"

TMP_DIR="$(mktemp -d)"
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

COUNCIL_DIR="$TMP_DIR/.agents/council"
mkdir -p "$COUNCIL_DIR"

fail() {
    echo "FAIL: $1" >&2
    exit 1
}

write_runtime_judge() {
    local judge_id="$1"
    local verdict="$2"
    local file="$COUNCIL_DIR/${RUN_ID}-judge-${judge_id}.md"

    cat > "$file" <<EOF
# Runtime Judge $judge_id

Verdict: $verdict
Confidence: HIGH

## Finding

The mocked runtime-native judge artifact is readable by the council lead.
EOF
}

write_codex_judge() {
    local judge_id="$1"
    local verdict="$2"
    local file="$COUNCIL_DIR/${RUN_ID}-codex-${judge_id}.json"

    cat > "$file" <<EOF
{
  "verdict": "$verdict",
  "confidence": "HIGH",
  "key_insight": "The mocked Codex judge artifact is readable by the council lead.",
  "findings": [
    {
      "severity": "minor",
      "category": "test-smoke",
      "description": "Mixed-mode artifact smoke produced a Codex JSON verdict.",
      "location": ".agents/council/${RUN_ID}-codex-${judge_id}.json",
      "recommendation": "Keep the six-artifact mixed-mode contract covered without live vendor spend.",
      "fix": "Run this smoke from council validators.",
      "why": "Static docs checks cannot prove the consolidator has one artifact per requested judge.",
      "ref": "skills/council/references/cli-spawning.md",
      "id": null
    }
  ],
  "recommendation": "Pass mocked mixed-mode artifact coverage.",
  "schema_version": 4,
  "satisfaction_score": null,
  "satisfaction_breakdown": null
}
EOF
}

assert_count() {
    local label="$1"
    local expected="$2"
    shift 2
    local actual="$#"

    if [[ "$actual" -ne "$expected" ]]; then
        fail "$label count: expected $expected, got $actual"
    fi
}

write_runtime_judge 1 PASS
write_runtime_judge 2 WARN
write_runtime_judge 3 PASS

write_codex_judge 1 PASS
write_codex_judge 2 WARN
write_codex_judge 3 PASS

DEFAULT_RUN_ID="$RUN_ID"
LEADERSHIP_RUN_ID="2026-05-03-leadership-quartet-smoke"
RUN_ID="$LEADERSHIP_RUN_ID"
write_runtime_judge 1 PASS
write_runtime_judge 2 PASS
write_runtime_judge 3 WARN
write_runtime_judge 4 PASS
write_codex_judge 1 PASS
write_codex_judge 2 PASS
write_codex_judge 3 WARN
write_codex_judge 4 PASS
RUN_ID="$DEFAULT_RUN_ID"

mapfile -t runtime_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f -name "${RUN_ID}-judge-*.md" | LC_ALL=C sort)
mapfile -t codex_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f -name "${RUN_ID}-codex-*.json" | LC_ALL=C sort)
mapfile -t leadership_runtime_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f -name "${LEADERSHIP_RUN_ID}-judge-*.md" | LC_ALL=C sort)
mapfile -t leadership_codex_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f -name "${LEADERSHIP_RUN_ID}-codex-*.json" | LC_ALL=C sort)

assert_count "runtime-native judge artifact" 3 "${runtime_files[@]}"
assert_count "Codex judge artifact" 3 "${codex_files[@]}"
assert_count "leadership-quartet runtime-native judge artifact" 4 "${leadership_runtime_files[@]}"
assert_count "leadership-quartet Codex judge artifact" 4 "${leadership_codex_files[@]}"

for file in "${runtime_files[@]}" "${leadership_runtime_files[@]}"; do
    grep -q '^Verdict: ' "$file" || fail "runtime artifact missing Verdict line: $file"
    grep -q '^Confidence: ' "$file" || fail "runtime artifact missing Confidence line: $file"
done

python3 - "$SCHEMA_FILE" "${codex_files[@]}" "${leadership_codex_files[@]}" <<'PY'
import json
import pathlib
import sys

schema_path = pathlib.Path(sys.argv[1])
schema = json.loads(schema_path.read_text(encoding="utf-8"))
required = set(schema["required"])
properties = set(schema["properties"])
verdicts = set(schema["properties"]["verdict"]["enum"])
confidences = set(schema["properties"]["confidence"]["enum"])
schema_versions = set(schema["properties"]["schema_version"]["enum"])
finding_schema = schema["properties"]["findings"]["items"]
finding_required = set(finding_schema["required"])
finding_properties = set(finding_schema["properties"])
severities = set(finding_schema["properties"]["severity"]["enum"])

for raw_path in sys.argv[2:]:
    path = pathlib.Path(raw_path)
    data = json.loads(path.read_text(encoding="utf-8"))
    missing = required.difference(data)
    if missing:
        raise SystemExit(f"{path}: missing required fields: {sorted(missing)}")
    extra = set(data).difference(properties)
    if extra:
        raise SystemExit(f"{path}: extra fields: {sorted(extra)}")
    if data["verdict"] not in verdicts:
        raise SystemExit(f"{path}: invalid verdict {data['verdict']!r}")
    if data["confidence"] not in confidences:
        raise SystemExit(f"{path}: invalid confidence {data['confidence']!r}")
    if data["schema_version"] not in schema_versions:
        raise SystemExit(f"{path}: invalid schema_version {data['schema_version']!r}")
    if not isinstance(data["findings"], list) or not data["findings"]:
        raise SystemExit(f"{path}: findings must be a non-empty list")

    for index, finding in enumerate(data["findings"], start=1):
        missing_finding = finding_required.difference(finding)
        if missing_finding:
            raise SystemExit(f"{path}: finding {index} missing fields: {sorted(missing_finding)}")
        extra_finding = set(finding).difference(finding_properties)
        if extra_finding:
            raise SystemExit(f"{path}: finding {index} extra fields: {sorted(extra_finding)}")
        if finding["severity"] not in severities:
            raise SystemExit(f"{path}: finding {index} invalid severity {finding['severity']!r}")
PY

report_file="$COUNCIL_DIR/${RUN_ID}-report.md"
{
    echo "# Mixed Council Artifact Smoke"
    echo
    echo "Runtime-native judge artifacts: ${#runtime_files[@]}"
    echo "Codex judge artifacts: ${#codex_files[@]}"
    echo
    echo "## Judge Files"
    for file in "${runtime_files[@]}" "${codex_files[@]}"; do
        echo "- $(basename "$file")"
    done
} > "$report_file"

mapfile -t judge_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f \( -name "${RUN_ID}-judge-*.md" -o -name "${RUN_ID}-codex-*.json" \) | LC_ALL=C sort)
assert_count "total mixed judge artifact" 6 "${judge_files[@]}"
mapfile -t leadership_judge_files < <(find "$COUNCIL_DIR" -maxdepth 1 -type f \( -name "${LEADERSHIP_RUN_ID}-judge-*.md" -o -name "${LEADERSHIP_RUN_ID}-codex-*.json" \) | LC_ALL=C sort)
assert_count "total leadership-quartet mixed judge artifact" 8 "${leadership_judge_files[@]}"

grep -q 'Runtime-native judge artifacts: 3' "$report_file" || fail "report did not read runtime artifact count"
grep -q 'Codex judge artifacts: 3' "$report_file" || fail "report did not read Codex artifact count"

echo "PASS: mocked --mixed artifact smoke produced and read 3 runtime-native + 3 Codex judge artifacts plus 4+4 leadership-quartet artifacts"
