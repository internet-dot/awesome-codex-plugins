# Pre-Decomposition Steps

> Extracted from plan/SKILL.md on 2026-04-11.
> Knowledge flywheel search, compiled prevention loading, research validation, explore-agent dispatch, baseline audit.

## Step 2 Expansion: Knowledge Flywheel Search

Look for existing research on this topic:
```bash
ls -la .agents/research/ 2>/dev/null | head -10
```

Use `rg` or the available search tool to search `.agents/` for related
content. If research exists, read it before planning.

**Search knowledge flywheel for prior planning patterns:**
```bash
if command -v ao &>/dev/null; then
    ao search "<topic> plan decomposition patterns" 2>/dev/null | head -10
    ao lookup --query "<goal>" --limit 5 2>/dev/null | head -30
fi
```

**Apply retrieved knowledge (mandatory when results returned):**

If ao returns relevant learnings or patterns, do NOT just load them as passive context. For each returned item:
1. Check: does this learning apply to the current planning goal? (answer yes/no)
2. If yes: incorporate as a planning constraint — does it warn about scope? suggest decomposition? flag a known pitfall?
3. Cite applicable learnings by filename when they influence a planning decision

After reviewing, record each citation with the correct type:
```bash
# Only use "applied" when the learning actually influenced your output.
# Use "retrieved" for items that were loaded but not referenced in your work.
ao metrics cite "<learning-path>" --type applied 2>/dev/null || true   # influenced a decision
ao metrics cite "<learning-path>" --type retrieved 2>/dev/null || true # loaded but not used
```

**Section evidence:** When lookup results include `section_heading`, `matched_snippet`, or `match_confidence` fields, prefer the matched section over the whole file. Higher `match_confidence` (>0.7) is a strong match; <0.4 is weak. Use `matched_snippet` as primary context rather than reading the full file.

Skip silently if ao is unavailable or returns no results.

## Step 2.1 Expansion: Load Compiled Prevention First (Mandatory)

Before decomposition, load compiled planning rules from `.agents/planning-rules/*.md` when they exist. This is the primary prevention surface for `$plan` in the compiler-enabled flow.

Use the tracked contracts in `docs/contracts/finding-compiler.md` and `docs/contracts/finding-registry.md`:

- prefer compiled planning rules first
- match by finding ID, `applicable_when` overlap, language overlap, and literal goal-text overlap
- when file inventory is known, rank by changed-file overlap before falling back to weaker textual matches
- cap the injected set at top 5 findings / rule files
- if compiled planning rules are missing, incomplete, or fewer than the matched finding set, fall back to `.agents/findings/registry.jsonl`
- fail open: missing/empty directory → skip silently; malformed line → warn and ignore; unreadable file → warn once and continue

Use the selected planning rules / active findings as hard planning context before issue decomposition. Record the applied finding IDs and how they changed the plan.

**Ranked packet contract:** Treat compiled planning rules, active findings, and matching high-severity `next-work.jsonl` items as one ranked packet, not three unrelated lookups. Rank by: (1) literal goal-text overlap, (2) `applicable_when` / issue-type overlap, (3) language overlap, (4) changed-file overlap, (5) backlog severity / repo affinity for next-work items.

## Step 2.2 Expansion: Read and Validate Research Content

If research files exist, read the most recent one and verify it contains substantive findings before proceeding:

```bash
LATEST_RESEARCH=$(ls -t .agents/research/*.md 2>/dev/null | head -1)
if [ -n "$LATEST_RESEARCH" ]; then
    if grep -qE '^## (Summary|Key Files|Findings|Key Findings|Architecture|Executive Summary|Recommendations|Part [0-9])' "$LATEST_RESEARCH"; then
        echo "Research validated: $LATEST_RESEARCH"
    else
        echo "WARNING: Research file exists but lacks standard sections. Consider $research first."
    fi
fi
```

**Read the validated research file** before proceeding to Step 3. Do not plan
based solely on file existence.

## Step 3 Expansion: Explore the Codebase (if needed)

Dispatch a bounded Explore agent when parallel exploration is useful. In Codex,
prefer `spawn_agent` when the user has explicitly authorized sub-agents;
otherwise inspect locally or use a non-interactive `codex exec` fallback. The
explore prompt MUST request symbol-level detail:

```text
Explore the codebase to understand what's needed for: <goal>

1. Find relevant files and modules
2. Understand current architecture
3. Identify what needs to change

For EACH file that needs modification, return:
- Exact function/method signatures that need changes
- Struct/type definitions that need new fields
- Key functions to reuse (with file:line references)
- Existing test file locations and naming conventions (e.g., TestFoo_Bar)
- Import paths and package relationships

Return: file inventory, per-file symbol details, reuse points with line numbers, test patterns
```

## Pre-Planning Baseline Audit (Mandatory)

**Before decomposing into issues**, run a quantitative baseline audit to ground the plan in verified numbers. This is mandatory for ALL plans. Any plan that makes quantitative claims (counts, sizes, coverage) must verify them mechanically.

Run grep/wc/ls commands to count the current state of what you're changing:

- **Files to change:** count with `ls`/`find`/`wc -l`
- **Sections to add/remove:** count with `grep -l`/`grep -L`
- **Code to modify:** count LOC, packages, import references
- **Coverage gaps:** count missing items with `grep -L` or `find`

**Record the verification commands alongside their results.** These become pre-mortem evidence and acceptance criteria.

| Bad | Good |
|-----|------|
| "14 missing refs/" | "14 missing refs/ (verified: `ls -d skills/*/references/ \| wc -l` = 20 of 34)" |
| "clean up dead code" | "Delete 3,003 LOC across 3 packages (verified: `find src/old -name '*.go' \| xargs wc -l`)" |
| "update stale docs" | "Rewrite 4 specs (verified: `ls docs/specs/*.md \| wc -l` = 4)" |
| "add missing sections" | "Add Examples to 27 skills (verified: `grep -L '## Examples' skills/*/SKILL.md \| wc -l` = 27)" |

- **File size limits:** check `wc -l` on files near size limits (especially SKILL.md files with the 800-line lint limit). If a planned change will push a file past the limit, split or refactor before implementation.
- **Test fixtures affected:** count test fixtures upstream of any filter/gate/hook being added or modified with `grep -rn 'func Test' <test-dir>/ | wc -l`. Changing a gate without updating its test fixtures causes false-green CI.

Ground truth with numbers prevents scope creep and makes completion verifiable. In ol-571, the audit found 5,752 LOC to remove — without it, the plan would have been vague. In ag-dnu, wrong counts (11 vs 14, 0 vs 7) caused a pre-mortem FAIL that a simple grep audit would have prevented.
