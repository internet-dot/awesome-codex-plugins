---
name: knox:block
description: Add a pattern to the Knox custom blocklist
disable-model-invocation: true
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/bin/knox policy add-block *)
---

Usage: /knox:block <pattern> [--label "description"] [--risk critical|high|medium|low]

Adds a pattern to `.knox.local.json` custom_blocklist. User-only.

Example: /knox:block "psql.*prod.*COPY" --label "No bulk DB export" --risk high
