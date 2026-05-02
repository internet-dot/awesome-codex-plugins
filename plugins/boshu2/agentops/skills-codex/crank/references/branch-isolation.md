# Branch Isolation Gate

Cut a fresh branch named after the epic ID **before any wave-1 commit**. Parallel sessions targeting `main` (or the same operator branch) can `git reset --hard` each other mid-cycle. This destroyed agentops-zm8 Wave 1 — a sibling session reset `main` while wave 1 was committing, losing the wave's work.

## Gate

```bash
EPIC_ID="<epic-id-from-step-1>"
CURRENT_BRANCH="$(git branch --show-current)"
EXPECTED_BRANCH="crank/${EPIC_ID}"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "FAIL: refusing to crank on $CURRENT_BRANCH; cut a dedicated branch"
  echo "  git checkout -b $EXPECTED_BRANCH"
  exit 1
fi

if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ] && \
   [[ "$CURRENT_BRANCH" != crank/${EPIC_ID}-* ]]; then
  echo "WARN: current branch ($CURRENT_BRANCH) does not match crank/${EPIC_ID}*"
  echo "  Set --allow-foreign-branch to suppress, or"
  echo "  git checkout -b $EXPECTED_BRANCH"
fi
```

## When to skip

- `--allow-foreign-branch`: operator already cut a branch with a different name (e.g., `evolve/<date>`, an integration branch)
- **Never skip on `main`/`master`** — that path is unsafe regardless of flags

## Naming convention

- Primary: `crank/<epic-id>` (e.g., `crank/agentops-zm8`)
- Sub-waves: `crank/<epic-id>-<wave>` (e.g., `crank/agentops-zm8-w2`)

The convention exists so sibling sessions can detect each other via branch name without coordination.

## Source

agentops-zm8 post-mortem: parallel-session reset clobber.
