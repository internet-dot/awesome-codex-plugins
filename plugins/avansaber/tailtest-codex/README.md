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

## Related

- [tailtest for Claude Code](https://github.com/avansaber/tailtest)
- [tailtest for Cursor](https://github.com/avansaber/tailtest-cursor)
- [tailtest.com](https://tailtest.com)

---

## License

MIT
