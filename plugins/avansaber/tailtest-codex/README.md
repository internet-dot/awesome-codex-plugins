# tailtest for Codex CLI

tailtest blocks Codex at the end of every turn and asks it to write and run tests before continuing -- automatically, with no prompting.

**[Full documentation at tailtest.com/docs/codex](https://tailtest.com/docs/codex)**

---

## Install

```bash
# Clone the plugin
git clone https://github.com/avansaber/tailtest-codex ~/.codex/plugins/tailtest

# Register in marketplace (~/.agents/plugins/marketplace.json):
{ "plugins": [{ "name": "tailtest", "path": "~/.codex/plugins/tailtest" }] }

# Enable hooks in ~/.codex/config.toml:
[features]
codex_hooks = true

# Copy hook files into your project:
cp ~/.codex/plugins/tailtest/.codex/config.toml <project>/.codex/config.toml
cp ~/.codex/plugins/tailtest/hooks/hooks.json <project>/.codex/hooks.json
```

Restart Codex.

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
