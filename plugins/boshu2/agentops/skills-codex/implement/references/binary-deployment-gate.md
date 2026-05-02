# Binary-Deployment Gate (CLI/Hook Bug Fixes)

**Purpose:** Block declaring "done" on any CLI or runtime-hook bug fix until the **deployed runtime** matches the **source fix**. The user invokes the deployed binary and the cached hook — those are the actual surfaces under test, not the source tree.

**Why this gate exists:** A fix shipped to source while the deployed runtime is pre-fix keeps reproducing the bug during its own post-mortem. The post-mortem of the close-loop dedup fix on 2026-05-01 hit exactly this: source-level tests passed, the issue was closed, but `~/go/bin/ao` was still the pre-fix binary, so duplicates kept generating during the post-mortem itself.

**Sources:**
- Council finding: `.agents/council/2026-05-01-evolution-cycle-council.md`, finding 1, action item A (6/6 judges concurred this is the highest-priority follow-up).
- Captured failure mode: `.agents/learnings/2026-05-01-fix-shipped-binary-stale.md`.

## Trigger

The gate fires when the diff touches CLI binaries or runtime hooks:

```bash
CHANGED=$(
    git diff --name-only HEAD~1 2>/dev/null
    git diff --name-only --cached 2>/dev/null
    git diff --name-only 2>/dev/null
)
TRIGGERS=$(printf '%s\n' "$CHANGED" | grep -E '^(cli/cmd/|hooks/|cli/embedded/hooks/)' | sort -u)
if [ -z "$TRIGGERS" ]; then
    echo "Binary-deployment gate: no CLI/hook surfaces touched — skip"
    exit 0
fi
echo "Binary-deployment gate FIRES on:"
printf '  %s\n' $TRIGGERS
```

If `$TRIGGERS` is empty, skip the gate. Otherwise, both checks below MUST pass before Step 5a.

## Check A: Deployed binary mtime ≥ source-fix commit timestamp

For each binary under `cli/cmd/<bin>/` touched by the diff (typically just `ao`):

```bash
BIN=ao   # substitute the binary you fixed

DEPLOYED=$(command -v "$BIN" 2>/dev/null)
if [ -z "$DEPLOYED" ]; then
    echo "BLOCK: $BIN not on PATH — fix is unreachable from a fresh shell"
    echo "  REMEDIATION: install the binary (cd cli && make install) or add to PATH"
    exit 1
fi

# Deployed mtime — Linux first, macOS fallback
DEPLOYED_MTIME=$(stat -c %Y "$DEPLOYED" 2>/dev/null || stat -f %m "$DEPLOYED")

# Source-fix commit timestamp — last commit touching the cmd dir
SOURCE_MTIME=$(git log -1 --format=%ct -- "cli/cmd/$BIN/")

if [ "$DEPLOYED_MTIME" -lt "$SOURCE_MTIME" ]; then
    echo "BLOCK: deployed $BIN at $DEPLOYED is older than the fix commit"
    echo "  deployed: $(date -d @$DEPLOYED_MTIME 2>/dev/null || date -r $DEPLOYED_MTIME)"
    echo "  source:   $(date -d @$SOURCE_MTIME 2>/dev/null || date -r $SOURCE_MTIME)"
    echo "  REMEDIATION: cd cli && make build && make install (or your repo's deploy step)"
    exit 1
fi

echo "Check A PASS: deployed $BIN ($DEPLOYED_MTIME) >= source ($SOURCE_MTIME)"
```

**Why mtime, not hash:** the deployed binary is built by the user's local toolchain at install time, so a hash comparison against any source artifact is meaningless. Mtime ≥ source-commit-timestamp is the cheapest sufficient condition: it proves the deploy ran after the fix landed.

**Caveat:** `git log --format=%ct` reports the **commit timestamp** of the most recent commit touching the directory. If you re-built the binary before committing the fix, deployed mtime will be older than the commit. Ship the fix as a commit FIRST, then rebuild and redeploy, then run this check.

## Check B: Plugin-cache hook copies reflect the fix

For any change under `hooks/` or `cli/embedded/hooks/`, the Codex runtime reads from the plugin cache (`~/.codex/plugins/cache/...`). If a stale copy is in the cache, the source fix never reaches the user.

Substitute the **marker string** introduced by your fix — a unique constant, env var, or substring that appears ONLY in the post-fix file. For the close-loop fix, the marker was `AGENTOPS_STARTUP_CLOSE_LOOP`.

```bash
MARKER="AGENTOPS_STARTUP_CLOSE_LOOP"   # substitute your unique marker
HOOK_FILENAME="session-start.sh"        # substitute the hook you edited

STALE=$(
    find ~/.codex/plugins/cache \
        -name "$HOOK_FILENAME" \
        -path '*agentops*' \
        -exec grep -L "$MARKER" {} \; 2>/dev/null
)

if [ -n "$STALE" ]; then
    echo "BLOCK: plugin-cache hook copies are pre-fix:"
    printf '  %s\n' $STALE
    echo "  REMEDIATION 1 (preferred): reinstall the agentops plugin —"
    echo "    bash <(curl -fsSL https://raw.githubusercontent.com/boshu2/agentops/main/scripts/install.sh)"
    echo "  REMEDIATION 2: delete the stale cache files and let the harness re-fetch."
    exit 1
fi

echo "Check B PASS: no stale plugin-cache copies of $HOOK_FILENAME"
```

**Picking a marker:** prefer something that already exists in the diff. The closer the marker is to the actual fix (an env var name, a new function, a unique string literal), the more meaningful the check. Avoid markers that only appear in comments — comments are easy to copy across stale and fresh files.

**No-op case:** if the find command produces no results because the user has no plugin cache (e.g., a CI runner), the check passes vacuously. That's fine — the gate is most useful on developer machines where stale caches accumulate.

## Pass criteria

The gate passes when EITHER:
- Trigger is empty (the diff touched no CLI/hook surfaces), OR
- Both Check A and Check B pass.

Only then may you proceed to Step 5a (Verification Gate).

## Failure recovery

If Check A fails: rebuild & redeploy. Typical commands:

```bash
cd cli && make build && make install   # repo-canonical build/deploy
# OR for go users:
go install ./cli/cmd/ao
```

Re-run Check A. Repeat until pass.

If Check B fails: reinstall the plugin or delete stale cache copies. Re-run Check B. Repeat until pass.

**Do NOT close the issue or declare "done" until both checks pass.** The whole point of the gate is that source-level test pass is necessary but not sufficient for a deployed-runtime bug.

## Why this is a block, not a warning

A passing source-level test suite proves the source is correct. It does NOT prove the deployed runtime — the actual surface the user invokes — got the fix. The 2026-05-01 close-loop incident demonstrated the failure mode in vivo: the post-mortem itself reproduced the bug because the binary it ran was pre-fix. A warning would not have stopped that. A block does.
