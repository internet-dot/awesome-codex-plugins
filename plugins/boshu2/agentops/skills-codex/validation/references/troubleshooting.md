# Validation Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Vibe FAIL on first run | Implementation has quality issues | Fix findings via `$crank`, then re-run `$validation` |
| Post-mortem reviewed recent work instead of an epic | No epic-id provided | Pass epic-id for epic-scoped closeout: `$validation ag-5k2` |
| Codex closeout missing | Codex has no session-end hook surface | Let `$validation` run `ao codex ensure-stop`, or run `ao codex ensure-stop` manually before leaving the session |
| Forge produces no output | No ao CLI or no transcript content | Install ao CLI or run `$retro` manually |
| Stale execution-packet | Packet from a previous RPI cycle | Delete `.agents/rpi/execution-packet.json` and pass `--complexity` explicitly |
