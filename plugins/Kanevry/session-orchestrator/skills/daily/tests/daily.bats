#!/usr/bin/env bats
# daily.bats — Tests for the /daily skill generator.
#
# Prerequisites: brew install bats-core
# Run: bats tests/daily.bats (from the daily skill directory)

SCRIPT_DIR="${BATS_TEST_DIRNAME}/.."
GENERATE="${SCRIPT_DIR}/generate.sh"
VAULT_SYNC="${SCRIPT_DIR}/../vault-sync/validator.sh"

setup() {
  TMPVAULT="$(mktemp -d)"
  export TMPVAULT
}

teardown() {
  if [[ -n "${TMPVAULT:-}" && -d "$TMPVAULT" ]]; then
    rm -rf "$TMPVAULT"
  fi
}

today() {
  date +%Y-%m-%d
}

@test "creates today's file in an empty fixture vault" {
  mkdir -p "$TMPVAULT/03-daily"
  run env VAULT_DIR="$TMPVAULT" bash "$GENERATE"
  [ "$status" -eq 0 ]
  [ -f "$TMPVAULT/03-daily/$(today).md" ]
}

@test "created file contains substituted date id" {
  mkdir -p "$TMPVAULT/03-daily"
  VAULT_DIR="$TMPVAULT" bash "$GENERATE" >/dev/null
  run grep -F "id: daily-$(today)" "$TMPVAULT/03-daily/$(today).md"
  [ "$status" -eq 0 ]
}

@test "created file contains German weekday" {
  mkdir -p "$TMPVAULT/03-daily"
  VAULT_DIR="$TMPVAULT" bash "$GENERATE" >/dev/null
  # One of the seven German weekday names must appear in the H1 line.
  run grep -E "\((Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\)" "$TMPVAULT/03-daily/$(today).md"
  [ "$status" -eq 0 ]
}

@test "created file has no unreplaced placeholders" {
  mkdir -p "$TMPVAULT/03-daily"
  VAULT_DIR="$TMPVAULT" bash "$GENERATE" >/dev/null
  run grep -F '{{' "$TMPVAULT/03-daily/$(today).md"
  [ "$status" -ne 0 ]  # grep exits 1 when no match → no placeholders left
}

@test "second run is idempotent: file unchanged (hash match)" {
  mkdir -p "$TMPVAULT/03-daily"
  VAULT_DIR="$TMPVAULT" bash "$GENERATE" >/dev/null
  local hash1
  hash1=$(shasum "$TMPVAULT/03-daily/$(today).md" | awk '{print $1}')
  run env VAULT_DIR="$TMPVAULT" bash "$GENERATE"
  [ "$status" -eq 0 ]
  [[ "$output" == *"already exists"* ]]
  local hash2
  hash2=$(shasum "$TMPVAULT/03-daily/$(today).md" | awk '{print $1}')
  [ "$hash1" = "$hash2" ]
}

@test "missing 03-daily/ directory: exit 4 with clear error" {
  # $TMPVAULT exists but has no 03-daily subdir
  run env VAULT_DIR="$TMPVAULT" bash "$GENERATE"
  [ "$status" -eq 4 ]
  [[ "$output" == *"03-daily"* ]]
}

@test "missing VAULT_DIR entirely: exit 3" {
  run env VAULT_DIR="/nonexistent/path/does/not/exist-xyz" bash "$GENERATE"
  [ "$status" -eq 3 ]
}

@test "corrupt file (0 bytes) triggers re-creation" {
  mkdir -p "$TMPVAULT/03-daily"
  # Create empty target file at today's expected path
  touch "$TMPVAULT/03-daily/$(today).md"
  [ ! -s "$TMPVAULT/03-daily/$(today).md" ]
  run env VAULT_DIR="$TMPVAULT" bash "$GENERATE"
  [ "$status" -eq 0 ]
  # File must now be non-empty and have valid frontmatter
  [ -s "$TMPVAULT/03-daily/$(today).md" ]
  local first3
  first3=$(head -c 3 "$TMPVAULT/03-daily/$(today).md")
  [ "$first3" = "---" ]
}

@test "corrupt file (no frontmatter) triggers re-creation" {
  mkdir -p "$TMPVAULT/03-daily"
  # Write garbage content with no YAML frontmatter opener
  printf 'not-yaml\nsome garbage content\n' > "$TMPVAULT/03-daily/$(today).md"
  run env VAULT_DIR="$TMPVAULT" bash "$GENERATE"
  [ "$status" -eq 0 ]
  # File must now start with --- (valid frontmatter)
  local first3
  first3=$(head -c 3 "$TMPVAULT/03-daily/$(today).md")
  [ "$first3" = "---" ]
  # And must contain the expected id field
  grep -qF "id: daily-$(today)" "$TMPVAULT/03-daily/$(today).md"
}

@test "generated file validates against vault-sync schema (hard mode, exit 0)" {
  mkdir -p "$TMPVAULT/03-daily"
  VAULT_DIR="$TMPVAULT" bash "$GENERATE" >/dev/null
  run env VAULT_DIR="$TMPVAULT" bash "$VAULT_SYNC" --mode hard
  [ "$status" -eq 0 ]
  # Output is JSON with status:"ok" and no errors.
  [[ "$output" == *'"status":"ok"'* ]]
  [[ "$output" == *'"errors":[]'* ]]
}
