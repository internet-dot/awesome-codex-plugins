# Session Config Reading

## Resolving the Plugin Root

`$CLAUDE_PLUGIN_ROOT` (Claude Code), `$CODEX_PLUGIN_ROOT` (Codex CLI), or `$CURSOR_RULES_DIR` (Cursor IDE) may not be set (depends on how hooks/skills are loaded). Resolve the script path with this fallback chain:

1. If `$CLAUDE_PLUGIN_ROOT`, `$CODEX_PLUGIN_ROOT`, or `$CURSOR_RULES_DIR` is set and non-empty, use it.
2. Otherwise, search for the plugin install location (includes Claude Code, Codex, and Cursor paths):
   ```bash
   PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CURSOR_RULES_DIR:-}}}"
   if [[ -z "$PLUGIN_ROOT" ]]; then
     # Check common install locations (Claude Code + Codex CLI + Cursor IDE)
     for candidate in \
       "$HOME/Projects/session-orchestrator" \
       "$HOME/.claude/plugins/session-orchestrator" \
       "$HOME/.codex/plugins/session-orchestrator" \
       "$HOME/plugins/session-orchestrator" \
       "$HOME/.cursor/plugins/session-orchestrator" \
       "$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "")")")" \
     ; do
       if [[ -n "$candidate" && -f "$candidate/scripts/parse-config.mjs" ]]; then
         PLUGIN_ROOT="$candidate"
         break
       fi
     done
   fi
   ```

## Parsing Config

> **Canonical Field Reference:** For the complete list of all Session Config fields, types, defaults, and descriptions, see `docs/session-config-reference.md`. Skills should NOT maintain inline copies of field documentation — always reference the canonical doc.

Run `node "$PLUGIN_ROOT/scripts/parse-config.mjs"` to get the validated config JSON. If it exits with code 1, read stderr for the error and report to the user.

Store the JSON output as `$CONFIG` for use throughout this skill — extract fields with `echo "$CONFIG" | jq -r '.field-name'`.

### Handling `agents-per-wave` Overrides

`agents-per-wave` may be a plain integer (`6`) or a JSON object with session-type overrides (`{"default": 6, "deep": 18}`). To get the effective value for the current session type:

```bash
# Plain integer → use directly. Object → check for session-type override, fall back to .default
APW=$(echo "$CONFIG" | jq -r '."agents-per-wave"')
if echo "$APW" | jq -e 'type == "object"' > /dev/null 2>&1; then
  EFFECTIVE_APW=$(echo "$APW" | jq -r --arg st "$SESSION_TYPE" '.[$st] // .default')
else
  EFFECTIVE_APW="$APW"
fi
```

## Handling `agent-mapping` Config

`agent-mapping` is an optional JSON object that maps role keys to agent names. If present, session-plan uses these explicit mappings to assign agents to tasks (overriding auto-discovery matching).

**Role keys**: `impl`, `test`, `db`, `ui`, `security`, `compliance`, `docs`, `perf`

```bash
# Extract agent-mapping (returns null if not configured)
AGENT_MAPPING=$(echo "$CONFIG" | jq -r '."agent-mapping" // empty')
```

Example config in the project instruction file:
```yaml
agent-mapping: { impl: code-editor, test: test-specialist, db: database-architect, ui: ui-designer, security: security-auditor, compliance: austrian-compliance }
```

When `agent-mapping` is not present, session-plan falls back to auto-discovery (scanning the platform's agents directory (`<state-dir>/agents/`) and matching task descriptions against agent descriptions).

## Fallback

If the script is not available (missing file, `$PLUGIN_ROOT` unresolvable), fall back to reading the project instruction file manually per `docs/session-config-reference.md`. The `## Session Config` block is read from `CLAUDE.md` (Claude Code, Cursor IDE) or `AGENTS.md` (Codex CLI), depending on which platform is active.

## Learning Expiry Semantics

Learnings live exclusively in `.orchestrator/metrics/learnings.jsonl`. The pre-`2.0.0` location `<state-dir>/metrics/learnings.jsonl` is no longer read; consumers with leftover entries should run `scripts/migrate-legacy-learnings.sh` once.

The learning lifecycle states are:

- **Created**: `confidence: 0.5`, `expires_at`: current date + `learning-expiry-days` (default: 30)
- **Confirmed** (same type+subject seen again): `confidence += 0.15` (cap 1.0), `expires_at` reset
- **Contradicted** (evidence against): `confidence -= 0.2` — do NOT reset `expires_at` (let the learning decay naturally if contradicted)
- **Decayed** (untouched this session): `confidence -= learning-decay-rate` (from Session Config, default `0.05`). Applied at session-end after touched-set update, before prune. Clamped to 0.0. Does NOT reset `expires_at`.
- **Expired**: `expires_at < current date` — removed on next write
- **Dead**: `confidence <= 0.0` — removed on next write

**Expiration check semantics:** Compare `expires_at` by date portion only (ignore time-of-day) to avoid intra-day jitter. When writing `expires_at`, set it to `<current_date>T00:00:00Z + learning-expiry-days` (midnight UTC).

**Confidence bounds enforcement:** After EVERY increment or decrement, clamp confidence to [0.0, 1.0]. A learning at 0.95 confirmed becomes 1.0 (not 1.10). A learning at 0.1 contradicted becomes 0.0 and is pruned.

Cleanup (pruning expired + deduplicating by type+subject) runs on EVERY write to `learnings.jsonl`, in both session-end and evolve skills.
