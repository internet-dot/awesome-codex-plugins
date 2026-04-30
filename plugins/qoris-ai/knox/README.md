# Knox — Security enforcement for Codex

Pre-execution policy enforcement for Codex tool calls. Blocks dangerous shell commands, miners, prompt injection, and protected-file writes before they execute. Same engine also runs on Claude Code and Cursor.

## What it catches

- `curl … | bash` and other curl-pipe-interpreter patterns
- Destructive `rm -rf` against root, home, or protected directories
- Cryptocurrency miners (xmrig family, randomx pools)
- Prompt-injection in user prompts (`ignore previous instructions`, system-tag jailbreaks, etc.)
- Writes to `.bashrc`, `.profile`, `.knox/`, `.cursor/hooks.json`, etc.
- `apply_patch` envelopes that target the same protected paths
- Recursive script content inspection (reads `bash install.sh`, scans content depth 3)
- Self-protection: env-var bypass attempts (`KNOX_PRESET=off …`), alias shadowing, file mutation of Knox's own audit log or hook scripts
- 88 blocklist patterns + tokenized parsers (`rm`, `find`) + recursive unwrap (`bash -c`, `eval`, `$()`, backticks)

## Hook events wired

All 6 official Codex events:
- `PreToolUse` — Bash + apply_patch + Write/Edit + MCP tools
- `PermissionRequest` — second-tier check before Codex's approval prompt
- `UserPromptSubmit` — prompt-injection scan
- `SessionStart` — escalation state init
- `PostToolUse` — audit logging
- `Stop` — session-end audit flush

`failClosed` semantics on shell + MCP gates (`exit 2 + stderr` on critical block).

## Install (via this curated marketplace)

```bash
codex plugin marketplace add hashgraph-online/awesome-codex-plugins
# Then enable knox via /plugins in the Codex TUI, or in ~/.codex/config.toml:
#   [plugins."knox@awesome-codex-plugins"]
#   enabled = true
```

## Or install standalone

```bash
npm install -g @qoris/knox
knox install --target codex
# → wires ~/.codex/hooks.json with 7 hook entries
# Restart Codex sessions. Live-verified against codex-cli 0.125.0.
```

## Three-host coverage

Knox v2.2.0 ships the same enforcement engine on three hosts via shared `lib/check.js`:

| Host | Events | Native install |
|---|---|---|
| Claude Code | 11 | `claude plugin install knox@qoris` |
| Cursor | 10 | `knox install --target cursor` |
| **OpenAI Codex** | **6** | **`knox install --target codex`** |

## Links

- **Canonical repo:** https://github.com/qoris-ai/knox
- **npm package:** [`@qoris/knox`](https://www.npmjs.com/package/@qoris/knox)
- **Homepage:** https://qoris.ai/knox

## License

MIT — see [LICENSE](LICENSE).
