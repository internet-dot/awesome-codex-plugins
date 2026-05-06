# Complete Robot Command Reference

## Core Triage & Planning

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-triage` | THE MEGA-COMMAND: quick_ref, recommendations, quick_wins, blockers_to_clear, project_health | Start here |
| `--robot-next` | Single top pick + claim command | Just tell me one thing |
| `--robot-plan` | Parallel execution tracks with `unblocks` lists | What can run concurrently? |
| `--robot-priority` | Priority misalignment with confidence scores | Am I prioritizing wrong? |
| `--robot-help` | Detailed AI agent documentation | Agent onboarding |

## Deep Analysis & Insights

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-insights` | Full metrics: PageRank, betweenness, HITS, eigenvector, critical path, cycles, k-core, articulation, slack | Deep analysis |
| `--robot-graph [--graph-format=json\|dot\|mermaid]` | Dependency graph export | Visualization |
| `--robot-recipes` | Available recipe list | Recipe discovery |

## Label-Based Analysis

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-label-health` | Per-label: health_level, velocity_score, staleness, blocked_count | Domain health |
| `--robot-label-flow` | flow_matrix, dependencies, bottleneck_labels | Cross-team deps |
| `--robot-label-attention [--attention-limit=N]` | Attention-ranked labels | Where to focus? |

## History & Correlation

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-history` | Bead-to-commit correlations | Change tracking |
| `--robot-causality <bead-id>` | Causal chain: timeline, blockers, insights | Why did this take so long? |
| `--robot-related <bead-id>` | File overlap, commit overlap, clusters | What's connected? |
| `--robot-impact-network [all\|<bead-id>]` | Impact network with clusters | Implicit relationships |
| `--robot-file-beads <path>` | Beads that touched a file | Code ownership |
| `--robot-orphans` | Commits not linked to beads | Hygiene, audit |

## Correlation Feedback (Training)

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-explain-correlation <sha>:<bead>` | Why correlation exists | Understanding |
| `--robot-confirm-correlation <sha>:<bead>` | Boost confidence | Correct correlation |
| `--robot-reject-correlation <sha>:<bead>` | Remove correlation | Wrong correlation |
| `--robot-correlation-stats` | Feedback statistics | Accuracy tracking |

## Sprint & Capacity

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-sprint-list` | All sprints as JSON | Sprint planning |
| `--robot-sprint-show <sprint>` | Sprint details | Sprint review |
| `--robot-burndown <sprint\|current>` | Sprint burndown data | Progress tracking |
| `--robot-forecast <id\|all>` | ETA predictions | When will this be done? |
| `--robot-capacity [--agents=N]` | Team capacity simulation | Resource planning |

## Alerts & Health

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-alerts` | Stale issues, blocking cascades, priority mismatches | What's rotting? |
| `--robot-suggest` | Duplicates, missing deps, label suggestions, cycle breaks | Hygiene |

## Time-Travel & Diffing

| Command | Returns | Use When |
|---------|---------|----------|
| `--robot-diff --diff-since <ref>` | New/closed/modified, cycles introduced/resolved | What changed? |
| `--as-of <ref>` | Historical point-in-time (works with any robot command) | Time-travel |

## Search

| Command | Returns | Use When |
|---------|---------|----------|
| `--search "query"` | Interactive search | Finding beads |
| `--robot-search` | Search results as JSON | Programmatic search |
| `--search-mode hybrid` | Text + graph ranking | Smart search |
| `--search-preset <preset>` | Use preset weights | Quick config |

### Search Presets

| Preset | Use Case |
|--------|----------|
| `default` | Balanced |
| `bug-hunting` | Prioritize bugs |
| `sprint-planning` | Sprint-relevant |
| `impact-first` | High-impact items |
| `text-only` | Pure text matching |

---

## Feedback System (Adaptive Recommendations)

```bash
bv --feedback-accept bv-123    # Record positive feedback
bv --feedback-ignore bv-456    # Record negative feedback
bv --feedback-show             # View feedback state
bv --feedback-reset            # Reset to defaults
```

## Baseline & Drift Detection

```bash
bv --save-baseline "Pre-release v2.0"    # Save baseline
bv --baseline-info                        # Show baseline
bv --check-drift                          # Exit codes: 0=OK, 1=critical, 2=warning
bv --check-drift --robot-drift            # JSON output
```

## Shell Script Emission

```bash
bv --robot-triage --emit-script --script-limit=5    # Bash
bv --robot-triage --emit-script --script-format=fish
bv --robot-triage --emit-script --script-format=zsh
```

---

## br CLI Quick Reference

```bash
br ready --json                              # What's unblocked?
br create "Title" -d "desc"                  # New issue
br update br-123 --status in_progress        # Working on this
br close br-123 --reason "Done"              # Done
br dep add br-123 br-456                      # br-123 depends on br-456
br dep remove br-123 br-456                   # Remove dependency (break cycles)
br graph --json                               # Full dependency graph
br list --json                                # All issues as JSON
br agents --add                               # Add instructions to AGENTS.md
br agents --remove                            # Remove instructions
```

---

## Robot Output Structure

All robot JSON includes:
- `data_hash` — Fingerprint of beads.jsonl (verify consistency)
- `analysis_config` — Exact analysis settings for reproducibility
- `status` — Per-metric: `computed|approx|timeout|skipped` + elapsed ms
- `as_of` / `as_of_commit` — Present when using `--as-of`

---

## Agent-Mail Integration

```bash
# Use bead IDs as thread IDs
send_message(..., thread_id="br-123")
file_reservation_paths(..., reason="br-123")
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BEADS_DIR` | Custom beads directory | `.beads` in cwd |
| `BV_ROBOT` | Force robot mode | auto |
| `BV_SKIP_PHASE2` | Skip Phase 2 metrics | disabled |
| `BV_PHASE2_TIMEOUT_S` | Override Phase 2 timeouts | size-based |
| `BV_SEARCH_MODE` | Default search mode | text |
| `BV_SEARCH_PRESET` | Default search preset | default |
| `BV_INSIGHTS_MAP_LIMIT` | Max items in maps | varies |

---

## Scoping Flags

```bash
--label <label>              # Scope to label's subgraph
--as-of <ref>                # Historical point-in-time
--recipe <name>              # Apply built-in recipe
--robot-triage-by-track      # Group by parallel streams
--robot-triage-by-label      # Group by domain
--severity=<level>           # Filter alerts (info|warning|critical)
--alert-type=<type>          # Filter alert type
--repo <name>                # Multi-repo: scope to repository
```

---

## Built-in Recipes

| Recipe | Purpose |
|--------|---------|
| `default` | All open issues sorted by priority |
| `actionable` | Ready to work (no blockers) |
| `recent` | Updated in last 7 days |
| `blocked` | Waiting on dependencies |
| `high-impact` | Top PageRank scores |
| `stale` | Open but untouched 30+ days |
| `quick-wins` | Easy P2/P3, no blockers |
| `bottlenecks` | High betweenness nodes |
# The 12 Metrics

| Metric | What It Finds | High Score Means |
|--------|---------------|------------------|
| **PageRank** | Recursive importance | Everything depends on this (fix first) |
| **Betweenness** | Path traffic | Bottleneck — blocks multiple paths |
| **In-Degree** | Direct blockers | Many things waiting on this |
| **Out-Degree** | Direct dependencies | This needs many things done first |
| **HITS Authority** | Destination node | Core deliverable, end goal |
| **HITS Hub** | Source node | Epic that spawns work |
| **Eigenvector** | Influential neighbors | Connected to important things |
| **Critical Path** | Longest chain | Zero slack — delays cascade |
| **Cycles** | Circular deps | **Broken graph — fix immediately** |
| **K-Core** | Structural strength | Core number indicates shell membership |
| **Articulation** | Cut vertices | Removal disconnects graph |
| **Slack** | Longest-path slack | Buffer before delays cascade |

---

## Two-Phase Analysis

- **Phase 1 (instant)**: degree, topo sort, density — always available
- **Phase 2 (async, 500ms timeout)**: PageRank, betweenness, HITS, eigenvector, cycles

Check the `status` field in robot output:
```bash
bv --robot-insights | jq '.status'
# computed | approx | timeout | skipped
```

---

## Reading the Metrics

```bash
# What's blocking the most stuff? (fix these first)
bv --robot-insights | jq '.PageRank[:5]'

# What's the bottleneck? (everything flows through here)
bv --robot-insights | jq '.Betweenness[:3]'

# Is the graph healthy?
bv --robot-insights | jq '{cycles: .Cycles, density: .density}'
# cycles must be [], density < 0.3 is healthy

# What's the critical path? (can't parallelize these)
bv --robot-insights | jq '.CriticalPath'

# Cut vertices (removing disconnects graph)
bv --robot-insights | jq '.Articulation'

# Slack (buffer before delays cascade)
bv --robot-insights | jq '.Slack[:5]'

# K-core decomposition
bv --robot-insights | jq '.KCore'
```

---

## Metric Combinations (Decision Matrix)

| Pattern | Meaning | Action |
|---------|---------|--------|
| High PageRank + High Betweenness | Critical bottleneck | Drop everything, fix this |
| High PageRank + Low Betweenness | Foundation piece | Important but not blocking |
| Low PageRank + High Betweenness | Unexpected chokepoint | Investigate why |
| High Authority + Low Hub | End goal | This is what you're building toward |
| High Hub + Low Authority | Epic/umbrella | Break it down further |

---

## Healthy Graph Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Cycles | 0 | 1-2 | 3+ |
| Density | < 0.3 | 0.3-0.5 | > 0.5 |
| Critical path | < 10 nodes | 10-20 | > 20 |

# Recipes

## Morning: What's Most Important?

```bash
bv --robot-triage | jq '{
  work_on: .recommendations[:3] | map(.id + ": " + .title),
  clear_first: .blockers_to_clear,
  health: .project_health
}'
```

---

## Finding Parallelizable Work

```bash
# Independent tracks that can run concurrently
bv --robot-plan | jq '.tracks[] | {track: .id, tasks: [.tasks[].id]}'

# Best unblock target (highest ROI)
bv --robot-plan | jq '.plan.summary.highest_impact'
```

---

## Health Check

```bash
bv --robot-insights | jq '{
  cycles: (.Cycles | length),        # Must be 0
  density: .density,                  # < 0.3 is good
  longest_chain: (.CriticalPath | length),
  top_bottleneck: .Betweenness[0],
  articulation_points: .Articulation
}'
```

---

## Finding Stale/Forgotten Work

```bash
bv --robot-alerts | jq '.stale'           # No activity
bv --robot-suggest | jq '.duplicates'     # Potential dupes
bv --robot-suggest | jq '.missing_deps'   # Incomplete graph
```

---

## Scoped Queries

```bash
bv --robot-triage --label backend         # Just backend
bv --recipe actionable --robot-plan       # Only unblocked
bv --recipe high-impact --robot-triage    # Top PageRank only
bv --recipe bottlenecks --robot-insights  # High betweenness nodes
bv --recipe quick-wins --robot-triage     # Easy P2/P3 no blockers
```

---

## Historical Analysis

```bash
# What was the state 30 commits ago?
bv --robot-insights --as-of HEAD~30

# What changed since last release?
bv --robot-diff --diff-since v1.0.0

# Sprint burndown
bv --robot-burndown sprint-42
```

---

## Label-Based Triage

```bash
# Which domain is struggling?
bv --robot-label-health | jq '.results.labels[] | select(.health_level == "critical")'

# Cross-team dependencies
bv --robot-label-flow | jq '.bottleneck_labels'

# Which labels need attention?
bv --robot-label-attention --attention-limit=5
```

---

## Priority Misalignment

```bash
# Find high-confidence priority issues
bv --robot-priority | jq '.recommendations[] | select(.confidence > 0.6)'
```

---

## Diff & History

```bash
# What changed since last commit?
bv --robot-diff --diff-since HEAD~1 | jq '{from: .from_data_hash, to: .to_data_hash}'

# Correlation method distribution
bv --robot-history | jq '.stats.method_distribution'

# Why did this take so long?
bv --robot-causality br-123 | jq '.insights'
```

---

## Feedback System

```bash
# Record what you worked on
bv --feedback-accept br-123

# Record what you skipped
bv --feedback-ignore br-456

# Check current weights
bv --feedback-show
```

---

## Built-in Recipes Reference

| Recipe | Purpose |
|--------|---------|
| `default` | All open issues sorted by priority |
| `actionable` | Ready to work (no blockers) |
| `recent` | Updated in last 7 days |
| `blocked` | Waiting on dependencies |
| `high-impact` | Top PageRank scores |
| `stale` | Open but untouched for 30+ days |
| `quick-wins` | Easy P2/P3 items with no blockers |
| `bottlenecks` | High betweenness nodes |
| `triage` | Sorted by computed triage score |
| `closed` | Recently closed issues |
| `release-cut` | Closed in last 14 days |
