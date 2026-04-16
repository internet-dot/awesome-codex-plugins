> See probes-intro.md for confidence scoring reference.

## Category: `session`

### Probe: gap-analysis

**Activation:** Active session exists (session plan in CLAUDE.md or AGENTS.md or memory).

**Detection Method:**

```bash
# Step 1: Extract planned items from session plan
# Parse the wave plan for task descriptions and acceptance criteria

# Step 2: Get all changes in current session
git diff --name-only HEAD~<session_commit_count>
git diff --stat HEAD~<session_commit_count>

# Step 3: For each planned item, verify corresponding changes exist
# Match task descriptions against changed files and diff content
git diff HEAD~<session_commit_count> -- <relevant_files>

# Step 4: Check acceptance criteria
# For each acceptance criterion, verify it can be confirmed from the diff
```

**Evidence Format:**
```
Planned Item: <task description>
Status: completed | partial | missing
Evidence: <files changed or NONE>
Acceptance Criteria Met: <list of criteria with pass/fail>
```

**Default Severity:** High.

---

### Probe: hallucination-check

**Activation:** Active session exists.

**Detection Method:**

```bash
# Step 1: Read recent commit messages
git log --oneline -20

# Step 2: For each commit message, extract claims:
# "Added X" -> verify X exists in the codebase
Grep pattern: <claimed_addition>
  --glob "*.{ts,tsx,js,jsx,py,go,rs}"

# "Fixed Y" -> verify the fix is present in the diff
git show <commit_hash> -- <relevant_files>

# "Closes #N" -> verify acceptance criteria from issue #N are met
gh issue view <N> --json body -q '.body'
# or
glab issue view <N>

# Step 3: Cross-reference claims against actual changes
git diff <commit_hash>~1..<commit_hash>
```

**Evidence Format:**
```
Commit: <hash> <message>
Claim: <extracted claim>
Verification: confirmed | UNVERIFIED | contradicted
Evidence: <what was found or not found>
```

**Default Severity:** Critical.

---

### Probe: stale-issues

**Activation:** VCS configured (git remote exists).

**Detection Method:**

```bash
# GitLab: list open issues sorted by last update
glab issue list --per-page 100 | head -50

# GitHub: list open issues sorted by last update
gh issue list --limit 100 --json number,title,labels,updatedAt,assignees --jq '.[] | select(.updatedAt < "<30_days_ago_iso>")'

# Flag:
# - Issues with no activity in stale-issue-days (default: 30 days)
# - Issues assigned but with no associated branch
# - Issues labeled priority:high or priority:critical that are stale

# Check for associated branches:
git branch -r | grep -i "<issue_number>"
```

Session Config field: `stale-issue-days` (default: 30).

**Evidence Format:**
```
Issue: #<number> <title>
Last Updated: <date>
Days Stale: <count>
Assigned To: <assignee or UNASSIGNED>
Has Branch: true | false
Priority: <priority label or NONE>
```

**Default Severity:** Low. Medium if `priority:high` or `priority:critical` is stale.

---

### Probe: issue-dependency-chains

**Activation:** VCS configured (git remote exists).

**Detection Method:**

```bash
# GitLab: fetch issue descriptions and look for cross-references
glab api "projects/<project_id>/issues?state=opened&per_page=100" | python3 -c "
import json, sys, re
issues = json.load(sys.stdin)
for issue in issues:
    refs = re.findall(r'(blocks|depends on|relates to|blocked by)\s+#(\d+)', issue.get('description',''), re.I)
    if refs:
        print(f'#{issue[\"iid\"]}: {refs}')
"

# GitHub: fetch issue bodies and parse cross-references
gh issue list --limit 100 --json number,body --jq '.[] | {number, body}' | python3 -c "
import json, sys, re
for line in sys.stdin:
    issue = json.loads(line)
    refs = re.findall(r'(blocks|depends on|relates to|blocked by)\s+#(\d+)', issue.get('body',''), re.I)
    if refs:
        print(f'#{issue[\"number\"]}: {refs}')
"

# Build dependency graph from parsed relationships
# Detect:
# - Circular chains (A blocks B, B blocks A)
# - Deep chains (>3 levels: A -> B -> C -> D -> ...)
```

**Evidence Format:**
```
Chain: #<a> -> #<b> -> #<c> [-> ...]
Type: circular | deep-chain
Depth: <level count>
Issues Involved:
  - #<number>: <title>
```

**Default Severity:** Medium.

---

### Probe: claude-md-audit

**Activation:** CLAUDE.md or AGENTS.md exists in project root.

**Detection Method:**

1. Session Config completeness (if session-orchestrator plugin is installed):
```bash
# Check if ## Session Config section exists
Grep pattern: ^## Session Config
  --glob "{CLAUDE,AGENTS}.md"

# If section exists, validate referenced paths:
# Extract file paths from Session Config values (pencil, cross-repos, ssot-files)
# For each referenced path:
test -e <path>
# Flag paths that don't exist
```

2. Rules freshness:
```bash
# List all <state-dir>/rules/ files
Glob pattern: "<state-dir>/rules/*.md"

# For each rule file:
# a) Extract key identifiers (function names, file paths, patterns mentioned)
# b) Grep for those identifiers in source code
Grep pattern: <extracted_identifier>
  --glob "*.{ts,tsx,js,jsx,py,go,rs}" --glob "!**/node_modules/**"
# Flag rules whose referenced patterns/functions/files no longer exist in the codebase
```

3. CLAUDE.md staleness:
```bash
# Check last modification date
# macOS:
stat -f "%Sm" -t "%Y-%m-%d" CLAUDE.md
# Linux:
stat -c "%y" CLAUDE.md

# Compare against ssot-freshness-days from Session Config (default: 5)
# Flag if CLAUDE.md is older than threshold
```

4. Technology references:
```bash
# Extract technology/framework mentions from CLAUDE.md
# Common patterns: "uses X", "built with X", framework names, library names
# Cross-reference against package.json dependencies:
cat package.json | python3 -c "
import json, sys
pkg = json.load(sys.stdin)
deps = set(pkg.get('dependencies', {}).keys()) | set(pkg.get('devDependencies', {}).keys())
print('\n'.join(sorted(deps)))
"
# Flag technologies mentioned in CLAUDE.md but absent from dependencies
# Also flag major dependencies NOT mentioned in CLAUDE.md (potential documentation gap)
```

**Evidence Format:**
```
File: CLAUDE.md or AGENTS.md (or <state-dir>/rules/<name>.md)
Issue: missing-session-config | invalid-path-reference | stale-rule | stale-claude-md | phantom-technology | undocumented-dependency
Detail: <specific finding>
Referenced: <what was referenced>
Actual: <what was found or NOT found>
```

**Default Severity:** Medium (staleness, phantom tech, undocumented deps), High (invalid paths, stale rules with no codebase match).

5. Token efficiency — CLAUDE.md size:
```bash
# Count lines in CLAUDE.md
wc -l CLAUDE.md

# Flag if > 150 lines (warning) or > 250 lines (high)
# Identify sections > 30 lines that could move to <state-dir>/rules/ or <state-dir>/docs/
# Check for inline code blocks > 10 lines (should be in separate files)
```

6. Token efficiency — .claudeignore coverage:
```bash
# Check if .claudeignore exists
test -f .claudeignore

# If not, scan for common excludable patterns:
# - Large binary/data directories (> 10MB total)
# - Test fixture directories with > 50 files
# Flag projects without .claudeignore that have > 500 files
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | wc -l
```

7. Token efficiency — state directory hygiene:
```bash
# Check state directory total size (platform-aware: .claude/, .codex/, .cursor/)
STATE_DIR="${SO_STATE_DIR:-.claude}"
du -sh "$STATE_DIR/" 2>/dev/null

# Flag if > 10MB
# Check for stale directories: backups/, screenshots/, temp-*
# Check for files not modified in > 90 days
find "$STATE_DIR/" -maxdepth 1 -type d -name "backups" -o -name "screenshots" -o -name "temp-*" 2>/dev/null
find "$STATE_DIR/" -type f -mtime +90 2>/dev/null | head -10
```

8. Token efficiency — duplicate pattern detection:
```bash
# Hash the ## Session Config section across repos
# If cross-repos is configured, compare CLAUDE.md patterns
# Flag identical sections that could be consolidated into per-project rules at `<state-dir>/rules/`
```

**Evidence Format (token efficiency):**
```
File: CLAUDE.md (or <state-dir>/)
Issue: oversized-claude-md | missing-claudeignore | bloated-state-dir | stale-state-artifacts | duplicate-patterns
Detail: <specific finding>
Current: <size/count>
Threshold: <limit>
Recommendation: <action>
```

**Default Severity:** Medium (oversized CLAUDE.md, missing .claudeignore), Low (stale artifacts, duplicate patterns), High (state dir > 50MB).
