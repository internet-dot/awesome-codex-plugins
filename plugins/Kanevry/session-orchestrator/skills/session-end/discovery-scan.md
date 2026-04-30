# Phase 1.5: Discovery Scan

> Sub-file of the session-end skill. Executed as part of Phase 1 plan verification when `discovery-on-close` is enabled.
> For the full session close-out flow, see `SKILL.md`.

### 1.5 Discovery Scan (if enabled)

Resolve the effective `discovery-on-close` value:

```
effectiveDiscoveryOnClose = config.discoveryOnClose ?? (sessionType === 'housekeeping' ? false : true)
```

- If the user has set `discovery-on-close` explicitly in Session Config, that value always wins (backward compatible).
- If the field is absent (not configured), the default is **session-type aware**: `false` for `housekeeping`, `true` for `feature` and `deep`.

If `effectiveDiscoveryOnClose` is `false`, skip this section.

When enabled, invoke the discovery skill in **embedded mode** by dispatching an Explore agent:
```
Agent({
  description: "Discovery embedded scan",
  prompt: "Run discovery probes in embedded mode. Scope: session probes + discovery-probes config. Return findings and stats as a JSON object in a markdown code fence. Do NOT run Phase 5 (triage) or Phase 6 (issue creation) — return after Phase 4.",
  subagent_type: "Explore",
  run_in_background: false
})
```
On Codex CLI / Cursor IDE: execute probes sequentially within the current context (no Agent dispatch).
- Collect verified findings from the discovery output
- Parse the discovery output for the **findings** array and **stats** object (see Parsing callout below)
- Store the stats object for Phase 1.7 metrics collection (`discovery_stats` field)

> **Parsing discovery output:** Search for the first ` ```json ` block in the discovery output. The JSON contains: (1) a **findings** array — objects with `probe`, `category`, `severity`, `confidence`, `file`, `line`, `description`, `recommendation` fields; (2) a **stats** object — with `probes_run`, `findings_raw`, `findings_verified`, `false_positives`, `user_dismissed`, `issues_created`, `by_category`. If JSON parsing fails, log a warning and skip Phase 1.5 — do NOT fail the session close. Store stats as `discovery_stats` in session metrics (Phase 1.7).
- Incorporate findings into issue management:
  - Findings with severity `critical` or `high` → create issues immediately (Phase 5)
  - Findings with severity `medium` or `low` → list in the Final Report under "Discovery Findings (deferred)"
- Report: "Discovery scan: [N] findings ([X] critical/high → issues, [Y] medium/low → deferred)"
