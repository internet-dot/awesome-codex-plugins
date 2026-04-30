---
name: quickstart
description: 'Show AgentOps next action.'
---
# $quickstart

> **One job:** Tell a new user what AgentOps does and what to do first. Fast.

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

## Execution Steps

### Step 1: Detect setup

```bash
git rev-parse --is-inside-work-tree >/dev/null 2>&1 && echo "GIT=true" || echo "GIT=false"
command -v ao >/dev/null && echo "AO=true" || echo "AO=false"
command -v bd >/dev/null && echo "BD=true" || echo "BD=false"
[ -d .agents ] && echo "AGENTS=true" || echo "AGENTS=false"
[ -d "$HOME/.agents" ] && echo "GLOBAL_AGENTS=true" || echo "GLOBAL_AGENTS=false"
[ -n "${CODEX_THREAD_ID:-}" ] || [ "${CODEX_INTERNAL_ORIGINATOR_OVERRIDE:-}" = "Codex Desktop" ] && echo "CODEX=true" || echo "CODEX=false"
```

### Step 2: Show what AgentOps does

Output exactly this (no additions, no diagrams):

```
AgentOps is the operational layer for coding agents.

It gives your coding agent four things it doesn't have by default:

  Bookkeeping — sessions capture learnings, findings, and reusable context in .agents/
  Validation  — $council, $pre-mortem, and $vibe challenge plans and code before shipping
  Primitives  — skills, hooks, and the ao CLI give you building blocks for almost any interaction
  Flows       — $research, $implement, $validation, and $rpi can run alone or compose end to end

Key skills: $rpi  $research  $validation  $implement  $council  $pre-mortem  $swarm  $status
Full reference: $quickstart --catalog
```

### Step 3: One next action

Match the first row that applies. Output only that message — nothing else.

| Condition | Message |
|-----------|---------|
| GIT=false + AO=true + GLOBAL_AGENTS=true | "🗂  You're outside a git repo but have a global corpus at `~/.agents`. Global knowledge workflow:\n  1. `$harvest` — scan all `.agents/` across your repos and promote artifacts into `~/.agents/learnings/`\n  2. `$compile` — mine, synthesize, and write an interlinked wiki into `.agents/compiled/` (runs from cwd; set `AGENTOPS_COMPILE_RUNTIME=ollama` or `openai` and the matching API key/host)\n  3. `$knowledge-activation` — turn the compiled corpus into playbooks, a belief book, and runtime briefings for future sessions\n  4. `$status` — flywheel health snapshot\nIf instead you want to start a fresh repo-local project here, `git init` first." |
| GIT=false | "⚠ Not in a git repo. Run `git init` first.\n  (If you meant to work against your global `~/.agents` corpus, run `$quickstart` from a dir with `.agents/` or see `$harvest`, `$compile`, `$knowledge-activation`.)" |
| AO=false + CODEX=true | "📦 Install ao CLI first:\n  brew tap boshu2/agentops https://github.com/boshu2/homebrew-agentops\n  brew install agentops\n  ao init && ao seed\nThen: `$rpi \"a small goal\"` to run your first cycle.\nCodex CLI v0.125.0 uses native hooks by default after install; older installs without native hooks fall back to `ao codex ensure-start`." |
| AO=false | "📦 Install ao CLI first:\n  brew tap boshu2/agentops https://github.com/boshu2/homebrew-agentops\n  brew install agentops\n  ao init --hooks && ao seed\nThen: `$rpi \"a small goal\"` to run your first cycle." |
| AGENTS=false + CODEX=true | "🌱 ao is installed but not initialized here.\n  Run `$bootstrap` to set up GOALS.md, PRODUCT.md, .agents/, and hooks.\n  Or manually: `ao init && ao seed`\nThen: `$rpi \"a small goal\"` to run your first cycle.\nCodex CLI v0.125.0 uses native hooks by default after install; older installs without native hooks fall back to `ao codex ensure-start`." |
| AGENTS=false | "🌱 ao is installed but not initialized here.\n  Run `$bootstrap` to set up GOALS.md, PRODUCT.md, .agents/, and hooks.\n  Or manually: `ao init --hooks && ao seed`\nThen: `$rpi \"a small goal\"` to run your first cycle." |
| BD=false + CODEX=true | "✅ Codex native-hooks path ready.\n  Start with `$rpi \"your goal\"`, `$research <topic>`, or `$status`\n  On Codex CLI v0.125.0, native hooks handle startup and closeout automatically after install.\n  Older installs without native hooks fall back to entry skills auto-running `ao codex ensure-start` once per thread and closeout skills auto-running `ao codex ensure-stop`.\n  Manual escape hatch: `ao codex status`\n  Want issue tracking? `brew install boshu2/agentops/beads && bd init --prefix <prefix>`" |
| BD=false | "✅ Flywheel active. Start now:\n  `$rpi \"your goal\"` — full $discovery → $crank → $validation pipeline\n  `$validation` — close out recent work and capture learnings\n  `$research <topic>` — explore the codebase\n  Want issue tracking? `brew install boshu2/agentops/beads && bd init --prefix <prefix>`" |
| BD=true + CODEX=true | "✅ Codex full stack ready.\n  `bd ready` — see open work\n  Start with `$rpi \"your goal\"`, `$research <topic>`, or `$status`\n  On Codex CLI v0.125.0, native hooks handle startup and closeout automatically after install.\n  Older installs without native hooks fall back to entry skills auto-running `ao codex ensure-start` once per thread and closeout skills auto-running `ao codex ensure-stop`.\n  Manual escape hatch: `ao codex status`" |
| BD=true | "✅ Full stack ready.\n  `bd ready` — see open work\n  `$rpi \"your goal\"` — start a new goal from scratch\n  `$status` — see current session state" |

---

Starting a new project? Run `$scaffold <language> <name>` to generate project structure with best practices.

## See Also

- [scaffold](../scaffold/SKILL.md) — Project scaffolding and component generation

## Examples

### First-Time Setup

**User says:** `$quickstart`

**What happens:** Agent detects tools, shows one-line status, gives the single next action to run.

### Already Set Up

**User says:** `$quickstart`

**What happens:** Agent detects full stack is ready and suggests `$rpi "your goal"` or `bd ready`.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Skills not installed | `bash <(curl -fsSL https://raw.githubusercontent.com/boshu2/agentops/main/scripts/install.sh)` |
| Codex installs without native hooks | Codex CLI v0.125.0 uses native hooks by default after install. Older installs without native hooks fall back to entry skills auto-running `ao codex ensure-start` and closeout skills auto-running `ao codex ensure-stop`; `ao codex status` is the manual escape hatch |
| Flywheel count is 0 | First session — run `$rpi "a small goal"` to start it |
| Want the full skill catalog | Ask: "show me all the skills" or see `references/full-catalog.md` |

## Reference Documents

- [references/getting-started.md](references/getting-started.md)
- [references/troubleshooting.md](references/troubleshooting.md)
- [references/full-catalog.md](references/full-catalog.md)

## Local Resources

### references/

- [references/full-catalog.md](references/full-catalog.md)
- [references/getting-started.md](references/getting-started.md)
- [references/troubleshooting.md](references/troubleshooting.md)

### scripts/

- `scripts/validate.sh`
