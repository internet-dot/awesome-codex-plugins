# Harvest Next Work — Implementation Details

## Schema Validation

Before writing, validate each harvested item against the tracked schema
contract in [../../../docs/contracts/next-work.schema.md](../../../docs/contracts/next-work.schema.md):

```bash
validate_next_work_item() {
  local item="$1"
  local title=$(echo "$item" | jq -r '.title // empty')
  local type=$(echo "$item" | jq -r '.type // empty')
  local severity=$(echo "$item" | jq -r '.severity // empty')
  local source=$(echo "$item" | jq -r '.source // empty')
  local description=$(echo "$item" | jq -r '.description // empty')

  # Required fields
  if [ -z "$title" ] || [ -z "$description" ]; then
    echo "SCHEMA VALIDATION FAILED: missing title or description for item"
    return 1
  fi

  # Type enum validation
  case "$type" in
    tech-debt|improvement|pattern-fix|process-improvement|feature|bug|task|docs|chore) ;;
    *) echo "SCHEMA VALIDATION FAILED: invalid type '$type' for item '$title'"; return 1 ;;
  esac

  # Severity enum validation
  case "$severity" in
    high|medium|low) ;;
    *) echo "SCHEMA VALIDATION FAILED: invalid severity '$severity' for item '$title'"; return 1 ;;
  esac

  # Source enum validation
  case "$source" in
    council-finding|retro-learning|retro-pattern|evolve-generator|feature-suggestion|backlog-processing|post-mortem-finding|manifest-classification|dream-degraded) ;;
    *) echo "SCHEMA VALIDATION FAILED: invalid source '$source' for item '$title'"; return 1 ;;
  esac

  return 0
}

# Validate each item; drop invalid items (do NOT block the entire harvest)
VALID_ITEMS=()
INVALID_COUNT=0
for item in "${HARVESTED_ITEMS[@]}"; do
  if validate_next_work_item "$item"; then
    VALID_ITEMS+=("$item")
  else
    INVALID_COUNT=$((INVALID_COUNT + 1))
  fi
done
echo "Schema validation: ${#VALID_ITEMS[@]}/$((${#VALID_ITEMS[@]} + INVALID_COUNT)) items passed"
```

## Write to next-work.jsonl

Canonical path: `.agents/rpi/next-work.jsonl`

```bash
mkdir -p .agents/rpi

# Resolve current repo name for target_repo default
CURRENT_REPO=$(bd config --get prefix 2>/dev/null \
  || basename "$(git remote get-url origin 2>/dev/null)" .git 2>/dev/null \
  || basename "$(pwd)")

# Normalize each validated item before writing:
#   process-improvement → "*" (applies across all repos)
#   all other types     → CURRENT_REPO (scoped to this repo)
for i in "${!VALID_ITEMS[@]}"; do
  item="${VALID_ITEMS[$i]}"
  item_type=$(echo "$item" | jq -r '.type')
  if [ "$item_type" = "process-improvement" ]; then
    VALID_ITEMS[$i]=$(echo "$item" | jq -c '.target_repo = "*"')
  else
    VALID_ITEMS[$i]=$(echo "$item" | jq -c --arg repo "$CURRENT_REPO" '.target_repo = $repo')
  fi
done

# Append one entry per epic (schema v1.4: docs/contracts/next-work.schema.md)
# Only include VALID_ITEMS that passed schema validation
# Each item: {title, type, severity, source, description, evidence, target_repo}
# Entry aggregate fields: source_epic, timestamp, items[], consumed: false,
#   claim_status: "available", claimed_by: null, claimed_at: null,
#   consumed_by: null, consumed_at: null
# Item lifecycle fields are optional on write and are populated by consumers:
#   claim_status, claimed_by, claimed_at, consumed, consumed_by, consumed_at, failed_at
# Consumers may rewrite existing lines to claim, release, fail, or consume
# existing items. The queue is not append-only after initial write.
```

Append a single JSON line to `.agents/rpi/next-work.jsonl` with:
- `source_epic`: the epic ID being post-mortemed
- `timestamp`: current ISO-8601
- `items`: array of harvested items (min 0 — if nothing found, write entry with empty items array)
- `consumed`: false, `claim_status`: "available", `claimed_by`: null, `claimed_at`: null, `consumed_by`: null, `consumed_at`: null

## Queue Lifecycle

Writers always append entries in **available** state. Consumers use a claim/finalize lifecycle. In batched entries, lifecycle is tracked per item; the entry-level fields are aggregate summaries only:

1. **available**: item has `consumed=false`, `claim_status="available"` (or omitted status, which consumers treat as available)
2. **in_progress**: consumer sets item `claim_status="in_progress"`, plus `claimed_by` and `claimed_at`
3. **consumed**: after a successful `$rpi` cycle and regression gate, consumer sets item `consumed=true`, `claim_status="consumed"`, `consumed_by`, and `consumed_at`
4. **release on failure**: failed or regressed cycles clear item `claimed_by` / `claimed_at`, reset `claim_status="available"`, keep `consumed=false`, and may record `failed_at`

Selection rules:
- skip items that are `consumed=true`
- skip items currently claimed with `claim_status="in_progress"`
- keep failed items retryable; `failed_at` is audit/retry-order metadata, not dormancy
- only mark the entry aggregate `consumed=true` once every child item is consumed

Never mark an item consumed at pick-time.

## Prior-Findings Resolution Tracking

Compute resolution tracking from `.agents/rpi/next-work.jsonl`:

```bash
NEXT_WORK=".agents/rpi/next-work.jsonl"

if [ -f "$NEXT_WORK" ]; then
  totals=$(jq -Rs '
    split("\n")
    | map(select(length>0) | fromjson)
    | reduce .[] as $e (
        {entries:0,total:0,resolved:0};
        .entries += 1
        | .total += ($e.items | length)
        | .resolved += ([($e.items // [])[] | select((.consumed // false) == true)] | length)
      )
    | .unresolved = (.total - .resolved)
    | .rate = (if .total > 0 then ((.resolved * 10000 / .total) | round / 100) else 0 end)
  ' "$NEXT_WORK")

  per_source=$(jq -Rs '
    split("\n")
    | map(select(length>0) | fromjson)
    | map({
        source_epic,
        total: (.items | length),
        resolved: ([((.items // [])[]) | select((.consumed // false) == true)] | length)
      })
    | group_by(.source_epic)
    | map({
        source_epic: .[0].source_epic,
        total: (map(.total) | add),
        resolved: (map(.resolved) | add),
        unresolved: ((map(.total) | add) - (map(.resolved) | add)),
        rate: (if (map(.total) | add) > 0
          then (((map(.resolved) | add) * 10000 / (map(.total) | add)) | round / 100)
          else 0 end)
      })
  ' "$NEXT_WORK")

  echo "Prior findings totals: $totals"
  echo "Prior findings by source epic: $per_source"
else
  echo "No next-work.jsonl found; resolution tracking unavailable."
fi
```

Write the totals and per-source rows into `## Prior Findings Resolution Tracking` in the post-mortem report.
