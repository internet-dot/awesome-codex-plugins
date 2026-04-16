---
name: bootstrap
user-invocable: true
tags: [bootstrap, setup, scaffold, init]
model-preference: sonnet
model-preference-codex: gpt-5.4-mini
model-preference-cursor: claude-sonnet-4-6
description: >
  Scaffolds the minimum repository structure required by session-orchestrator.
  Invoked automatically by the Bootstrap Gate when CLAUDE.md, Session Config,
  or bootstrap.lock is missing. Also available as /bootstrap for manual invocation.
  Three intensity tiers: fast (demos/spikes), standard (MVPs), deep (production/team).
---

# Bootstrap Skill

## Overview

This skill runs when the Bootstrap Gate is closed (missing CLAUDE.md, Session Config, or `.orchestrator/bootstrap.lock`) or when the user invokes `/bootstrap` directly. It scaffolds the minimum structure required by all session-orchestrator skills, commits it, and writes the lock file that opens the gate for all future invocations.

**Anti-bureaucracy contract:** At most ONE `AskUserQuestion` call in the normal case (tier confirmation). A second question is only asked when the archetype is truly ambiguous on the Public Path for Standard/Deep tiers. No wizard, no multi-step flow.

## Invocation Context

Before starting, determine how this skill was invoked:

- **Transitive (gate-closed):** Invoked from another skill's Phase 0. The user's original intent (their first prompt) is available in context. After bootstrap completes, execution must return to the original skill's Phase 1.
- **Direct (`/bootstrap`):** User invoked manually. Parse `$ARGUMENTS` for flags: `--fast`, `--standard`, `--deep`, `--upgrade <tier>`, `--retroactive`. See `commands/bootstrap.md` for flag semantics.

Store `INVOCATION_MODE = transitive | direct`.

**Mode dispatch (direct invocation only):**
- If `--upgrade <tier>` is present in `$ARGUMENTS`: jump to **Upgrade Flow** section. Do not proceed to Phase 1.
- If `--retroactive` is present in `$ARGUMENTS`: jump to **Retroactive Flow** section. Do not proceed to Phase 1.
- Otherwise: continue to Phase 1 below.

## Phase 0.5: Determine Private vs. Public Path

**Before dispatching to any tier template**, read `skills/bootstrap/public-fallback.md` and execute Step 1 (PATH_TYPE detection). Store the result as `PATH_TYPE = private | public`. This detection is silent — no user interaction.

- `private`: `plan-baseline-path` is present in Session Config AND the path exists on disk. Baseline templates will be used for CLAUDE.md generation and archetype file sourcing.
- `public`: `plan-baseline-path` is absent, empty, or points to a non-existent path. Plugin-bundled templates from `templates/` will be used.

Pass `PATH_TYPE` into Phase 1 and all subsequent phases. All tier templates (`fast-template.md`, `standard-template.md`, `deep-template.md`) must consult `public-fallback.md` for CLAUDE.md generation and archetype file sourcing when `PATH_TYPE = public`.

## Phase 1: Detect Tier + Archetype

Read `skills/bootstrap/intensity-heuristic.md` and execute the tier + archetype recommendation algorithm.

Inputs to the heuristic:
1. **User's first prompt** — the message that triggered this skill (most important signal)
2. **Repo name** — `basename $(git rev-parse --show-toplevel)` (secondary signal)
3. **Existing files** — `ls -la` of repo root (presence of `package.json`, `pyproject.toml`, etc. shifts archetype)
4. **$ARGUMENTS flags** — if `--fast`, `--standard`, or `--deep` is present, skip heuristic and use the specified tier directly

Output from Phase 1:
- `RECOMMENDED_TIER` = `fast` | `standard` | `deep`
- `RECOMMENDED_ARCHETYPE` = `static-html` | `node-minimal` | `nextjs-minimal` | `python-uv` | `null`
- `HEURISTIC_REASON` = one-sentence explanation of why this tier was chosen (shown to user)
- `PATH_TYPE` = `private` (plan-baseline-path configured and path exists) | `public` (no baseline)

**Detecting PATH_TYPE:** Already determined in Phase 0.5 — use the stored `PATH_TYPE` value. Do not re-run detection.

**Fast tier:** `RECOMMENDED_ARCHETYPE` is always `null`. No stack selection needed.

## Phase 2: Present Tier Confirmation (One Question)

Present exactly one `AskUserQuestion` unless:
- `$ARGUMENTS` includes `--fast`, `--standard`, or `--deep` (tier pre-selected, skip question)
- `--retroactive` flag (no scaffolding at all, skip to Phase 4)

```
AskUserQuestion({
  questions: [{
    question: "Leeres Repo erkannt. Basierend auf '<HEURISTIC_REASON>' empfehle ich **<RECOMMENDED_TIER>**. Passt das?",
    header: "Bootstrap",
    options: [
      { label: "<RECOMMENDED_TIER> (Empfohlen)", description: "<one-line description of what this tier scaffolds>" },
      { label: "fast", description: "Nur CLAUDE.md + .gitignore + README. Für Demos, Spikes, Playgrounds." },
      { label: "standard", description: "Fast + package.json/Manifest + TypeScript + Linting + Tests. Für MVPs und echte Produkte." },
      { label: "deep", description: "Standard + CI + CODEOWNERS + CHANGELOG. Für Production, Team, Langlebige Repos." },
      { label: "Abbrechen", description: "Bootstrap abbrechen. Das ursprüngliche Kommando wird ebenfalls abgebrochen." }
    ],
    multiSelect: false
  }]
})
```

If user selects "Abbrechen": stop. Report "Bootstrap abgebrochen. Kein Kommando wird ausgeführt." Do not continue.

Store confirmed tier as `CONFIRMED_TIER`.

### Optional Second Question (Public Path + Standard/Deep + Ambiguous Archetype Only)

If ALL of the following are true:
1. `PATH_TYPE = public`
2. `CONFIRMED_TIER` is `standard` or `deep`
3. `intensity-heuristic.md` returned `ARCHETYPE_CONFIDENCE = low` (truly ambiguous)

Then ask one more question — and only then:

```
AskUserQuestion({
  questions: [{
    question: "Welchen Tech-Stack soll ich für das Grundgerüst verwenden?",
    header: "Archetype",
    options: [
      { label: "node-minimal", description: "package.json + TypeScript + Vitest. Für CLIs, Tools, Libraries." },
      { label: "nextjs-minimal", description: "Next.js bare setup. Für Web Apps, SaaS, Fullstack." },
      { label: "static-html", description: "HTML/CSS/JS, kein Build-Step. Für Animationen, Landingpages, Visualisierungen." },
      { label: "python-uv", description: "pyproject.toml + uv + pytest. Für Python Scripts, APIs, ML." }
    ],
    multiSelect: false
  }]
})
```

Store as `CONFIRMED_ARCHETYPE`. Maximum interactions in bootstrap flow: **2 questions total**.

## Upgrade Flow (`--upgrade <tier>`)

Entered when `$ARGUMENTS` contains `--upgrade <tier>`. No scaffolding questions are asked.

**Steps:**

1. **Read existing lock.** Read `.orchestrator/bootstrap.lock`. If missing, abort with: `Error: No bootstrap.lock found. Run /bootstrap first to bootstrap this repo.`

2. **Parse current and target tier.**
   - `CURRENT_TIER` = value of `tier:` field in the lock file.
   - `TARGET_TIER` = the `<tier>` argument supplied after `--upgrade`.
   - Valid values for both: `fast` | `standard` | `deep`.

3. **Refuse downgrade.** Tier order: `fast < standard < deep`. If `TARGET_TIER` ranks lower than or equal to `CURRENT_TIER`, abort with:
   `Error: Cannot downgrade from <CURRENT_TIER> to <TARGET_TIER>. Upgrade path is one-directional (fast → standard → deep).`
   Exit non-zero.

4. **Compute delta.** Determine which files the target tier adds over the current tier:
   - `fast → standard`: all Standard-tier files (`package.json`/`pyproject.toml`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, `tests/`, `src/`)
   - `standard → deep`: all Deep-tier files (CI pipeline, `CODEOWNERS`, `CHANGELOG.md`, issue templates, MR/PR template, branch protection)
   - `fast → deep`: union of both deltas (apply Standard first, then Deep)

5. **Check idempotency.** For each file in the delta, skip if it already exists on disk. Only write files that are absent. This makes the operation safe to run twice.

6. **Apply delta files.** Execute only the relevant template steps for the missing files. Read the appropriate template (`standard-template.md` and/or `deep-template.md`) and execute ONLY the steps that produce the delta files. Do NOT re-run already-completed steps.

7. **Update bootstrap.lock atomically.** Overwrite `.orchestrator/bootstrap.lock` with `tier: <TARGET_TIER>`. Preserve `archetype`, `timestamp` (update to now), and `source` from the existing lock.

8. **Commit.** Stage only the delta files that were just written and commit:
   ```bash
   # DELTA_FILES must be populated with the explicit list of files written in step 6
   for _f in "${DELTA_FILES[@]}"; do
     [[ -e "$_f" ]] && git add -- "$_f"
   done
   git commit -m "chore: bootstrap upgrade to <TARGET_TIER>"
   ```

9. **Report.** Print a one-line summary: `Bootstrap upgraded from <CURRENT_TIER> to <TARGET_TIER>. <N> files added.`

---

## Retroactive Flow (`--retroactive`)

Entered when `$ARGUMENTS` contains `--retroactive`. No scaffolding changes are made — only the lock file is written.

**Purpose:** Adopt an existing repo that already has `CLAUDE.md` + `## Session Config` but was bootstrapped manually (no `bootstrap.lock`). Writes the lock so the gate passes on all future invocations.

**Steps:**

1. **Verify preconditions.** Confirm `CLAUDE.md` (or `AGENTS.md`) exists and contains `## Session Config`. If not, abort: `Error: CLAUDE.md with Session Config required for retroactive bootstrap.`

2. **Check lock not already present.** If `.orchestrator/bootstrap.lock` already exists and has valid `version` + `tier` fields, report: `bootstrap.lock already present (tier: <tier>). Nothing to do.` and exit 0 (idempotent).

3. **Infer tier from file inventory.** Examine the repo root:

   | Condition (evaluated in order) | Inferred Tier |
   |---|---|
   | CI file present (`.gitlab-ci.yml` OR `.github/workflows/`) AND `CHANGELOG.md` present | `deep` |
   | Package manifest present (`package.json` OR `pyproject.toml`) | `standard` |
   | Neither of the above | `fast` |

   Store as `INFERRED_TIER`.

4. **Infer archetype.** Best-effort detection from existing files:
   - `pyproject.toml` present → `python-uv`
   - `package.json` with `next` in dependencies → `nextjs-minimal`
   - `package.json` without `next` → `node-minimal`
   - No manifest → `null`

   Store as `INFERRED_ARCHETYPE`.

5. **Write bootstrap.lock.** Create `.orchestrator/` if needed, then write:
   ```yaml
   # .orchestrator/bootstrap.lock
   version: 1
   tier: <INFERRED_TIER>
   archetype: <INFERRED_ARCHETYPE or null>
   timestamp: <current ISO 8601 UTC>
   source: retroactive
   ```

6. **Commit.** Stage lock file only and commit:
   ```bash
   mkdir -p .orchestrator
   git add .orchestrator/bootstrap.lock
   git commit -m "chore: bootstrap lock (retroactive)"
   ```

7. **Report.** Print: `Retroactive bootstrap complete. Lock written (tier: <INFERRED_TIER>, source: retroactive). No files were changed.`

---

## Phase 3: Dispatch to Template

Based on `CONFIRMED_TIER`, read and execute the corresponding template file:

| Tier | Template File |
|------|--------------|
| `fast` | `skills/bootstrap/fast-template.md` |
| `standard` | `skills/bootstrap/standard-template.md` |
| `deep` | `skills/bootstrap/deep-template.md` |

Pass the following context into the template execution:
- `CONFIRMED_TIER`
- `CONFIRMED_ARCHETYPE`
- `PATH_TYPE`
- `REPO_ROOT` = `$(git rev-parse --show-toplevel)`
- `REPO_NAME` = `$(basename "$REPO_ROOT")`
- `PLATFORM` = detected platform from `skills/_shared/platform-tools.md`

Follow the template's instructions precisely. The template is responsible for creating all files and the initial git commit.

**Platform note for CLAUDE.md generation:**
When `PATH_TYPE = public`, read `skills/bootstrap/public-fallback.md` for the full platform-specific CLAUDE.md generation logic (claude init path for Claude Code; `_minimal` template synthesis for Codex/Cursor). When `PATH_TYPE = private`, use the baseline scripts at `$BASELINE_PATH`.

## Phase 4: Write bootstrap.lock

After all template files are written and committed, write `.orchestrator/bootstrap.lock`:

```yaml
# .orchestrator/bootstrap.lock
version: 1
tier: <CONFIRMED_TIER>
archetype: <CONFIRMED_ARCHETYPE or null>
timestamp: <current ISO 8601 UTC timestamp>
source: <projects-baseline | plugin-template | claude-init>
```

Determine `source`:
- `projects-baseline` if `PATH_TYPE = private` and baseline scripts were used
- `claude-init` if `claude init` was used successfully on Claude Code
- `plugin-template` otherwise

The template's initial git commit includes `bootstrap.lock`. If the template already wrote the lock file (as `fast-template.md` does), skip this step — the lock is already committed.

## Phase 5: Resume

Report bootstrap completion with a one-line summary:

```
Bootstrap complete (tier: <tier>, archetype: <archetype or "none">). Resuming <original command>…
```

If invoked transitively: return control to the originating skill. The original skill resumes from its Phase 1.
If invoked directly via `/bootstrap`: report the created files list and stop.

## Critical Rules

- **NEVER create application code during bootstrap** — only structural files (CLAUDE.md, .gitignore, README.md, manifests, CI). The feature that follows brings its own implementation.
- **NEVER skip the lock file write** — `.orchestrator/bootstrap.lock` is the gate's mechanical truth. Bootstrap without a lock file is incomplete.
- **NEVER ask more than 2 questions** — even if the user's intent is unclear, make a best-effort recommendation and let the user correct via `/bootstrap --upgrade` later.
- **ALWAYS commit** — bootstrap ends with a git commit. The lock file is part of that commit.
- **ALWAYS check for retroactive flag** — if `--retroactive` is in `$ARGUMENTS`, skip all scaffolding and jump directly to writing `bootstrap.lock` (tier inferred from existing file inventory, fallback: `fast`).
