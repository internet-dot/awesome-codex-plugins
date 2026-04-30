---
name: knox:status
description: Show Knox security status for this session — preset, denial count, escalation state
disable-model-invocation: false
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox status)
---

Run `knox status` to show the current Knox security posture for this session.

The output includes:
- Active preset (minimal/standard/strict/paranoid)
- Number of denials this session
- Escalation state (normal/flagged)
- Audit log path
- Disabled checks (if any)

Invoke this autonomously when you want to check security posture before attempting a potentially risky operation, or when a command has been blocked and you want to understand why.
