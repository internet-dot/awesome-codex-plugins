# tailtest for Codex CLI

tailtest blocks Codex at the end of every turn and asks it to write and run tests before continuing -- automatically, with no prompting.

**[Full documentation at tailtest.com/docs/codex](https://tailtest.com/docs/codex)**

---

## Install

```bash
# One-time setup (any terminal):
git clone https://github.com/avansaber/tailtest-codex ~/.codex/plugins/tailtest

# Enable the hooks feature flag in ~/.codex/config.toml:
echo -e "\n[features]\ncodex_hooks = true" >> ~/.codex/config.toml

# Per-project setup (run inside each project where you want tailtest active):
cd <your-project>
bash ~/.codex/plugins/tailtest/scripts/init.sh
```

That's it. Start a `codex` session in the project and tailtest fires on every file edit.

The init script creates `.codex/hooks.json` in your project pointing at the tailtest hook scripts. It is idempotent (safe to re-run) and never overwrites an existing hooks.json with different content — it writes a `.codex/hooks.json.tailtest` sidecar instead for manual merging.

---

## How it works

1. `SessionStart` hook scans for runners and injects `AGENTS.md`
2. `Stop` hook sweeps modified files (mtime > turn start) and queues them
3. Codex gets `decision: block` -- writes tests, runs them, then continues

---

## Quick config

Create `.tailtest/config.json` in your project root:

```json
{ "depth": "standard" }
```

Options: `simple` (2-3 scenarios), `standard` (5-8, default), `thorough` (10-15).

See [tailtest.com/docs/config](https://tailtest.com/docs/config) for all options.

---

## Other tailtest variants

Same R1-R15 rule layer, same adversarial test mode, different host integration. **This repo is the Codex CLI variant.**

- **[tailtest](https://github.com/avansaber/tailtest)** -- Claude Code plugin (hook-driven)
- **[tailtest-cursor](https://github.com/avansaber/tailtest-cursor)** -- Cursor plugin (hook-driven)
- **[tailtest-codex](https://github.com/avansaber/tailtest-codex)** -- Codex CLI plugin (hook-driven; this repo)
- **[tailtest-cline](https://github.com/avansaber/tailtest-cline)** -- Cline plugin (MCP-driven; reaches 8+ editors via Cline's host coverage)

See [tailtest.com/demo/codex](https://tailtest.com/demo/codex) for a live walkthrough of this variant, [tailtest.com/comparison](https://tailtest.com/comparison) for a feature matrix across all four, or [tailtest.com](https://tailtest.com) for the project home.

---

## License

MIT
