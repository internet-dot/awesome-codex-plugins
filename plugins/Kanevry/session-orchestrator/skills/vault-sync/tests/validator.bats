#!/usr/bin/env bats
# validator.bats — Tests for the vault-sync Phase 1 validator.
#
# Prerequisites: brew install bats-core, jq
# Run: bats tests/validator.bats (from the vault-sync skill directory)

SCRIPT_DIR="${BATS_TEST_DIRNAME}/.."
SCRIPT="${SCRIPT_DIR}/validator.sh"
FIXTURES="${BATS_TEST_DIRNAME}/fixtures"

# ── Helpers ────────────────────────────────────────────────────────────────
get_field() {
  # get_field <json> <jq-filter>
  printf '%s' "$1" | jq -r "$2"
}

# ── Tests ──────────────────────────────────────────────────────────────────

@test "clean vault: exit 0 and status 'ok'" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
}

@test "clean vault: JSON output is valid and parseable by jq" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq . >/dev/null
}

@test "clean vault: skips README without frontmatter (files_skipped_no_frontmatter >= 1)" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  local n
  n=$(get_field "$output" '.files_skipped_no_frontmatter')
  [ "$n" -ge 1 ]
}

@test "clean vault: counts valid frontmatter files (files_checked == 3)" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  local n
  n=$(get_field "$output" '.files_checked')
  [ "$n" = "3" ]
}

@test "clean vault: excludes .obsidian/ directory" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  # If .obsidian/config.md was crawled, it would produce errors.
  local errs
  errs=$(get_field "$output" '.errors | length')
  [ "$errs" = "0" ]
}

@test "clean vault: nested directories are crawled" {
  # 03-daily/daily-2026-04-13.md and 01-projects/foo/projects-baseline.md must both be counted.
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  local n
  n=$(get_field "$output" '.files_checked')
  # Three fixture notes with frontmatter live at depths 1, 2, and 3.
  [ "$n" = "3" ]
}

@test "broken-frontmatter vault: exit 1 and status 'invalid'" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault"
  [ "$status" -eq 1 ]
  [ "$(get_field "$output" '.status')" = "invalid" ]
}

@test "broken-frontmatter vault: error mentions bad-type.md" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault"
  [ "$status" -eq 1 ]
  local hit
  hit=$(get_field "$output" '[.errors[] | select(.file | test("bad-type"))] | length')
  [ "$hit" -ge 1 ]
}

@test "broken-frontmatter vault: zod issue path is 'type'" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault"
  [ "$status" -eq 1 ]
  local path
  path=$(get_field "$output" '[.errors[] | select(.file | test("bad-type"))][0].path')
  [ "$path" = "type" ]
}

@test "missing-field vault: exit 1 with error mentioning 'id'" {
  run bash "$SCRIPT" "$FIXTURES/missing-field-vault"
  [ "$status" -eq 1 ]
  local path
  path=$(get_field "$output" '.errors[0].path')
  [ "$path" = "id" ]
}

@test "dangling-link vault: exit 0 (warnings do not fail) with dangling warning present" {
  run bash "$SCRIPT" "$FIXTURES/dangling-link-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
  local warn
  warn=$(get_field "$output" '[.warnings[] | select(.type == "dangling-wiki-link")] | length')
  [ "$warn" -ge 1 ]
}

@test "dangling-link vault: existing link target does NOT produce a warning" {
  run bash "$SCRIPT" "$FIXTURES/dangling-link-vault"
  [ "$status" -eq 0 ]
  local warn_real
  warn_real=$(get_field "$output" '[.warnings[] | select(.message | test("real-target"))] | length')
  [ "$warn_real" = "0" ]
}

@test "no vault: non-existent dir returns exit 0 and status 'skipped'" {
  run bash "$SCRIPT" "/tmp/this-dir-does-not-exist-$$-$RANDOM"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "skipped" ]
}

@test "empty vault: dir with no .md files returns status 'skipped'" {
  run bash "$SCRIPT" "$FIXTURES/empty-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "skipped" ]
}

@test "no-frontmatter vault: README-only dir exits 0 with files_skipped_no_frontmatter == 2" {
  run bash "$SCRIPT" "$FIXTURES/no-frontmatter-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
  local n
  n=$(get_field "$output" '.files_skipped_no_frontmatter')
  [ "$n" = "2" ]
  [ "$(get_field "$output" '.files_checked')" = "0" ]
}

@test "archive test vault: 90-archive/ is excluded (only live-note is checked)" {
  run bash "$SCRIPT" "$FIXTURES/archive-test-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.files_checked')" = "1" ]
  [ "$(get_field "$output" '.errors | length')" = "0" ]
}

# ── Wave 3: --mode and --exclude flags ─────────────────────────────────────

@test "mode warn: broken-frontmatter vault exits 0 but reports errors in JSON" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault" --mode warn
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
  [ "$(get_field "$output" '.mode')" = "warn" ]
  local errs
  errs=$(get_field "$output" '.errors | length')
  [ "$errs" -ge 1 ]
}

@test "mode off: broken-frontmatter vault exits 0 with status 'skipped-mode-off'" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault" --mode off
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "skipped-mode-off" ]
  [ "$(get_field "$output" '.mode')" = "off" ]
  [ "$(get_field "$output" '.errors | length')" = "0" ]
}

@test "mode hard (default): broken-frontmatter vault still exits 1 with mode='hard'" {
  run bash "$SCRIPT" "$FIXTURES/broken-frontmatter-vault" --mode hard
  [ "$status" -eq 1 ]
  [ "$(get_field "$output" '.status')" = "invalid" ]
  [ "$(get_field "$output" '.mode')" = "hard" ]
}

@test "exclude glob: with-moc-vault passes when _MOC.md is excluded" {
  run bash "$SCRIPT" "$FIXTURES/with-moc-vault" --exclude "**/_MOC.md"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
  [ "$(get_field "$output" '.excluded_count')" = "1" ]
  [ "$(get_field "$output" '.files_checked')" = "1" ]
  [ "$(get_field "$output" '.errors | length')" = "0" ]
}

@test "exclude glob: with-moc-vault WITHOUT exclusion fails (baseline)" {
  run bash "$SCRIPT" "$FIXTURES/with-moc-vault"
  [ "$status" -eq 1 ]
  [ "$(get_field "$output" '.status')" = "invalid" ]
  [ "$(get_field "$output" '.excluded_count')" = "0" ]
}

@test "exclude glob: repeatable --exclude flags accumulate" {
  run bash "$SCRIPT" "$FIXTURES/with-moc-vault" --exclude "**/_MOC.md" --exclude "**/does-not-exist.md"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.excluded_count')" = "1" ]
}

@test "JSON output always includes mode field on normal runs" {
  run bash "$SCRIPT" "$FIXTURES/clean-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.mode')" = "hard" ]
}

# ── Nested-tag (Obsidian hierarchy) tests ──────────────────────────────────

@test "nested-tag vault: exit 0 and status 'ok' in hard mode with slash-separated tags" {
  run bash "$SCRIPT" "$FIXTURES/nested-tag-vault"
  [ "$status" -eq 0 ]
  [ "$(get_field "$output" '.status')" = "ok" ]
  [ "$(get_field "$output" '.errors | length')" = "0" ]
}

@test "nested-tag vault: both files with nested tags are validated (files_checked == 2)" {
  run bash "$SCRIPT" "$FIXTURES/nested-tag-vault"
  [ "$status" -eq 0 ]
  local n
  n=$(get_field "$output" '.files_checked')
  [ "$n" = "2" ]
}
