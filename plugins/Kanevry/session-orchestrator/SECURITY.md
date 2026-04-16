# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.0.x-alpha | Yes |
| 1.x | No |

## Reporting a Vulnerability

If you discover a security vulnerability in Session Orchestrator, please report it responsibly.

**Email:** [security@gotzendorfer.at](mailto:security@gotzendorfer.at)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Affected files/skills
- Potential impact

**Response time:** We aim to acknowledge reports within 48 hours and provide a fix or mitigation plan within 7 days.

## Scope

Session Orchestrator is a **Claude Code plugin** composed entirely of Markdown instructions and shell scripts. It does not:
- Run a web server or accept network connections
- Store credentials or secrets
- Execute user-provided code directly

Security concerns are most likely to involve:
- **Hook scripts** (`hooks/enforce-scope.sh`, `hooks/enforce-commands.sh`) — command injection via crafted file paths or tool input
- **Skill instructions** — prompt injection that could bypass scope enforcement or safety constraints
- **Agent dispatch** — unintended tool access or scope escalation during wave execution

## Disclosure

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure). Fixes are committed with a security advisory once a patch is available.

## Enforcement Architecture

Session Orchestrator uses a two-layer PreToolUse hook system to constrain agent behavior during wave execution.

### File scope enforcement (`enforce-scope.sh`)

Intercepts **Edit** and **Write** tool calls. Validates the target `file_path` against the `allowedPaths` array in `.claude/wave-scope.json`. Paths are matched via prefix (directory), glob (`*`, `**`), or exact literal. Symlinks are resolved with `realpath` before comparison to prevent symlink bypass. Files outside the project root are always flagged.

### Command enforcement (`enforce-commands.sh`)

Intercepts **Bash** tool calls. Checks the command string against the `blockedCommands` array in `wave-scope.json` using word-boundary matching (prevents partial matches like "rm" matching "format"). When `blockedCommands` is empty or absent, a hardcoded fallback safety list is enforced: `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE`, `git checkout -- .`.

### Enforcement levels

Both hooks read the `enforcement` field from `wave-scope.json`:

| Level | Behavior | Exit code |
|-------|----------|-----------|
| `strict` | Deny the operation, return `permissionDecision: deny` | 2 |
| `warn` | Allow the operation, emit stderr warning | 0 |
| `off` | Skip all checks | 0 |

**Default is `strict`** (fail-closed) when the `enforcement` field is missing from `wave-scope.json`.

### Dynamic per-wave scoping

The wave-executor writes `.claude/wave-scope.json` before dispatching each wave. This means scope constraints change between waves:

- **Discovery waves** use empty `allowedPaths` (deny-all writes) combined with explicit read-only agent instructions (dual enforcement — hook-level + prompt-level).
- **Quality waves** use two-phase scope: production file patterns for simplification passes, then test-only patterns (`**/*.test.*`, `**/*.spec.*`) for test/review passes.

## Prerequisites

- **`jq` is required** for hook enforcement. If `jq` is not installed, both enforcement hooks silently allow all operations (graceful degradation with stderr warning). The wave-executor checks for `jq` before wave dispatch and warns the user.
- Hooks run in the Claude Code harness environment as PreToolUse interceptors, not as standalone scripts.

## Known Limitations

1. **No enforcement outside active waves** — when no `wave-scope.json` exists (between sessions, before the first wave, after cleanup), hooks exit 0 and allow all operations.

2. **Prompt injection via VCS content** — issue titles and descriptions fetched via `glab`/`gh` are consumed in agent prompts without sanitization. A malicious issue body could inject instructions into an agent's context. Mitigated by: issues are typically user-created in controlled workflows, and wave scope enforcement limits the blast radius of any injected instructions.

3. **Plugin relies on Claude Code harness** — tool-level enforcement is provided by Claude Code's PreToolUse hook system. The plugin cannot enforce restrictions if hooks are bypassed at the harness level.

4. **Session Config values are not validated** — `health-endpoints`, `plan-baseline-path`, and `cross-repos` accept arbitrary string values. Do not embed credentials in these fields (see Credential Safety below).

## Credential Safety

- This plugin does not store, process, or transmit credentials.
- VCS CLI tools (`glab`, `gh`) use the user's existing authentication. Credential security for these tools is the user's responsibility.
- **Do not embed API keys, passwords, or auth tokens** in Session Config fields (especially `health-endpoints` URLs). These values are stored in `CLAUDE.md` which may be committed to version control.
