---
name: knox:help
description: Explain Knox — what it is, what hooks are active, the current preset, and how to configure it
disable-model-invocation: false
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox status), Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox policy list-checks)
---

Run `knox status` and `knox policy list-checks`, then explain the output to the user in plain language.

Cover these 5 areas:

1. **What Knox is** — an out-of-process security enforcement layer that intercepts every tool call before execution. It runs as a separate Node.js process, immune to prompt injection and poisoned CLAUDE.md files. Standalone port of the Qoris agent runtime security engine.

2. **Active preset** — from the status output. Explain what the preset means:
   - `minimal`: blocks miners, destruction, self-protection only
   - `standard`: also blocks pipe-to-shell, bash -c, eval, exfiltration; sanitizes sudo
   - `strict`: also blocks sudo entirely, external curl; logs all commands
   - `paranoid`: maximum — uses "ask" not "deny" for every blocked action

3. **Hooks enforcing right now** — which hooks are active:
   - **Enforcing (can block):** PreToolUse on Bash/Monitor/PowerShell/Write/Edit/MultiEdit/NotebookEdit/Read/CronCreate/mcp__*, ConfigChange, UserPromptSubmit, TaskCreated
   - **Audit-only (cannot block):** PostToolUse (injects session context), InstructionsLoaded, SessionStart/End, SubagentStart, FileChanged

4. **How to configure** — three ways:
   - **Skills:** `/knox:allow`, `/knox:block` to adjust patterns; `/knox:policy` to see what's blocked
   - **CLI:** `knox policy disable <check>` to turn off a check category; `knox policy list-checks` to see all toggleable categories
   - **Config files:** `.knox.json` (project-level, commit to git) and `.knox.local.json` (personal, gitignored) — changes are live-reloaded instantly via FileChanged hook, no restart needed

5. **Asking Claude to adjust** — the user can say "add X to the Knox allowlist" and Claude will invoke `/knox:allow` on their behalf. Claude cannot adjust its own security policy without explicit user instruction (the allow/block/report skills have `disable-model-invocation: true`).
