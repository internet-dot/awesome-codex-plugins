---
name: knox:allow
description: Add a pattern to the Knox custom allowlist
disable-model-invocation: true
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox policy add-allow *)
---

Usage: /knox:allow <pattern> [--label "description"]

Adds a pattern to `.knox.local.json` custom_allowlist. User-only — Claude cannot invoke this skill autonomously without explicit user instruction.

Example: /knox:allow "npm run test" --label "npm test scripts"

Note: Custom allowlist entries do NOT bypass the default blocklist. They only allow commands that are not already blocked by the default rules.
