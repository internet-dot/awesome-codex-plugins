# Mode: `/plan new` — Project Kickoff

> Reference file for the plan skill. Read by SKILL.md when mode is `new`.
> Covers: requirement gathering (3 waves) → PRD generation → repo setup → issue creation.
> Project-instruction file resolution: `CLAUDE.md` and `AGENTS.md` (Codex CLI) are transparent aliases — see [skills/_shared/instruction-file-resolution.md](../_shared/instruction-file-resolution.md). New repos pick the file appropriate to the platform that will operate them.

---

## Phase 1: Requirement Gathering (3 waves, 15 questions)

Three waves of 5 questions each. Before each wave, dispatch 2-3 Explore agents in parallel to pre-research options. Synthesize agent results into AskUserQuestion calls (max 4 questions per call, so split 4+1 or 3+2 per wave).

### Wave 1 — Core Decisions (5 questions)

**Pre-wave agents (dispatch in a single message):**

```
Agent({ subagent_type: "Explore", description: "List available project archetypes",
  prompt: "Run: ls $BASELINE_PATH/templates/
  For each directory found, read any README or config file to get a one-line description.
  Report as a numbered list: directory name — description." })

Agent({ subagent_type: "Explore", description: "Research market context",
  prompt: "Search online for market context related to the user's project idea.
  Report: target audiences, competitor landscape, positioning opportunities.
  Keep it to 5-10 bullet points with sources." })

Agent({ subagent_type: "Explore", description: "Check ecosystem for conflicts",
  prompt: "Run: ls ~/Projects/
  List all repos. Identify any that overlap with or could serve as dependencies
  for the proposed project. Report potential conflicts and reuse opportunities." })
```

**Questions:**

1. **Project archetype** — Options from `$BASELINE_PATH/templates/` directory. Present agent findings. Choices: Dynamically list directories in $BASELINE_PATH/templates/. Present each as an option via AskUserQuestion.
2. **Visibility** — internal (GitLab private), private (+ optional GitHub mirror), public/OSS (+ GitHub public + license).
3. **Target audience** — Options informed by market research agent. User selects or provides custom.
4. **Core problem being solved** — Open-ended. Claude suggests structure if answer is vague.
5. **GitLab group** — Discover available groups dynamically. Run `ls $BASELINE_PATH/templates/` for project types, and check for a groups config in `$BASELINE_PATH/config/` or use `glab group list` to discover GitLab groups. Present findings via AskUserQuestion.

### Wave 2 — Technical Details (5 questions, dynamic per archetype)

**Pre-wave agents:**

```
Agent({ subagent_type: "Explore", description: "Read archetype config",
  prompt: "Read $BASELINE_PATH/templates/{archetype}/ — list all files, read key configs.
  Report: default tech stack, available options, required decisions." })

Agent({ subagent_type: "Explore", description: "Research tech stack best practices",
  prompt: "Search online for best practices with the chosen tech stack ({archetype} + {key techs}).
  Report: recommended patterns, common pitfalls, performance tips. 5-10 bullet points." })

Agent({ subagent_type: "Explore", description: "Check ecosystem for shared patterns",
  prompt: "Explore repos in ~/Projects/ that use similar tech stacks.
  Report: shared libraries, common patterns, reusable modules." })
```

**Questions:**

1. **Tech stack decisions** — e.g., Supabase vs alternative DB for nextjs-saas. Options informed by archetype config agent.
2. **Design style** — For frontend archetypes: read `$BASELINE_PATH/templates/{archetype}/styles/` to discover available design variants. Dispatch agent to read baseline style configs. Skip for non-frontend archetypes (those without a `styles/` directory).
3. **External integrations** — APIs, services, payment providers. Agent research informs common choices.
4. **Performance requirements** — Latency targets, concurrent users, throughput expectations.
5. **Security requirements** — Beyond baseline. Auth strategy, encryption, compliance needs (GDPR, SOC2).

### Wave 3 — Business & Scope (5 questions)

**Pre-wave agents:**

```
Agent({ subagent_type: "Explore", description: "Analyze archetype failure modes",
  prompt: "Search online for common failure modes and risks for {archetype} projects.
  Report: top 5 risks with probability/impact and standard mitigations." })

Agent({ subagent_type: "Explore", description: "Check ecosystem dependency compatibility",
  prompt: "For each ecosystem repo mentioned by the user as a dependency,
  read its package.json/go.mod/pyproject.toml and CLAUDE.md (or AGENTS.md on Codex CLI).
  Report: version constraints, API contracts, integration patterns." })

Agent({ subagent_type: "Explore", description: "Research success benchmarks",
  prompt: "Search online for comparable products/features to the user's project idea.
  Report: typical KPIs, adoption curves, success metrics used by similar products." })
```

**Questions:**

1. **MVP scope** — Shape Up appetite: 1 week / 2 weeks / 6 weeks. Frame trade-offs for each.
2. **Success criteria** — SMART format (Specific, Measurable, Achievable, Relevant, Time-bound). Claude proposes draft from research, user refines.
3. **Known risks and mitigations** — Present common risks from agent research. User confirms, removes, or adds.
4. **Post-launch plan** — Monitoring strategy, rollback plan, feedback channels.
5. **Ecosystem dependencies** — Other repos in the 17-repo ecosystem this project depends on or integrates with. Agent verifies compatibility.

---

## Phase 2: PRD Generation

1. Read `prd-full-template.md` from this skill directory.
2. Fill all 8 sections with gathered answers:
   - **Section 1 (Executive Summary):** Synthesize core problem + audience + archetype into a concise project pitch.
   - **Section 2 (Problem & Context):** From Wave 1 Q3-Q4 answers. Include market research findings.
   - **Section 3 (Target Audience):** From Wave 1 Q3 + research agent output. Define 1-3 personas.
   - **Section 4 (Solution & Scope):** From Wave 3 Q1 (appetite) + Wave 2 tech decisions. Explicit **In-Scope MVP** and **Out-of-Scope** lists. This section drives issue creation in Phase 4.
   - **Section 5 (Success Criteria):** From Wave 3 Q2. SMART table format: Metric | Target | Method | Deadline.
   - **Section 6 (Technical Architecture):** From Wave 1 Q1 (archetype) + Wave 2 (tech stack, integrations). Include schema sketch if DB is involved.
   - **Section 7 (Risks & Dependencies):** From Wave 3 Q3 + Q5. Table format: Risk | Probability | Impact | Mitigation.
   - **Section 8 (Post-Launch Plan):** From Wave 3 Q4. Monitoring, rollback, feedback channels.
3. Save PRD to `{plan-prd-location}/YYYY-MM-DD-{project-name}.md`.
4. Dispatch reviewer per `prd-reviewer-prompt.md`. Max 3 iterations. Surface unresolved issues to user.

---

## Phase 3: Repo Setup

After PRD is approved by user:

### Step 1: Invoke setup-project.sh

Map gathered answers to script input choices:

```bash
# Resolve input choices dynamically from setup-project.sh:
# 1. Read $BASELINE_PATH/scripts/setup-project.sh
# 2. Parse menu/select/case statements to find choice→name mappings
# 3. Map user's selected archetype name → numeric choice for TYPE_CHOICE
# 4. Map user's selected style name → numeric choice for STYLE_CHOICE (if applicable)
# 5. Map user's selected group name → numeric choice for GROUP_CHOICE
# Do NOT hardcode numeric mappings — they must be derived from the script.
(
  echo "$TYPE_CHOICE"    # e.g., "1" for nextjs-saas
  echo "$STYLE_CHOICE"   # e.g., "1" for vega (only if nextjs-saas)
  echo "$PROJECT_NAME"   # e.g., "my-cool-app"
  echo "$GROUP_CHOICE"   # e.g., "1" for products
  echo "y"               # confirm
) | bash "$BASELINE_PATH/scripts/setup-project.sh"
```

### Step 2: Verify success

Check exit code. Confirm repo exists:

```bash
glab repo view $GROUP/$PROJECT_NAME
```

### Step 3: Adjust visibility

If visibility is not `internal` (the default):

```bash
glab repo edit --visibility private   # or --visibility public
```

For public/OSS, also configure GitHub mirror if applicable.

### Step 4: Set branch protection

```bash
glab api -X PUT projects/:id/protected_branches \
  -f name=main \
  -f push_access_level=30 \
  -f merge_access_level=30
```

### Step 5: Populate CLAUDE.md (or AGENTS.md on Codex CLI)

Choose the project-instruction file appropriate to the platform that will operate the repo: `CLAUDE.md` for Claude Code / Cursor IDE, `AGENTS.md` for Codex CLI. Pick exactly one — never both. Add `## Session Config` section with fields derived from the planning session. Include at minimum:

- `plan-baseline-path`
- `plan-default-visibility`
- `plan-prd-location`
- Any project-specific config from gathered requirements

### Step 6: Commit PRD

Commit the PRD document to the new repo. Use a descriptive commit message:

```bash
git add docs/prd/YYYY-MM-DD-{project-name}.md
git commit -m "docs: add project PRD from /plan new session"
```

---

## Phase 4: Issue Creation

### Step 1: Derive Epic + sub-issues

Source: PRD Section 4 (Solution & Scope).

- **Epic title:** project name + brief description.
- **Sub-issues:** One per MVP feature/scope item from the In-Scope list. Each issue gets a clear title, description referencing the PRD, and acceptance criteria.

### Step 2: Auto-prioritize

Score each issue using three factors:

1. **Technical dependencies (highest weight):**
   - DB schema before API, API before frontend, shared libs before consumers.
   - Issues that block others → `priority:critical` or `priority:high`.
2. **Business value (medium weight):**
   - Core MVP features → `priority:high`.
   - Nice-to-haves → `priority:medium` or `priority:low`.
3. **Risk (tiebreaker):**
   - Issues with identified risks from PRD Section 7 → bump up one level.

### Step 3: Apply labels

Use taxonomy from `setup-gitlab-groups.sh`:

**Priority mapping for VCS labels:**
| Categorization | VCS Label |
|---|---|
| P0 (critical path, blocking) | `priority:critical` |
| P1 (high impact, needed soon) | `priority:high` |
| P2 (medium, can wait) | `priority:medium` |
| P3 (nice-to-have) | `priority:low` |

Always use the `priority:<level>` format in VCS CLI commands, not P0/P1/P2/P3.

- **type:** feature, enhancement, bug, chore, docs
- **status:** `status:ready`
- **area:** relevant domain label
- **appetite:** 1w, 2w, 6w (matching MVP appetite)
- **mvp-phase:** phase number if phased delivery

### Step 4: Present for user confirmation

Use AskUserQuestion to present the full issue structure:

- Epic title and description
- Sub-issues with: title, priority, labels, dependency links
- User confirms, adjusts priority, removes issues, or adds missing ones

### Step 5: Create via glab

```bash
# Create epic
glab issue create --title "$EPIC_TITLE" --description "$EPIC_DESC" \
  --label "type:epic,priority:$PRIORITY" --milestone "$MILESTONE"

# Create sub-issues
glab issue create --title "$ISSUE_TITLE" --description "$ISSUE_DESC" \
  --label "type:feature,priority:$PRIORITY,status:ready,area:$AREA,appetite:$APPETITE"
```

### Step 6: Set dependency links

For issues with technical dependencies, set `blocks`/`is-blocked-by` relationships:

```bash
# Issue #2 is blocked by Issue #1
glab api -X POST projects/:id/issues/:issue2_iid/links \
  -f target_project_id=:id \
  -f target_issue_iid=:issue1_iid \
  -f link_type=is_blocked_by
```
