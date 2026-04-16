# Bootstrap Fast Template

> Scaffold instructions for the Fast tier.
> Called from `skills/bootstrap/SKILL.md` Phase 3 when `CONFIRMED_TIER = fast`.

## What Fast Tier Creates

| File | Purpose |
|------|---------|
| `CLAUDE.md` (or `AGENTS.md` on Codex) | Project instruction file with `## Session Config` |
| `.gitignore` | Platform-appropriate minimal ignore rules |
| `README.md` | One-line stub with project name and description |
| `.orchestrator/bootstrap.lock` | Gate marker — committed to git |

Intentionally absent: `package.json`, frameworks, tests, CI config. The feature that follows brings its own stack.

## Step 1: Ensure Git Repo is Initialized

```bash
cd "$REPO_ROOT"
if [[ ! -d ".git" ]]; then
  git init
  echo "Git repo initialized."
fi
```

## Step 2: Generate CLAUDE.md (or AGENTS.md)

**If `PATH_TYPE = public`:**

Defer entirely to `skills/bootstrap/public-fallback.md` — "Public Path — Fast Tier" section. That file is the single source of truth for Public-path CLAUDE.md generation (claude init path for Claude Code; `_minimal` template synthesis for Codex/Cursor; Session Config injection). Do not duplicate its logic here.

After `public-fallback.md` completes CLAUDE.md generation, continue to Step 2b to verify the Session Config block.

**If `PATH_TYPE = private`:**

Use the baseline scripts at `$BASELINE_PATH` as directed by the baseline's own documentation. Proceed with baseline-driven CLAUDE.md generation, then continue to Step 2b.

**Step 2b: Verify Session Config block.** After writing or updating CLAUDE.md, confirm it contains `## Session Config` and at minimum `project-name` and `vcs`. If either is missing, add them.

**Config file selection by platform:**
- Claude Code → `CLAUDE.md`
- Codex CLI → `AGENTS.md`
- Cursor IDE → `CLAUDE.md`

## Step 3: Generate .gitignore

Detect the platform from existing files in the repo root (best-effort, repo may be empty):

```bash
# Detection order — first match wins
if ls *.py pyproject.toml setup.py 2>/dev/null | head -1 | grep -q .; then STACK="python"
elif ls *.ts *.js package.json 2>/dev/null | head -1 | grep -q .; then STACK="node"
else STACK="generic"; fi
```

Write `.gitignore` with the appropriate content:

**Generic (no stack detected):**
```gitignore
# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log

# Environment
.env
.env.local
.env.*.local

# Session Orchestrator state (platform-specific, not committed)
.claude/
.codex/
.cursor/
```

**Node/TypeScript (append to generic):**
```gitignore
# Node
node_modules/
dist/
build/
.next/
coverage/
*.tsbuildinfo
```

**Python (append to generic):**
```gitignore
# Python
__pycache__/
*.py[cod]
*.egg-info/
.venv/
dist/
build/
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

Note: `.orchestrator/` is NOT gitignored — `bootstrap.lock` must be committed. Only the platform state dirs (`.claude/`, `.codex/`, `.cursor/`) are excluded.

## Step 4: Generate README.md

```markdown
# <REPO_NAME>

<One-sentence description — same as used in CLAUDE.md.>
```

Keep it minimal. One heading, one sentence. The feature that follows will expand it.

## Step 5: Create .orchestrator Directory and bootstrap.lock

```bash
mkdir -p "$REPO_ROOT/.orchestrator"
```

Write `.orchestrator/bootstrap.lock`:

```yaml
# .orchestrator/bootstrap.lock
version: 1
tier: fast
archetype: null
timestamp: <current ISO 8601 UTC — e.g., 2026-04-16T09:30:00Z>
source: <claude-init | plugin-template>
```

Set `source`:
- `claude-init` if `claude init` ran successfully in Step 2
- `plugin-template` otherwise

## Step 6: Initial Git Commit

Stage all created files and commit:

```bash
cd "$REPO_ROOT"
BOOTSTRAP_FILES=(CLAUDE.md AGENTS.md .gitignore README.md .orchestrator/bootstrap.lock)
# Add only the files bootstrap created — no sweeping -u/-A to avoid catching pre-existing files
for _f in "${BOOTSTRAP_FILES[@]}"; do
  [[ -e "$_f" ]] && git add -- "$_f"
done
git commit -m "chore: bootstrap (fast)"
```

The commit message is fixed — do not vary it. It is the artifact that documents bootstrap provenance in `git log`.

## Step 7: Report Created Files

After the commit succeeds, output a concise summary:

```
Bootstrap (fast) complete. Created:
  CLAUDE.md (or AGENTS.md)  — Session Config with project-name, vcs
  .gitignore                 — <stack>-appropriate minimal rules
  README.md                  — one-line stub
  .orchestrator/bootstrap.lock — version: 1, tier: fast
Committed: "chore: bootstrap (fast)"
```

Then return control to `SKILL.md` Phase 5.
