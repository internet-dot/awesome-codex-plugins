---
name: provenance
description: 'Trace where knowledge, decisions, or artifacts came from.'
---
# Provenance Skill

Trace knowledge artifact lineage to sources.

## Execution Steps

Given `$provenance <artifact>`:

### Step 1: Read the Artifact

```
Tool: Read
Parameters:
  file_path: <artifact-path>
```

Look for provenance metadata:
- Source references
- Session IDs
- Dates
- Related artifacts

### Step 2: Trace Source Chain

```bash
# Check for source metadata in the file
grep -i "source\|session\|from\|extracted" <artifact-path>

# Search for related transcripts using ao
ao search "<artifact-name>" 2>/dev/null
```

### Step 3: Search Session Transcripts with CASS

**Use CASS to find when this artifact was discussed:**

```bash
# Extract artifact name for search
artifact_name=$(basename "<artifact-path>" .md)

# Search session transcripts
cass search "$artifact_name" --json --limit 5
```

**Parse CASS results to find:**
- Sessions where artifact was created/discussed
- Timeline of references
- Related sessions by workspace

**CASS JSON output fields:**
```json
{
  "hits": [{
    "title": "...",
    "source_path": "/path/to/session.jsonl",
    "created_at": 1766076237333,
    "score": 18.5,
    "agent": "claude_code"
  }]
}
```

### Step 4: Build Lineage Chain

```
Transcript (source of truth)
    ↓
Forge extraction (candidate)
    ↓
Human review (promotion)
    ↓
Pattern recognition (tier-up)
    ↓
Skill creation (automation)
```

### Step 5: Write Provenance Report

```markdown
# Provenance: <artifact-name>

## Current State
- **Tier:** <0-3>
- **Created:** <date>
- **Citations:** <count>

## Source Chain
1. **Origin:** <transcript or session>
   - Line/context: <where extracted>
   - Extracted: <date>

2. **Promoted:** <tier change>
   - Reason: <why promoted>
   - Date: <when>

## Session References (from CASS)
| Date | Session | Agent | Score |
|------|---------|-------|-------|
| <date> | <session-id> | <agent> | <score> |

## Related Artifacts
- <related artifact 1>
- <related artifact 2>
```

### Step 6: Report to User

Tell the user:
1. Artifact lineage
2. Original source
3. Promotion history
4. Session references (from CASS)
5. Related artifacts

## Finding Orphans

```bash
$provenance --orphans
```

Find artifacts without source tracking:
```bash
# Files without "Source:" or "Session:" metadata
for f in .agents/learnings/*.md; do
  grep -L "Source\|Session" "$f" 2>/dev/null
done
```

## Finding Stale Artifacts

```bash
$provenance --stale
```

Find artifacts where source may have changed:
```bash
# Artifacts older than their sources
find .agents/ -name "*.md" -mtime +30 2>/dev/null
```

## Key Rules

- **Every insight has a source** - trace it
- **Track promotions** - know why tier changed
- **Find orphans** - clean up untracked knowledge
- **Maintain lineage** - provenance enables trust
- **Use CASS** - find when artifacts were discussed

## Examples

### Trace Artifact Lineage

**User says:** `$provenance .agents/learnings/2026-01-15-auth-tokens.md`

**What happens:**
1. Agent reads artifact and extracts source metadata (session ID, date, references)
2. Agent searches session transcripts with `cass search "auth-tokens" --json --limit 5`
3. Agent parses CASS results to find origin session and timeline
4. Agent traces promotion history from forge → learnings → patterns
5. Agent builds lineage chain and writes report to markdown
6. Agent reports artifact tier, citations, related artifacts

**Result:** Full provenance chain from transcript to current tier, showing when artifact was created, discussed, and promoted.

### Find Orphaned Artifacts

**User says:** `$provenance --orphans`

**What happens:**
1. Agent scans `.agents/learnings/`, `.agents/patterns/` for files missing source metadata
2. Agent greps each file for "Source:" or "Session:" fields
3. Agent lists files without provenance tracking
4. Agent reports orphan count and recommends adding source references

**Result:** Untracked knowledge identified, enabling retroactive lineage documentation or archival.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| No source metadata found | Artifact created before provenance tracking | Use CASS to find origin session retroactively; add Source field manually |
| CASS returns no results | Session not indexed or artifact name mismatch | Check session transcript exists; try broader search terms |
| Stale artifact check fails | find command not available or permission error | Use `ls -lt .agents/ | grep -v mtime` as fallback |
| Lineage chain incomplete | Promotion not recorded in artifact metadata | Reconstruct from git history or session transcripts; document gaps |

## Local Resources

### scripts/

- `scripts/validate.sh`


