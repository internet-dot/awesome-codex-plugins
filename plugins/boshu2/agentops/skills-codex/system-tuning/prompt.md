# system-tuning

Restore a sluggish dev box without nuking work. Diagnose first, walk the kill ladder from safest rung outward, and treat confused parent agents as the real cleanup target.

## Codex Execution Profile

1. Treat `skills/system-tuning/SKILL.md` as the canonical contract and `skills-codex/system-tuning/SKILL.md` as the Codex-facing artifact.
2. Capture a baseline (`uptime`, `/proc/pressure/*`) before signalling anything; verify each loop moved the metric.
3. Convert findings into a triage report at `.agents/system-tuning/YYYY-MM-DD-triage.md` with kill log, renice log, and deltas.

## Guardrails

1. Do not `kill -9` first; use SIGTERM and escalate only after a graceful window.
2. Never signal protected processes (init, sshd, dbus, databases, multiplexers) without explicit operator approval.
3. Stop walking the ladder once metrics return to healthy; further mutation is out of scope.
