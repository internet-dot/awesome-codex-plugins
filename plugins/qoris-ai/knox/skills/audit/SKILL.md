---
name: knox:audit
description: Show recent Knox audit log entries — what was blocked, allowed, or flagged
disable-model-invocation: false
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox audit *)
---

Run `knox audit [N] [--since 1h] [--denied-only] [--tail] [--page N]` to review recent Knox security events.

Arguments:
- N = number of entries per page (default 20)
- --since=1h / 24h / 7d — time window (most efficient: skips old files entirely)
- --denied-only — show only blocked commands
- --tail — show last 100 entries, oldest-first
- --page N / -p N — page number for browsing large logs (default 1)

Examples:
- `knox audit 20 --denied-only` — last 20 denials
- `knox audit --since 24h` — everything today
- `knox audit 50 --page 2` — entries 51-100 (next page)
- `knox audit --since 7d --denied-only` — this week's blocks only

Invoke this to understand what Knox has blocked and why, especially when planning alternative approaches after a denial. For large audit logs (1000s of entries), always use --since to limit scope.
