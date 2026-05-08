#!/usr/bin/env bash
# heal.sh — Detect and fix common skill hygiene issues.
# Usage: heal.sh [--check|--fix] [--strict] [skills/path ...]
# Exit 0 = clean (or findings in non-strict mode).
# Exit 1 = findings reported in --strict mode (or --fix with findings).

set -euo pipefail

MODE="check"
STRICT=0
TARGETS=()

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check)  MODE="check";  shift ;;
    --fix)    MODE="fix";    shift ;;
    --strict) STRICT=1;      shift ;;
    *)        TARGETS+=("$1"); shift ;;
  esac
done

# Find repo root (location of skills/ directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SKILLS_ROOT="$REPO_ROOT/skills"

# If no targets, scan all skill dirs
if [[ ${#TARGETS[@]} -eq 0 ]]; then
  for d in "$REPO_ROOT"/skills/*/; do
    [[ -d "$d" ]] && TARGETS+=("${d%/}")
  done
else
  # Normalize targets to absolute paths
  normalized=()
  for t in "${TARGETS[@]}"; do
    if [[ "$t" = /* ]]; then
      normalized+=("$t")
    else
      normalized+=("$REPO_ROOT/$t")
    fi
  done
  TARGETS=("${normalized[@]}")
fi

FINDINGS=0

report() {
  local code="$1" path="$2" msg="$3"
  # Show relative path from repo root
  local rel="${path#"$REPO_ROOT"/}"
  echo "[$code] $rel: $msg"
  FINDINGS=$((FINDINGS + 1))
}

# Extract YAML frontmatter value. Handles quoted and unquoted values.
get_frontmatter() {
  local file="$1" key="$2"

  # Validate frontmatter structure: file must start with --- and have a closing ---
  local first_line
  first_line="$(head -1 "$file")"
  if [[ "$first_line" != "---" ]]; then
    return 1
  fi
  if ! awk 'NR==1{next} /^---$/{found=1; exit} END{exit !found}' "$file"; then
    return 1
  fi

  # Read between first --- pair
  local in_fm=0 value=""
  while IFS= read -r line; do
    if [[ "$line" == "---" ]]; then
      if [[ $in_fm -eq 1 ]]; then break; fi
      in_fm=1
      continue
    fi
    if [[ $in_fm -eq 1 ]]; then
      # Match key at start of line (not indented = top-level)
      if [[ "$line" =~ ^${key}:\ *(.*) ]]; then
        value="${BASH_REMATCH[1]}"
        # Strip surrounding quotes
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        echo "$value"
        return 0
      fi
    fi
  done < "$file"
  return 1
}

# Check if a references/ file is linked in SKILL.md (as a proper markdown link or Read instruction)
is_linked() {
  local skill_md="$1" ref_file="$2"
  # Check for markdown link pattern [text](references/file) or Read tool pattern referencing it
  # Also accept any non-backtick reference to the file path
  local ref_basename
  ref_basename="$(basename "$ref_file")"
  # Escape dots in filename for grep regex
  local ref_basename_escaped="${ref_basename//./\\.}"
  local ref_rel="references/$ref_basename"
  # Linked = appears in a markdown link or Read instruction (not just bare backtick)
  # Allow optional suffix after filename: anchors (#section), query strings, or closing paren
  if grep -qE "\]\(references/${ref_basename_escaped}[^)]*\)" "$skill_md" 2>/dev/null; then
    return 0
  fi
  if grep -qE "Read.*references/${ref_basename_escaped}" "$skill_md" 2>/dev/null; then
    return 0
  fi
  # Also accept if referenced via a relative path in some other link form
  if grep -qE "\(references/${ref_basename_escaped}[^)]*\)" "$skill_md" 2>/dev/null; then
    return 0
  fi
  return 1
}

# Fix: add missing name field to frontmatter
fix_missing_name() {
  local file="$1" dirname="$2"
  # Insert name: after first ---
  local tmp
  tmp="$(mktemp)"
  local first_fence=0
  while IFS= read -r line; do
    echo "$line" >> "$tmp"
    if [[ "$line" == "---" && $first_fence -eq 0 ]]; then
      first_fence=1
      echo "name: $dirname" >> "$tmp"
    fi
  done < "$file"
  /bin/cp "$tmp" "$file"
  rm -f "$tmp"
}

# Fix: add missing description field to frontmatter
fix_missing_desc() {
  local file="$1" dirname="$2"
  # Insert description after name line, or after first ---
  local tmp
  tmp="$(mktemp)"
  local inserted=0 first_fence=0
  while IFS= read -r line; do
    echo "$line" >> "$tmp"
    if [[ $inserted -eq 0 ]]; then
      if [[ "$line" =~ ^name: ]]; then
        echo "description: '$dirname skill'" >> "$tmp"
        inserted=1
      elif [[ "$line" == "---" && $first_fence -eq 0 ]]; then
        first_fence=1
      elif [[ "$line" == "---" && $first_fence -eq 1 && $inserted -eq 0 ]]; then
        # Closing fence without finding name — shouldn't happen but handle it
        :
      fi
    fi
  done < "$file"
  if [[ $inserted -eq 0 ]]; then
    # Fallback: insert after first ---
    tmp2="$(mktemp)"
    first_fence=0
    while IFS= read -r line; do
      echo "$line" >> "$tmp2"
      if [[ "$line" == "---" && $first_fence -eq 0 ]]; then
        first_fence=1
        echo "description: '$dirname skill'" >> "$tmp2"
      fi
    done < "$file"
    /bin/cp "$tmp2" "$file"
    rm -f "$tmp2"
  else
    /bin/cp "$tmp" "$file"
  fi
  rm -f "$tmp"
}

# Fix: correct name mismatch
fix_name_mismatch() {
  local file="$1" dirname="$2"
  local tmp
  tmp="$(mktemp)"
  local in_fm=0
  while IFS= read -r line; do
    if [[ "$line" == "---" ]]; then
      in_fm=$((1 - in_fm))
      echo "$line" >> "$tmp"
      continue
    fi
    if [[ $in_fm -eq 1 && "$line" =~ ^name:\ * ]]; then
      echo "name: $dirname" >> "$tmp"
    else
      echo "$line" >> "$tmp"
    fi
  done < "$file"
  /bin/cp "$tmp" "$file"
  rm -f "$tmp"
}

# Fix: convert bare backtick ref to markdown link
fix_unlinked_ref() {
  local file="$1" ref_rel="$2"
  local ref_basename
  ref_basename="$(basename "$ref_rel")"
  # Replace bare `references/foo.md` with [references/foo.md](references/foo.md)
  local tmp
  tmp="$(mktemp)"
  sed "s|\`${ref_rel}\`|[${ref_rel}](${ref_rel})|g" "$file" > "$tmp"
  /bin/cp "$tmp" "$file"
  rm -f "$tmp"
}

# Process each skill directory
for skill_dir in "${TARGETS[@]}"; do
  dirname="$(basename "$skill_dir")"
  skill_md="$skill_dir/SKILL.md"

  # Check 5: Empty directory (no SKILL.md)
  if [[ ! -f "$skill_md" ]]; then
    # Only report if directory is truly empty (no files at all) or just missing SKILL.md
    if [[ -z "$(ls -A "$skill_dir" 2>/dev/null)" ]]; then
      report "EMPTY_DIR" "$skill_dir" "Directory exists but no SKILL.md"
      if [[ "$MODE" == "fix" ]]; then
        rmdir "$skill_dir" 2>/dev/null || true
      fi
    fi
    continue
  fi

  # Check 1: Missing name
  if ! name="$(get_frontmatter "$skill_md" "name")"; then
    report "MISSING_NAME" "$skill_dir" "No name field in frontmatter"
    if [[ "$MODE" == "fix" ]]; then
      fix_missing_name "$skill_md" "$dirname"
    fi
    name=""
  fi

  # Check 2: Missing description
  if ! get_frontmatter "$skill_md" "description" >/dev/null 2>&1; then
    report "MISSING_DESC" "$skill_dir" "No description field in frontmatter"
    if [[ "$MODE" == "fix" ]]; then
      fix_missing_desc "$skill_md" "$dirname"
    fi
  fi

  # Check 3: Name mismatch
  if [[ -n "$name" && "$name" != "$dirname" ]]; then
    report "NAME_MISMATCH" "$skill_dir" "Frontmatter name '$name' != directory '$dirname'"
    if [[ "$MODE" == "fix" ]]; then
      fix_name_mismatch "$skill_md" "$dirname"
    fi
  fi

  # Check 4: Unlinked references
  if [[ -d "$skill_dir/references" ]]; then
    for ref_file in "$skill_dir"/references/*.md; do
      [[ -f "$ref_file" ]] || continue
      ref_basename="$(basename "$ref_file")"
      ref_rel="references/$ref_basename"
      if ! is_linked "$skill_md" "$ref_file"; then
        report "UNLINKED_REF" "$skill_dir" "$ref_rel not linked in SKILL.md"
        if [[ "$MODE" == "fix" ]]; then
          fix_unlinked_ref "$skill_md" "$ref_rel"
        fi
      fi
    done
  fi

  # Check 6: Dead references (SKILL.md mentions references/ files that don't exist)
  # Strip fenced code blocks before scanning to avoid false positives from examples
  # Supports local (references/foo.md), shared (../shared/references/foo.md), and
  # cross-skill (../<skill>/references/foo.md) paths
  while IFS= read -r ref_path; do
    [[ -z "$ref_path" ]] && continue
    if [[ ! -f "$skill_dir/$ref_path" ]]; then
      report "DEAD_REF" "$skill_dir" "SKILL.md references non-existent $ref_path"
      if [[ "$MODE" == "fix" ]]; then
        echo "  [WARN] Cannot auto-fix DEAD_REF -- manually remove or create $ref_path"
      fi
    fi
  done < <(awk 'BEGIN{skip=0} /^```/{skip=1-skip; next} skip==0{print}' "$skill_md" | grep -oE '(\.\./[A-Za-z0-9_.-]+/)?references/[A-Za-z0-9_.-]+\.md' 2>/dev/null | sort -u || true)

  # Check 7: Script reference integrity
  # Strip fenced code blocks and URLs before scanning to avoid false positives from examples
  # URLs containing scripts/foo.sh are remote references, not local file paths
  while IFS= read -r ref; do
    [[ -z "$ref" ]] && continue
    if [[ ! -f "$skill_dir/$ref" && ! -f "$REPO_ROOT/$ref" ]]; then
      report "SCRIPT_REF_MISSING" "$skill_dir" "references $ref but file not found"
    fi
  done < <(awk 'BEGIN{skip=0} /^```/{skip=1-skip; next} skip==0{print}' "$skill_md" | sed -E 's|https?://[^[:space:]`"]*||g' | grep -oE '\bscripts/[a-zA-Z0-9_-]+\.[a-z]+' 2>/dev/null | sort -u || true)

  # Check 8: CLI command validation (prefer repo binary over PATH)
  ao_bin=""
  ao_cmds=""
  commands_md="$REPO_ROOT/cli/docs/COMMANDS.md"
  if [[ -f "$commands_md" ]]; then
    ao_cmds="$(
      grep -E '^### `ao [^`]+`' "$commands_md" 2>/dev/null \
        | sed -E 's/^### `ao ([^` ]+).*$/\1/' \
        | sort -u || true
    )"
  fi
  if [[ -z "$ao_cmds" && -x "$REPO_ROOT/cli/bin/ao" ]]; then
    ao_bin="$REPO_ROOT/cli/bin/ao"
  elif command -v ao >/dev/null 2>&1; then
    ao_bin="$(command -v ao)"
  fi
  if [[ -z "$ao_cmds" && -n "$ao_bin" ]]; then
    ao_cmds="$("$ao_bin" help 2>&1 | grep -oE '^[[:space:]]+[a-z][-a-z]*' | tr -d ' ' | sort -u || true)"
    # Guard: skip if binary produced no commands (broken build)
    [[ -z "$ao_cmds" ]] && ao_bin=""
  fi
  if [[ -n "$ao_cmds" ]]; then
    while IFS= read -r subcmd; do
      [[ -z "$subcmd" ]] && continue
      if ! echo "$ao_cmds" | grep -qx "$subcmd"; then
        report "INVALID_AO_CMD" "$skill_dir" "references 'ao $subcmd' which is not a valid subcommand"
      fi
    done < <(grep -oE '`ao [a-z][-a-z]*`' "$skill_md" 2>/dev/null | sed 's/`//g; s/^ao //' | sort -u || true)
  fi

  # Check 9: Cross-reference validation (skill invocation references)
  # Strip fenced code blocks before scanning to avoid false positives from examples
  while IFS= read -r ref; do
    [[ -z "$ref" ]] && continue
    # Skip common filesystem path false positives
    case "$ref" in
      dev|tmp|usr|bin|etc|opt|var|home|proc|sys|path|null|dev/null|skill-name) continue ;;
      agents|hooks|mcp|memory|output-style|permissions|allowed-tools|approved-tools|health|healthz|readyz|name) continue ;;
    esac
    if [[ ! -d "$SKILLS_ROOT/$ref" ]]; then
      report "DEAD_XREF" "$skill_dir" "references /$ref but skill directory not found"
    fi
  done < <(awk 'BEGIN{skip=0} /^```/{skip=1-skip; next} skip==0{print}' "$skill_md" | grep -oE '`/[a-z][-a-z]*`' 2>/dev/null | sed 's/`//g; s|^/||' | sort -u || true)

done

# Check 10: Catalog completeness (global, not per-skill)
if [[ -f "$SKILLS_ROOT/using-agentops/SKILL.md" ]]; then
  for skill_check in "$SKILLS_ROOT"/*/SKILL.md; do
    [[ -f "$skill_check" ]] || continue
    check_dir="$(dirname "$skill_check")"
    check_name="$(basename "$check_dir")"
    # Skip internal/non-invocable skills
    if grep -q 'user-invocable: false' "$skill_check" 2>/dev/null; then continue; fi
    if grep -q 'internal: true' "$skill_check" 2>/dev/null; then continue; fi
    # Check if skill appears in catalog
    if ! grep -q "$check_name" "$SKILLS_ROOT/using-agentops/SKILL.md" 2>/dev/null; then
      report "CATALOG_MISSING" "$SKILLS_ROOT/using-agentops" "$check_name is user-invocable but missing from catalog"
    fi
  done
fi

# Check 11: skill_api_version presence (global, not per-skill)
for skill_check in "$SKILLS_ROOT"/*/SKILL.md; do
  [[ -f "$skill_check" ]] || continue
  check_dir="$(dirname "$skill_check")"
  check_name="$(basename "$check_dir")"
  if ! get_frontmatter "$skill_check" "skill_api_version" >/dev/null 2>&1; then
    report "MISSING_API_VERSION" "$check_dir" "No skill_api_version field in frontmatter"
    if [[ "$MODE" == "fix" ]]; then
      # Insert skill_api_version: 1 after description: line
      tmp="$(mktemp)"
      inserted=0
      while IFS= read -r line; do
        echo "$line" >> "$tmp"
        if [[ $inserted -eq 0 && "$line" =~ ^description: ]]; then
          echo "skill_api_version: 1" >> "$tmp"
          inserted=1
        fi
      done < "$skill_check"
      /bin/cp "$tmp" "$skill_check"
      rm -f "$tmp"
    fi
  fi
done

if [[ $FINDINGS -gt 0 ]]; then
  echo ""
  echo "$FINDINGS finding(s) detected."
  if [[ $STRICT -eq 1 || "$MODE" == "fix" ]]; then
    exit 1
  fi
  exit 0
else
  echo "All clean. No findings."
  exit 0
fi
