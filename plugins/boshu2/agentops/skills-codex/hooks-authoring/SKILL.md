---
name: hooks-authoring
description: 'Author AgentOps runtime hooks.'
---
# $hooks-authoring - Hook Authoring Workflow

> Purpose: create or review AgentOps runtime hooks with portable behavior,
clear matchers, deterministic tests, and CI-compatible validation.

**Execute this workflow. Do not only describe it.**

## Route

Use this skill when work touches `hooks/hooks.json`, `hooks/*.sh`,
`lib/hook-helpers.sh`, hook schemas, or tests that exercise runtime hooks.

## Workflow

1. Locate the hook surface.
   - Runtime manifest: `hooks/hooks.json`
   - Hook scripts: `hooks/*.sh`
   - Shared helpers: `lib/hook-helpers.sh`
   - Schema: `schemas/hooks-manifest.v1.schema.json`
   - Tests and parity checks: `tests/`, `scripts/validate-hooks-doc-parity.sh`
2. Select the lifecycle event and matcher.
   - For event behavior, read [references/event-taxonomy.md](references/event-taxonomy.md).
   - For matcher shape, read [references/matcher-patterns.md](references/matcher-patterns.md).
3. Define the contract before editing.
   - Inputs consumed from hook JSON.
   - Output schema and exit-code behavior.
   - Fail-open vs fail-closed decision.
   - Kill switch, timeout, and portability constraints.
4. Implement narrowly.
   - Use `set -euo pipefail` in shell hooks.
   - Resolve paths from the manifest/plugin root rather than the caller CWD.
   - Avoid `eval`, backticks, unquoted variables, and implicit globbing.
   - Keep hook output to the portable subset validated by
     `scripts/test-hooks-output.sh`.
5. Wire the manifest.
   - Use the narrowest matcher that covers the target tool or lifecycle.
   - Add explicit timeout values.
   - Preserve existing ordering unless the behavior depends on ordering.
6. Test directly and through repo gates.
   - For fixture patterns, read [references/test-harness.md](references/test-harness.md).
   - Run the hook with representative JSON fixtures.
   - Run `bash scripts/validate-hooks-doc-parity.sh`.
   - Run `bash scripts/test-hooks-output.sh` when output changes.
   - Run ShellCheck for touched shell files.
7. Sync embedded artifacts when required.
   - If `hooks/`, `lib/hook-helpers.sh`, or
     `skills/standards/references/` changed, run `cd cli && make sync-hooks`.
8. Record evidence.
   - Note touched files, fixture commands, gate output, and any intentional
     fail-open/fail-closed choices.

## Guardrails

- Do not broaden a matcher to hide a missing case; add a second hook entry.
- Do not rely on hook output fields that Codex ignores.
- Do not store session secrets, transcripts, or local runtime state in tracked
  hook fixtures.
- Keep hook authoring documentation separate from active guard behavior. For
  edit-scope enforcement, use `$scope`.

## References

- [references/event-taxonomy.md](references/event-taxonomy.md)
- [references/matcher-patterns.md](references/matcher-patterns.md)
- [references/test-harness.md](references/test-harness.md)
