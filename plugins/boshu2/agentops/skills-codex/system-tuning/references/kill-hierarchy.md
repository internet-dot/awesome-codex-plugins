# Kill Hierarchy

Order matters. Start with moves that cannot lose work and only escalate when
the previous loop did not move pressure metrics.

## Ladder

| Step | Target | Risk | Why this rung |
|------|--------|------|---------------|
| 1 | Zombie processes (state `Z`) | none | Already dead; reaping just clears the entry |
| 2 | Exited tmux / zellij sessions | none | Storage and scrollback only |
| 3 | Stuck child jobs (tests, formatters) older than your timeout | low | Restart-safe by design |
| 4 | Idle long-running CLIs (`vercel inspect`, hung `git add .`) | low | Restart-safe |
| 5 | Duplicate compile pipelines for the same project | low | Keep the newest, kill the rest |
| 6 | Old dev servers (`next dev`, `vite`) idle for a day | medium | Often forgotten, cheap to restart |
| 7 | Confused parent agents older than expected work horizon | medium | Triggers respawning of items 3–6 |
| 8 | Service managers (`systemctl stop unit.service`) | high | Operator approval; logs first |
| 9 | Reboot / power-cycle | last | Only if responsiveness will not return |

Walk the ladder from the top. Re-check pressure metrics after each rung.
The right rung is the lowest one that moves them.

## Signal Discipline

Most modern Unix tooling honours `SIGTERM`. Some do not — give them a graceful
window, then escalate.

```bash
pid="$1"
kill "$pid" 2>/dev/null               # request shutdown
sleep 3
if kill -0 "$pid" 2>/dev/null; then
  kill -9 "$pid"                      # forcibly stop
fi
```

Do not run `kill -9` first. SIGKILL bypasses cleanup hooks and can leave shared
state (lock files, port reservations, half-written caches) behind.

Tools known to ignore `SIGTERM` and require eventual `SIGKILL`:

- Some test runners that catch and ignore the signal.
- Watchers that swallow signals while their child is busy compiling.
- Long shell pipelines that keep a child alive in `wait`.

When you escalate, log the PID and the reason. The triage report should make
the escalation obvious to the next operator.

## Picking The Right Rung

Use these heuristics before signalling anything:

- **Age vs. work horizon.** A test that takes ten minutes does not need to be
  six hours old to be stuck. Compare elapsed time against the realistic upper
  bound for the job.
- **CPU vs. wall time.** A process at 100% CPU is doing something. A process
  at 0% CPU for an hour is either wedged on I/O or dead in a poll loop.
- **Children before parents.** If a tree of processes is misbehaving, look
  upward. The respawn pattern documented in
  [whack-a-mole-anti-pattern.md](whack-a-mole-anti-pattern.md) almost always
  means the wrong rung was chosen.
- **Renice as escalation, not surrender.** When you cannot kill (the work is
  legitimate but starving the box) drop priority instead.

```bash
renice 19 -p "$PID"     # CPU: lowest niceness
ionice -c 3 -p "$PID"   # I/O: idle class
```

This will not lower load average, but interactive sessions get scheduled
ahead of background work.

## Pre-Conditions Before Any Kill

1. The pressure baseline was captured (you can prove the kill helped).
2. The PID still maps to the suspicious workload (no PID reuse).
3. The parent process tree was inspected.
4. The kill is logged in the triage report with command and reason.

If any of these is missing, stop and gather data.

## Stop Conditions

Stop walking the ladder as soon as the pressure baseline returns to healthy.
Continuing past that point is no longer cleanup; it is mutation. Document any
remaining hot processes for the operator to triage with `$perf` or
`$bug-hunt`.
