#!/usr/bin/env bash
set -euo pipefail

SCOPE="auto"
EPIC_ID=""
COLLECTION_DETAIL=""
# Grace window (seconds) for close-before-commit evidence.
# Commits landing within this window after bead close are still considered valid.
GRACE_SECONDS=86400  # 24 hours

usage() {
  cat <<'EOF'
Usage: bash skills/post-mortem/scripts/closure-integrity-audit.sh [--scope auto|commit|staged|worktree] <epic-id>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -z "$EPIC_ID" ]]; then
        EPIC_ID="$1"
        shift
      else
        echo "Unknown arg: $1" >&2
        usage >&2
        exit 2
      fi
      ;;
  esac
done

case "$SCOPE" in
  auto|commit|staged|worktree) ;;
  *)
    echo "Invalid --scope: $SCOPE" >&2
    usage >&2
    exit 2
    ;;
esac

[[ -n "$EPIC_ID" ]] || {
  echo "epic id is required" >&2
  usage >&2
  exit 2
}

command -v jq >/dev/null 2>&1 || {
  echo "jq is required" >&2
  exit 1
}

command -v bd >/dev/null 2>&1 || {
  echo "bd is required" >&2
  exit 1
}

FILE_PATH_REGEX='([.[:alnum:]_-]+/)*[.[:alnum:]_-]+\.[[:alpha:]][[:alnum:]_-]*'

json_array_from_stream() {
  if ! sed '/^[[:space:]]*$/d' | sort -u | jq -R . | jq -s .; then
    printf '[]\n'
  fi
}

run_git_clean() {
  env -u GIT_DIR -u GIT_WORK_TREE -u GIT_COMMON_DIR git "$@"
}

regex_escape_extended() {
  printf '%s' "$1" | sed -e 's/[][(){}.^$*+?|\\-]/\\&/g'
}

bd_show_json() {
  local issue_id="$1"
  bd show "$issue_id" --json 2>/dev/null | jq -ec 'if type == "array" then .[0] // empty else . end'
}

extract_description_from_show_text() {
  awk '
    /^DESCRIPTION$/ { in_desc = 1; next }
    in_desc {
      if ($0 ~ /^(LABELS|DEPENDENCIES|DEPENDENTS|CHILDREN|COMMENTS|REFERENCES|NOTES):?[[:space:]]*$/) {
        exit
      }
      print
    }
  '
}

collect_children_from_bd_children_json() {
  local json_output
  json_output="$(bd children "$EPIC_ID" --json 2>/dev/null)" || return 1
  printf '%s\n' "$json_output" \
    | jq -er '
        .[]? |
        if type == "object" then
          (.id // .child_id // .issue_id // empty)
        elif type == "string" then
          .
        else
          empty
        end
      ' 2>/dev/null \
    | sed '/^[[:space:]]*$/d' \
    | sort -u
}

collect_children_from_bd_show_json() {
  local json_output
  json_output="$(bd show "$EPIC_ID" --json 2>/dev/null)" || return 1
  printf '%s\n' "$json_output" \
    | jq -er '
        .[]? |
        ((.dependents // .children // [])[]? |
          select((.dependency_type // .type // "parent-child") == "parent-child") |
          (.id // .child_id // .issue_id // empty))
      ' 2>/dev/null \
    | sed '/^[[:space:]]*$/d' \
    | sort -u
}

collect_children_from_human_output() {
  local human_output
  human_output="$(bd show "$EPIC_ID" 2>/dev/null)" || return 1
  printf '%s\n' "$human_output" \
    | awk '
        /^CHILDREN$/ { in_children = 1; next }
        in_children && /^[[:space:]]*$/ { exit }
        in_children { print }
      ' \
    | grep -oE '[[:alnum:]]+-[[:alnum:]]+(\.[0-9]+)+' \
    | sort -u
}

collect_children() {
  local children_output=""

  if children_output="$(collect_children_from_bd_children_json)" && [[ -n "$children_output" ]]; then
    printf '%s\n' "$children_output"
    return 0
  fi

  if children_output="$(collect_children_from_bd_show_json)" && [[ -n "$children_output" ]]; then
    printf '%s\n' "$children_output"
    return 0
  fi

  if children_output="$(collect_children_from_human_output)" && [[ -n "$children_output" ]]; then
    printf '%s\n' "$children_output"
    return 0
  fi

  COLLECTION_DETAIL="no child issues discovered from bd children/show output"
  return 1
}

extract_validation_block_from_text() {
  awk '
    /^```validation[[:space:]]*$/ { in_block = 1; next }
    in_block && /^```[[:space:]]*$/ { exit }
    in_block { print }
  '
}

extract_validation_files_from_block() {
  local validation_block="$1"

  [[ -n "$validation_block" ]] || return 0
  printf '%s\n' "$validation_block" \
    | jq -r '
        def as_items:
          if type == "array" then .[]
          else .
          end;
        (
          (.files // [])[]?,
          (.files_exist // [])[]?,
          ((.content_check // empty) | as_items | .file?),
          ((.content_checks // empty) | as_items | .file?),
          ((.paired_files // empty) | as_items | .file?)
        )
        | select(type == "string" and length > 0)
      ' 2>/dev/null || true
}

extract_file_paths_from_stream() {
  grep -oE "$FILE_PATH_REGEX" || true
}

extract_first_file_path_from_stream() {
  extract_file_paths_from_stream | head -n 1
}

extract_files_section_from_text() {
  awk '
    tolower($0) ~ /^[[:space:]]*files:[[:space:]]*$/ { in_files = 1; next }
    tolower($0) ~ /^[[:space:]]*files likely owned:[[:space:]]*$/ { in_files = 1; next }
    in_files {
      if ($0 ~ /^[[:space:]]*$/ || $0 ~ /^```/) {
        exit
      }
      if ($0 !~ /^[[:space:]]*-/) {
        exit
      }
      sub(/^[[:space:]]*-[[:space:]]*/, "", $0)
      print
    }
  ' | extract_file_paths_from_stream
}

extract_labeled_files_from_text() {
  local line=""
  local candidate=""

  while IFS= read -r line; do
    candidate=""

    if [[ "$line" =~ [Nn][Ee][Ww][[:space:]]+[Ff][Ii][Ll][Ee][Ss]?:[[:space:]]*(.*)$ ]]; then
      candidate="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ [Ff][Ii][Ll][Ee]:[[:space:]]*(.*)$ ]]; then
      candidate="${BASH_REMATCH[1]}"
    fi

    if [[ -n "$candidate" ]]; then
      printf '%s\n' "$candidate" | extract_first_file_path_from_stream
    fi
  done
}

extract_backticked_files_from_text() {
  grep -oE "\`$FILE_PATH_REGEX\`" | tr -d '`' || true
}

extract_scoped_files() {
  local child="$1"
  local description=""
  local child_json=""
  local human_output=""
  local validation_block=""

  if child_json="$(bd_show_json "$child" 2>/dev/null)"; then
    description="$(printf '%s\n' "$child_json" | jq -r '.description // ""')"
  else
    human_output="$(bd show "$child" 2>/dev/null || true)"
    description="$(printf '%s\n' "$human_output" | extract_description_from_show_text)"
  fi

  validation_block="$(printf '%s\n' "$description" | extract_validation_block_from_text)"

  {
    extract_validation_files_from_block "$validation_block"
    printf '%s\n' "$description" | extract_labeled_files_from_text
    printf '%s\n' "$description" | extract_files_section_from_text
    printf '%s\n' "$description" | extract_backticked_files_from_text
  } | sed '/^[[:space:]]*$/d' | sort -u
}

issue_timestamp() {
  local child_json="$1"
  local field="$2"
  printf '%s\n' "$child_json" | jq -r --arg field "$field" '.[$field] // empty'
}

commit_ref_exists() {
  local child="$1"
  local escaped_child
  local pattern

  escaped_child="$(regex_escape_extended "$child")"
  pattern="(^|[^[:alnum:]_.-])${escaped_child}([^[:alnum:]_.-]|$)"
  run_git_clean log --format='%H' --all --extended-regexp --grep="$pattern" 2>/dev/null | grep -q .
}

commit_matches_json() {
  local since="$1"
  local until="$2"
  shift 2
  local file
  local -a matched_files=()
  local -a git_args=(log --format=%H --all --diff-filter=ACMR)

  [[ -n "$since" ]] && git_args+=("--since=$since")
  [[ -n "$until" ]] && git_args+=("--until=$until")

  for file in "$@"; do
    if run_git_clean "${git_args[@]}" -- "$file" 2>/dev/null | grep -q .; then
      matched_files+=("$file")
    fi
  done

  if [[ "${#matched_files[@]}" -eq 0 ]]; then
    printf '[]\n'
    return 0
  fi

  printf '%s\n' "${matched_files[@]}" | json_array_from_stream
}

staged_matches_json() {
  if [[ "$#" -eq 0 ]]; then
    printf '[]\n'
    return 0
  fi
  run_git_clean diff --cached --name-only --diff-filter=ACMR -- "$@" 2>/dev/null | json_array_from_stream
}

worktree_matches_json() {
  if [[ "$#" -eq 0 ]]; then
    printf '[]\n'
    return 0
  fi

  {
    run_git_clean diff --name-only --diff-filter=ACMR -- "$@" 2>/dev/null || true
    run_git_clean ls-files --others --exclude-standard -- "$@" 2>/dev/null || true
  } | json_array_from_stream
}

child_is_closed() {
  local child_json="$1"

  printf '%s\n' "$child_json" \
    | jq -e '
        (.status // "" | ascii_downcase) == "closed" or
        ((.closed_at // "") | length > 0)
      ' >/dev/null 2>&1
}

add_grace_to_timestamp() {
  local ts="$1"
  local grace="$2"
  [[ -n "$ts" ]] || return 1
  if date -d "$ts + ${grace} seconds" -Iseconds 2>/dev/null; then
    return 0
  fi
  # macOS date fallback: strip colon from timezone offset for %z parsing
  local ts_nocolon="${ts%:*}${ts##*:}"
  local epoch
  epoch="$(date -jf '%Y-%m-%dT%H:%M:%S%z' "$ts_nocolon" '+%s' 2>/dev/null)" || {
    # Last resort: parse date portion only (loses TZ accuracy, acceptable for grace)
    epoch="$(date -jf '%Y-%m-%dT%H:%M:%S' "${ts%%[+-]*}" '+%s' 2>/dev/null)" || return 1
  }
  date -r $((epoch + grace)) '+%Y-%m-%dT%H:%M:%S+00:00' 2>/dev/null
}

packet_is_valid_for_child() {
  local packet_path="$1"
  local child="$2"

  [[ -f "$packet_path" ]] || return 1
  jq -e --arg child "$child" '
    .target_id == $child and
    (.evidence_mode | IN("commit", "staged", "worktree")) and
    (.evidence.artifacts | type == "array" and length > 0)
  ' "$packet_path" >/dev/null 2>&1
}

durable_packet_path_for_child() {
  local child="$1"
  local safe_child="${child//\//_}"

  if [[ -f ".agents/releases/evidence-only-closures/${safe_child}.json" ]]; then
    printf '.agents/releases/evidence-only-closures/%s.json\n' "$safe_child"
    return 0
  fi
  if [[ -f ".agents/council/evidence-only-closures/${safe_child}.json" ]]; then
    printf '.agents/council/evidence-only-closures/%s.json\n' "$safe_child"
    return 0
  fi
  return 1
}

packet_evidence_mode() {
  local packet_path="$1"
  jq -r '.evidence_mode' "$packet_path"
}

packet_matches_json() {
  local packet_path="$1"

  jq -c --arg path "$packet_path" '[$path, (.evidence.artifacts[]?)] | unique' "$packet_path"
}

build_child_result() {
  local child="$1"
  local scoped_json="$2"
  local mode="$3"
  local detail="$4"
  local matches_json="$5"
  local status="$6"

  jq -n \
    --arg child_id "$child" \
    --arg status "$status" \
    --arg evidence_mode "$mode" \
    --arg detail "$detail" \
    --argjson scoped_files "$scoped_json" \
    --argjson matched_files "$matches_json" \
    '{
      child_id: $child_id,
      status: $status,
      evidence_mode: $evidence_mode,
      detail: $detail,
      scoped_files: $scoped_files,
      matched_files: $matched_files
    }'
}

classify_child() {
  local child="$1"
  local child_json=""
  local human_output=""
  local created_at=""
  local closed_at=""
  local packet_path=""
  local packet_mode=""
  local scoped_json commit_json staged_json worktree_json packet_json
  local -a scoped_files=()

  if child_json="$(bd_show_json "$child" 2>/dev/null)"; then
    if ! child_is_closed "$child_json"; then
      return 0
    fi
    created_at="$(issue_timestamp "$child_json" "created_at")"
    closed_at="$(issue_timestamp "$child_json" "closed_at")"
    if [[ -z "$closed_at" ]]; then
      closed_at="$(issue_timestamp "$child_json" "updated_at")"
    fi
  else
    human_output="$(bd show "$child" 2>/dev/null || true)"
    if [[ "$human_output" != *"CLOSED"* ]]; then
      return 0
    fi
  fi

  mapfile -t scoped_files < <(extract_scoped_files "$child")
  scoped_json="$(printf '%s\n' "${scoped_files[@]}" | json_array_from_stream)"

  case "$SCOPE" in
    auto|commit)
      if commit_ref_exists "$child"; then
        build_child_result "$child" "$scoped_json" "commit" "matched child id in git history" '[]' "pass"
        return 0
      fi
      commit_json="$(commit_matches_json "$created_at" "$closed_at" "${scoped_files[@]}")"
      if echo "$commit_json" | jq -e 'length > 0' >/dev/null 2>&1; then
        build_child_result "$child" "$scoped_json" "commit" "matched scoped files in git history during issue lifetime" "$commit_json" "pass"
        return 0
      fi
      # Grace window: check for close-before-commit pattern
      if [[ -n "$closed_at" ]]; then
        local grace_until=""
        grace_until="$(add_grace_to_timestamp "$closed_at" "$GRACE_SECONDS" 2>/dev/null)" || true
        if [[ -n "$grace_until" ]]; then
          commit_json="$(commit_matches_json "$created_at" "$grace_until" "${scoped_files[@]}")"
          if echo "$commit_json" | jq -e 'length > 0' >/dev/null 2>&1; then
            build_child_result "$child" "$scoped_json" "commit" "matched scoped files in git history within grace window after close (close-before-commit)" "$commit_json" "pass"
            return 0
          fi
        fi
      fi
      if [[ "$SCOPE" == "commit" ]]; then
        if [[ "${#scoped_files[@]}" -eq 0 ]]; then
          build_child_result "$child" "$scoped_json" "none" "parser_miss: no scoped files extracted from description" '[]' "fail"
        else
          build_child_result "$child" "$scoped_json" "none" "timing_miss: scoped files found but no commit evidence (checked grace window)" '[]' "fail"
        fi
        return 0
      fi
      ;;
  esac

  if [[ "${#scoped_files[@]}" -eq 0 ]]; then
    build_child_result "$child" "$scoped_json" "none" "parser_miss: no scoped files extracted from description" '[]' "fail"
    return 0
  fi

  case "$SCOPE" in
    auto|staged)
      staged_json="$(staged_matches_json "${scoped_files[@]}")"
      if echo "$staged_json" | jq -e 'length > 0' >/dev/null 2>&1; then
        build_child_result "$child" "$scoped_json" "staged" "matched scoped files in git index" "$staged_json" "pass"
        return 0
      fi
      if [[ "$SCOPE" == "staged" ]]; then
        build_child_result "$child" "$scoped_json" "none" "timing_miss: scoped files found but no staged evidence" '[]' "fail"
        return 0
      fi
      ;;
  esac

  case "$SCOPE" in
    auto|worktree)
      worktree_json="$(worktree_matches_json "${scoped_files[@]}")"
      if echo "$worktree_json" | jq -e 'length > 0' >/dev/null 2>&1; then
        build_child_result "$child" "$scoped_json" "worktree" "matched scoped files in working tree" "$worktree_json" "pass"
        return 0
      fi
      ;;
  esac

  if packet_path="$(durable_packet_path_for_child "$child")" && packet_is_valid_for_child "$packet_path" "$child"; then
    packet_mode="$(packet_evidence_mode "$packet_path")"
    packet_json="$(packet_matches_json "$packet_path")"
    build_child_result "$child" "$scoped_json" "$packet_mode" "matched durable closure proof packet" "$packet_json" "pass"
    return 0
  fi

  build_child_result "$child" "$scoped_json" "none" "timing_miss: scoped files found but no evidence in any scope (commit/grace/staged/worktree/packet)" '[]' "fail"
}

tmp_results="$(mktemp)"
children_file="$(mktemp)"
trap 'rm -f "$tmp_results" "$children_file"' EXIT

if ! collect_children >"$children_file"; then
  jq -n \
    --arg epic_id "$EPIC_ID" \
    --arg scope "$SCOPE" \
    --arg detail "${COLLECTION_DETAIL:-failed to collect child issues}" \
    '{
      epic_id: $epic_id,
      scope: $scope,
      summary: {
        checked_children: 0,
        passed: 0,
        failed: 1,
        collection_failed: true
      },
      children: [],
      failures: [
        {
          child_id: null,
          detail: $detail
        }
      ]
    }'
  exit 1
fi

children_output="$(cat "$children_file")"
while IFS= read -r child; do
  [[ -n "$child" ]] || continue
  child_result="$(classify_child "$child")"
  [[ -n "$child_result" ]] || continue
  printf '%s\n' "$child_result" >> "$tmp_results"
done <<< "$children_output"

jq -s \
  --arg epic_id "$EPIC_ID" \
  --arg scope "$SCOPE" \
  '{
    epic_id: $epic_id,
    scope: $scope,
    summary: {
      checked_children: length,
      passed: ([.[] | select(.status == "pass")] | length),
      failed: ([.[] | select(.status == "fail")] | length),
      evidence_modes: {
        commit: ([.[] | select(.status == "pass" and .evidence_mode == "commit") | .child_id] | sort),
        staged: ([.[] | select(.status == "pass" and .evidence_mode == "staged") | .child_id] | sort),
        worktree: ([.[] | select(.status == "pass" and .evidence_mode == "worktree") | .child_id] | sort),
        packet: ([.[] | select(.status == "pass" and (.evidence_mode | IN("commit","staged","worktree") | not)) | .child_id] | sort)
      }
    },
    children: .,
    failures: [.[] | select(.status == "fail") | {child_id, detail, failure_type: (if (.detail | startswith("parser_miss")) then "parser_miss" elif (.detail | startswith("timing_miss")) then "timing_miss" else "unknown" end)}]
  }' "$tmp_results"
