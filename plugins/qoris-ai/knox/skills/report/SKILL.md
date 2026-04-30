---
name: knox:report
description: Generate a Knox security report for the specified time window
disable-model-invocation: true
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox report *)
---

Usage: /knox:report [--since 7d] [--format json|text]

Generates a summary of Knox activity: total events, denials, allow rate, top blocked patterns.

Default window: 24h. Available windows: 1h, 24h, 7d, 30d.
