# Wave Execution Loop

> Sub-file of the wave-executor skill. Read by the coordinator during wave dispatch.
> For pre-execution setup, session type behavior, and error recovery, see `SKILL.md`.

## Wave Execution Loop

For each wave, resolve its assigned role(s) from the session plan's role-to-wave mapping:

**Empty waves:** If the session plan shows a wave with 0 agents (role had no tasks), skip it entirely:
1. Log in progress update: `## Wave [N] ([Role]) — Skipped (no tasks)`
2. Update STATE.md: increment `current-wave`, add to Wave History: `### Wave N — [Role] (skipped, no tasks)`
3. Proceed to next wave immediately
4. Do NOT write wave-scope.json for skipped waves

### 1. Dispatch Agents

Use the **Agent tool** to dispatch all agents for this wave IN PARALLEL in a SINGLE message.

Read each wave's dispatch metadata from the session plan header (e.g., `(4 agents, parallel, isolation: worktree)`). Pass the `isolation` value to each Agent() tool call per `circuit-breaker.md`. If the plan does not specify isolation, read from `$CONFIG.isolation` (default: `auto` = worktree for feature/deep, none for housekeeping). Before dispatching, verify the wave's agent count does not exceed `$CONFIG.agents-per-wave` — if it does, warn the user and request plan revision.

#### Agent-Type Resolution

Each agent in the session plan specifies a `subagent_type`. Use that value directly when dispatching:

```
For each agent in this wave:
  Agent({
    description: "<3-5 word summary>",
    prompt: "<COMPLETE task context including:
      - What to do (specific, measurable)
      - Which files to read/modify (exact paths)
      - Acceptance criteria (how to verify done)
      - Relevant patterns from <state-dir>/rules/
      - VCS issue reference if applicable
      - What NOT to touch (other agents' files)
      >",
    subagent_type: "<from session plan>",   // resolved agent type
    run_in_background: false   // CRITICAL: always false — wait for completion
  })
      - Turn budget and status reporting: "You have a maximum of [maxTurns] turns for this task. If you cannot complete within this budget, report STATUS: partial with what was accomplished and what remains. At the end of your work, report STATUS: done (all acceptance criteria met) or STATUS: partial (some criteria unmet — list which ones)."
```

#### Pre-Dispatch Grounding Injection (#85)

Before dispatching each agent, prepend a line-numbered GROUNDING block to its prompt for any file in the agent's scope that has recent edit-format-friction history. This helps the agent reference edits by line number instead of re-matching exact character spans, reducing Edit-tool retry loops.

**Gate:** `$CONFIG."grounding-injection-max-files" > 0` AND `$CONFIG.persistence == true`. When either condition is false, skip the entire step.

**Per-agent scope** (not per-wave): each agent's file scope comes from its specification in the session plan — the same source used for computing the wave's `allowedPaths` union (see `## Scope Manifest` § 3). An agent with narrow scope gets grounding only for files it will touch.

**Invocation:** for each agent about to be dispatched, call:

    AGENT_FILES="$(printf '%s\n' "${agent_file_scope[@]}")" \
    SESSIONS_JSONL=".orchestrator/metrics/sessions.jsonl" \
    EVENTS_JSONL=".orchestrator/metrics/events.jsonl" \
    MAX_FILES="$(echo "$CONFIG" | jq -r '."grounding-injection-max-files"')" \
    SESSION_ID="<session_id>" WAVE="$wave_num" AGENT_TYPE="<subagent_type>" \
    PERSISTENCE="$(echo "$CONFIG" | jq -r '.persistence')" \
    bash "$PLUGIN_ROOT/scripts/compute-grounding-injection.sh"

Capture stdout as `$GROUNDING_BLOCK`. If empty, dispatch the agent unchanged (legacy behavior).

**Prompt assembly:** when `$GROUNDING_BLOCK` is non-empty, prepend to the agent prompt:

    <GROUNDING_BLOCK>

    Use line numbers above to describe edits precisely instead of re-matching character spans. If a line has changed since this snapshot, re-read the file before editing.

    ---

    <original prompt>

The helper emits one `grounding_injected` event per injected file to `.orchestrator/metrics/events.jsonl`. The helper never returns non-zero; any failure (missing jq, missing events.jsonl, unreadable file) results in silent no-op so wave dispatch is never blocked.

**Fallback for agents without explicit file scope:** if the session plan's agent specification does not list a "Files:" scope for an agent, fall back to the wave-level `allowedPaths` (from `wave-scope.json`). If that is also empty, skip injection for that agent.

**Relationship to `### 3b. File-level grounding`:** this pre-dispatch feature is DIFFERENT from the post-wave file-level grounding check. Pre-dispatch grounding injects file content into agent prompts (prevents friction). Post-wave grounding verifies agents stayed within their planned scope (detects scope creep). The two features share no code and run at different times.

#### Structured Reasoning (STATE:/PLAN:) — opt-in via `reasoning-output: true` (#79)

When `$CONFIG.reasoning-output` is `true`, append the following block to every agent prompt. The pattern is adapted from the BitGN PAC Agent's Soft-SGR: short structured transparency lines before tool invocations, without forcing structured output. Leave the block OUT when the flag is `false` (default) — this preserves exact legacy prompt behavior.

```
## Reasoning format

Before every meaningful tool call, emit two single-line markers so the coordinator can trace your thinking:

  STATE: <one-line summary of what you currently know about the task — files read, constraints, blockers>
  PLAN:  <one-line summary of what you are about to do and why>

Rules:
- Keep each line under ~160 characters. Do not nest markdown or code blocks inside these lines.
- Emit them together, STATE first then PLAN, immediately before the tool call they describe.
- Skip them for trivial read-back tool calls (e.g., re-reading a file you just wrote). Do not spam them.
- These markers DO NOT replace your normal text output — they supplement it. Continue writing normal progress updates.
```

**Resolution chain** (if the plan does not specify `subagent_type` for an agent):

1. **Discovery waves** → `"Explore"` (always, read-only)
2. **Quality review** → `"session-orchestrator:session-reviewer"` (always)
3. **Impl-Core / Impl-Polish / Quality (test-writing)** → check in order:
   a. Project agent matching the task domain (e.g., `"database-architect"` for DB tasks)
   b. Plugin agent (e.g., `"session-orchestrator:code-implementer"`)
   c. `"general-purpose"` (final fallback)
4. **Finalization** → direct execution (no subagent needed)

> **How to detect project agents:** The session plan's "Agent Registry" section lists all discovered agents. If an agent name does NOT contain a colon (`:`), it's a project-level agent. If it contains `session-orchestrator:`, it's a plugin agent.

**CRITICAL: `run_in_background: false`** — You MUST wait for ALL agents to complete before proceeding. NEVER use `run_in_background: true` during wave execution. Dispatch all agents in a single message for maximum parallelism, then wait.

#### Platform-Specific Dispatch

**Claude Code:** Use the `Agent` tool as shown above. Agent types follow the resolution chain above.

**Codex CLI:** Codex uses typed agent roles defined in `.codex-plugin/agents/`. Map wave roles to Codex agents:
- **Discovery** waves → `explorer` agent (read-only)
- **Impl-Core / Impl-Polish** waves → `wave-worker` agent (workspace-write), or project-specific agents if defined in the platform's agents directory (`.claude/agents/`, `.codex/agents/`, or `.cursor/agents/`)
- **Quality** review → `session-reviewer` agent (read-only)
- **Finalization** → direct execution (no subagent needed)

Dispatch via Codex's multi-agent system — describe the task and specify the agent role. The prompts remain identical across platforms.

**Cursor IDE:** No Agent() tool available. Execute wave tasks sequentially within the current Composer session:
1. For each task in the wave, implement it fully (you are both coordinator AND implementer)
2. After completing each task, report status inline
3. Run incremental quality checks after all tasks in the wave complete
4. Proceed to the next wave

The `agents-per-wave` config is ignored on Cursor — all work is sequential. Session-reviewer dispatch is deferred to session-end (Phase 1.8).

> **Timeout note:** Agent timeout is controlled by `maxTurns` from `circuit-breaker.md`, not by a time-based timeout. Claude Code's built-in turn limit provides the safety net. There is no need to set explicit time-based timeouts on agent dispatch.

### 2. Review Agent Outputs

After ALL agents in the wave complete:

1. **Read each agent's result** carefully
2. **Check for conflicts**: did two agents modify the same file? → manual merge needed
3. **Check for failures**: did any agent report errors or blockers?
3a. **Apply stagnation patterns** (per agent): review each agent's tool-call sequence against the three patterns in `circuit-breaker.md` § Stagnation Patterns — Pagination Spiral, Turn-Key Repetition, Error Echo. Mark each agent STAGNANT/SPIRAL/FAILED accordingly; recovery feeds into step 3 (Adapt Plan). Two different agents reading the same file is coordination, not stagnation.

**Stagnation event-write** (gated on `persistence: true`): when any stagnation pattern fires for an agent during this step, append one line to `.orchestrator/metrics/events.jsonl` using shell `>>` (atomic for lines under PIPE_BUF):

```json
{"event":"stagnation_detected","timestamp":"<ISO 8601 UTC>","session":"<session_id>","wave":N,"agent":"<subagent_type>","pattern":"pagination-spiral|turn-key-repetition|error-echo","error_class":"<taxonomy value — omit field entirely if pattern is not error-echo>","file":"<relative path from project root, or null if not applicable>","occurrences":N}
```

Assign `error_class` using the taxonomy defined in `circuit-breaker.md` § "3. Error Echo" → Error-Class Taxonomy. For non-error-echo patterns, omit the `error_class` field. Paths are relative to the project root. `occurrences` is the count of pattern repetitions detected (minimum 3 per the trigger threshold).

3b. **File-level grounding** (per wave, informational, gated by `grounding-check: true` — default): compute Planned (union of agent file scopes for this wave from the dispatch metadata) vs Actual (files actually edited by this wave's agents). Report scope creep (Actual ∖ Planned) and incomplete coverage (Planned ∖ Actual). Does NOT block the next wave. Reuses the semantics defined in `skills/session-end/plan-verification.md` § 1.1a — the session-end variant computes against `$SESSION_START_REF`, the per-wave variant computes against the wave's pre-dispatch HEAD snapshot. Not to be confused with pre-dispatch grounding injection (§ Pre-Dispatch Grounding Injection above): that feature is per-agent and runs before dispatch to prevent friction; this check is per-wave and runs after dispatch to detect scope creep. Skip the entire check when `grounding-check: false`.
4. **Run incremental verification** (per the quality-gates skill, based on the wave's role):
   - After **Discovery**: no verification needed (read-only)
   - After **Impl-Core**: Incremental quality checks per quality-gates (test changed files, typecheck)
   - After **Impl-Polish**: Incremental quality checks + integration verification
   - **Simplification pass** (at the start of the Quality wave, before test/review agents):
     1. Identify all files changed in this session: `git diff --name-only $SESSION_START_REF..HEAD`
     2. Filter to production files only (exclude `*.test.*`, `*.spec.*`, `__tests__/`). If no production files changed, skip the simplification pass entirely — proceed directly to test/review agents.
     3. Dispatch 1-2 simplification agents with:
        - Changed file list (production files only — exclude `*.test.*`, `*.spec.*`, `__tests__/`)
        - Reference: `slop-patterns.md` from the discovery skill directory — include the actual patterns in the agent prompt
        To include the patterns: read `skills/discovery/slop-patterns.md` and paste the full content into the agent prompt under a "## Slop Patterns Reference" heading. Do NOT ask the agent to read the file itself — include it inline so the agent has zero-dependency context.
        - Reference: project's CLAUDE.md conventions
        - Instruction: "Review each changed file for AI-generated code patterns. Apply targeted simplifications: remove unnecessary try-catch around non-throwing operations, delete over-documentation (params that repeat the name, returns that say 'the result'), replace re-implemented stdlib functions with standard alternatives, simplify redundant boolean logic (if/else returning true/false, double negation, explicit boolean comparisons). Do NOT change functionality. Do NOT touch files you weren't given. Do NOT commit."
        - Tools: Read, Edit, Grep, Glob
        - Model: sonnet
     4. After simplification agents complete, proceed to Quality test/review agents
   - After **Quality**: Full Gate quality checks per quality-gates (typecheck + test + lint, must all pass)
   - After **Finalization**: final git status check
5. **Session-reviewer dispatch** (after Impl-Core, Impl-Polish, and Quality waves only):
   - After **Impl-Core** and **Impl-Polish** waves, dispatch the session-reviewer agent to verify wave output:
     ```
     Agent({
       description: "Review wave N output",
       prompt: "<include: session plan, wave results, changed files list, acceptance criteria>",
       subagent_type: "session-orchestrator:session-reviewer",
       run_in_background: false
     })
     ```
   - The session-reviewer checks changed files against the plan and reports PASS/WARN/FAIL per category (implementation, tests, TypeScript, security, silent failures, test depth, type design, issues).
   - If the session-reviewer reports **WARN or FAIL** findings: add fix tasks to the next wave's agent assignments (feed into step 3 — Adapt Plan).
   - After the **Quality** wave: dispatch the session-reviewer with **full session scope** (all files changed since session start, not just the current wave). Use `git diff --name-only $SESSION_START_REF..HEAD` to provide the complete changed files list.
   - Include `SESSION_START_REF` (captured in Pre-Wave 1) in the session-reviewer prompt so it can compute the full changed files list independently.
   - **Relationship to session-end Phase 1.8:** Wave-level session-reviewer runs provide incremental feedback during execution. Session-end Phase 1.8 runs a final comprehensive review of ALL changes. Both are complementary — wave reviews catch issues early, session-end review is the final quality gate.
   - **Discovery** and **Finalization** waves: skip session-reviewer dispatch — Discovery is read-only and Finalization is a final git status check only.
   - This is complementary to the incremental verification in step 4 — the session-reviewer provides deeper analysis (security, silent failures, test depth, type design) that automated checks do not cover.
6. **Pencil design review** (after Impl-Core and Impl-Polish roles only, if `pencil` configured in Session Config):
   a. Check Pencil editor state: `get_editor_state({ include_schema: false })`. If no editor active, open the configured `.pen` file via `open_document({ filePathOrTemplate: "<pencil-path>" })`. If that also fails → skip with note "Pencil review skipped — .pen file unavailable."
   b. Get design structure: `batch_get({ filePath: "<pencil-path>", patterns: [{ type: "frame" }], readDepth: 2, searchDepth: 2 })` — find frames relevant to this wave's UI work.
   c. Screenshot relevant frames: `get_screenshot({ filePath: "<pencil-path>", nodeId: "<frame-id>" })` for each frame matching the wave's UI tasks.
   d. Read the actual UI files changed in this wave (from agent outputs).
   e. **Compare**: layout structure, component hierarchy, visual elements (headings, buttons, inputs, cards), responsive behavior.
   f. **Report** in wave progress:
      `- Design: [ALIGNED / MINOR DRIFT / MAJOR MISMATCH] — [specific findings]`
   g. **Act on results**:
      - ALIGNED → proceed to next wave
      - MINOR DRIFT → add fix tasks to next wave (no pause)
      - MAJOR MISMATCH → **PAUSE wave execution**:
        1. Report specific mismatches to user
        2. AskUserQuestion: "Continue as-is", "Revise plan for remaining waves", "Abort session"
           > If AskUserQuestion is unavailable (Codex CLI), present as numbered list.
        3. If "Revise" → re-run session-plan for remaining waves only
        4. If "Abort" → mark remaining waves as DEFERRED, proceed to session-end
   
   Always use the `filePath` parameter on Pencil MCP calls. Only review frames relevant to the current wave, not the entire file.

7. **Capture wave metrics**: If `persistence` is enabled in Session Config, record for this wave after all agents complete and quality checks run. If `persistence` is `false`, skip metrics capture entirely — do not accumulate in-memory metrics. Record:
   - `wave_number`, `role`, `started_at` (when agents were dispatched), `completed_at` (when all finished)
   - `agent_count`: number of agents dispatched
   - Per-agent results: `{description, status: done|partial|failed, files_changed_count}`
   - `files_changed`: total unique files changed this wave (from `git diff --stat --name-only`)
   - `quality_check`: incremental check result (pass/fail/skipped)
   Append this wave record to the session metrics `waves` array.

### 3. Adapt Plan (if needed)

After reviewing wave results, decide:

- **On track**: proceed to next wave as planned
- **Minor issues**: add fix tasks to next wave's agent assignments
- **Major blocker**: inform the user, propose revised plan for remaining waves
- **Agent failed**: re-dispatch with corrected instructions in next wave
- **Scope change**: document why, adjust remaining waves, inform user

**Deviation protocol**: ALWAYS document WHY you deviated from the plan. Log it in a brief note that session-end can reference.

#### Dynamic Scaling

After reviewing wave results, adjust the next wave's agent count based on performance signals:

| Signal | Action | Example |
|--------|--------|---------|
| All agents completed in under 3 minutes wall-clock, no issues | Reduce next wave by 1-2 agents | 6 agents all done in <3m → next wave uses 4 |
| Agent failures or broken code | Add fix agents to next wave (+1-2) | 2 agents failed → next wave gets 2 extra |
| Scope expansion discovered | Scale up next wave | New module found → add agents for it |
| Quality regressions found | Add targeted fix agents | 3 test failures → 3 fix agents next wave |

**Scaling constraints:**
- Never exceed `agents-per-wave` from Session Config
- Never go below 1 agent per wave
- Log all scaling decisions in the wave progress update
- Record actual vs. planned agent count in wave metrics

### 3a. Post-Wave: Update STATE.md

> Skip if `persistence: false`.

After each wave completes and before the progress update, update `<state-dir>/STATE.md`:

1. **Frontmatter**: set `current-wave` to the just-completed wave number; set `status` to `active` (or `paused` if waiting on user input)
2. **`## Current Wave`**: replace contents with next wave info — wave number, role, agents to dispatch and count
3. **`## Wave History`**: append an entry for the completed wave:
   ```
   ### Wave N — <Role>
   - Agent "<description>": <done|partial|failed> — <files changed> — <1-line note>
   - Agent "<description>": <done|partial|failed> — <files changed> — <1-line note>
   ```
4. **`## Deviations`**: if the plan was adapted in step 3, append a timestamped entry:
   ```
   - [<ISO timestamp>] Wave N: <what changed and why>
   ```

### 4. Progress Update

After each wave, provide a brief status:

```
## Wave [N] ([Role]) Complete ✓
- [Agent 1]: [done/partial/failed] — [1-line summary]
- [Agent 2]: [done/partial/failed] — [1-line summary]
- Duration: [Nm Ns] (wall-clock from dispatch to completion)
- Tests: [passing/failing] | TypeScript: [0 errors / N errors]
- Design: [aligned/drift/mismatch — or N/A if not Impl-Core/Impl-Polish or no pencil config]
- Scaling: [unchanged / reduced to N / increased to N] — [reason]
- Adaptations for Wave [N+1] ([NextRole]): [none / list changes]
```

## Scope Manifest

Before each wave dispatch:

1. **Write `<state-dir>/wave-scope.json`** with the wave's scope:
   > (Platform-specific: `.claude/wave-scope.json` on Claude Code, `.codex/wave-scope.json` on Codex CLI, `.cursor/wave-scope.json` on Cursor IDE)
   ```json
   {
     "wave": N,
     "role": "<role>",
     "enforcement": "<from Session Config, default: warn>",
     "allowedPaths": ["<from agent specs in session plan>"],
     "blockedCommands": ["rm -rf", "git push --force", "DROP TABLE", "git reset --hard", "git checkout -- ."],
     "gates": "<copy of enforcement-gates from Session Config, or omit if unset>"
   }
   ```
   The `gates` field (optional) mirrors `enforcement-gates` from Session Config (#77). When present, hooks check each gate individually via `gate_enabled()`. Missing gate entries default to enabled, preserving default behavior.
2. Validate by piping through `bash "$PLUGIN_ROOT/scripts/validate-wave-scope.sh"` (where `$PLUGIN_ROOT` is `$CLAUDE_PLUGIN_ROOT`, `$CODEX_PLUGIN_ROOT`, or `$CURSOR_RULES_DIR` per platform — see `skills/_shared/config-reading.md`). If validation fails (exit 1), fix the JSON based on stderr errors and retry.
3. `allowedPaths` is the UNION of all agent file scopes for this wave
   To compute `allowedPaths`: read each agent's specification from the session plan. Each agent lists its "Files:" scope (e.g., `skills/session-end/SKILL.md`, `scripts/*.sh`). Collect all file paths and glob patterns from all agents in this wave into a single flat array. Deduplicate entries. If an agent's scope uses globs (e.g., `scripts/*.sh`), include the glob pattern as-is — the enforcement hook resolves globs at check time.
4. Read `enforcement` from Session Config (default: `warn`). The `enforcement` field is REQUIRED in `wave-scope.json` — always write it explicitly. The hooks default to `warn` if the field is missing, which would silently degrade strict enforcement. If jq was confirmed missing in Pre-Execution Check step 4, set `enforcement` to `off` and include a comment in the progress update noting that enforcement is disabled.
5. For **Discovery** role waves, set `allowedPaths` to `[]` (empty array) — Discovery agents are read-only and must not modify files. Also add to each Discovery agent prompt: "You are READ-ONLY. Do NOT use Edit or Write tools."
   > **Defense in depth:** The empty `allowedPaths` enforcement hook is the PRIMARY barrier (blocks Write/Edit at the tool level). The prompt instruction is a SECONDARY safeguard. If jq is unavailable (enforcement set to `off`), the prompt instruction becomes the ONLY barrier — log a warning in this case.
6. For **Quality** role waves, use two-phase scope enforcement:
   - **Phase 1 (Simplification)**: Before dispatching simplification agents, set `allowedPaths` to the production files changed this session (`git diff --name-only $SESSION_START_REF..HEAD`, excluding test files). After simplification agents complete, **delete** `<state-dir>/wave-scope.json` before proceeding to Phase 2.
   - **Phase 2 (Test/Review)**: Before dispatching test and review agents, regenerate `<state-dir>/wave-scope.json` with `allowedPaths` restricted to test file patterns (`**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, plus test config files). Quality test/review agents must not modify production source code.

   **Phase transition sequence:**
   1. Compute production file list: `git diff --name-only $SESSION_START_REF..HEAD | grep -v -E '\.(test|spec)\.' | grep -v '__tests__/'`
   2. If no production files → skip Phase 1 entirely, proceed to Phase 2 (write test-only wave-scope.json)
   3. Write Phase 1 wave-scope.json with production file allowedPaths
   4. Dispatch simplification agents, wait for completion
   5. Delete `<state-dir>/wave-scope.json`
   6. Write Phase 2 wave-scope.json with test file allowedPaths (`**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`)
   7. Dispatch test/review agents
7. After the final wave completes, delete `<state-dir>/wave-scope.json` (cleanup)
