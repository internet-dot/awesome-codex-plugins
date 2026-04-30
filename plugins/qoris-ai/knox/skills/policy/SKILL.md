---
name: knox:policy
description: Show Knox policy — what would be blocked at the current preset
disable-model-invocation: false
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox policy list)
---

Run `knox policy list` to see all active security rules at the current preset.

Use this to understand what categories of commands are blocked before attempting shell operations. Invoke autonomously when planning an approach that involves shell commands.

Also runs `knox policy list-checks` to show which check categories are enabled/disabled.
