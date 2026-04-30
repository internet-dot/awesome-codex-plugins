---
name: readme
description: 'Draft or improve README docs.'
---
# $readme — Gold-Standard README Generation

> **Purpose:** Generate a README that converts skimmers into users and satisfies deep readers — then validate it with a council.

**YOU MUST EXECUTE THIS WORKFLOW. Do not just describe it.**

## Quick Start

```bash
$readme                    # Interview + generate + validate (new README)
$readme --rewrite          # Rewrite existing README with same patterns
$readme --validate         # Council-validate an existing README without rewriting
```

---

## The Patterns

These are non-negotiable. Every README this skill produces follows them.

### 1. Lead with the problem, not the framework

Bad: "A DevOps layer implementing the Three Ways for agent workflows."
Good: "Coding agents forget everything between sessions. This fixes that."

The reader should understand what pain you solve in one sentence. No jargon, no framework names, no theory. The problem is the hook. (Note: framework references like Three Ways and Meadows belong in the body as design rationale — just don't lead with them.)

### 2. Acknowledge prior art

If your approach resembles established practices (agile, SCRUM, spec-driven development, CI/CD), say so explicitly:

> "If you've done X, you already know the fix. What's new is Y."

This disarms experienced practitioners who would otherwise dismiss you as reinventing the wheel. Claim only what's genuinely novel.

### 3. Show, don't claim

Bad: "This is what makes X different. The system compounds."
Good: A terminal transcript showing the system working.

Assertions without evidence trigger hostility. Concrete examples > adjectives. If you can't show it in a code block, it's not ready for the README.

### 4. State your differentiator once

One clear explanation. One demonstration. That's the max. Repeating your core value proposition in every section crosses from reinforcement into marketing copy. Trust the reader to absorb it the first time.

### 5. Trust block near install

Before a user installs anything that runs code, hooks, or modifies config, they need to see:

| Concern | Answer it |
|---------|-----------|
| What does it touch? | Files created/modified, hooks registered |
| Does it exfiltrate? | Telemetry, network calls, data leaving the machine |
| Permission surface | Shell commands, config changes, git behavior modifications |
| Reversibility | How to disable instantly, how to uninstall completely |

This goes near the install command, not buried in an FAQ.

### 6. Collapse depth, don't delete it

Detailed workflow steps, architecture deep-dives, theory, and reference material belong in `<details>` blocks. Skimmers get the fast path. Deep readers click to expand. Never delete depth to achieve brevity — collapse it.

### 7. Strip guru tone

No "What N months taught me." No "I come from X, so I applied Y." No "This is what makes us different." Let the tool speak for itself. Humility disarms. Condescension repels.

### 8. Section order serves adoption

```
Problem → Install → See It Work → Getting Started Path → How It Works (collapsed) → Reference
```

Theory and architecture come AFTER the user has seen examples and knows how to start. Never put "why this is important" before "how to try it."

---

## Execution Steps

Given `$readme [--rewrite] [--validate]`:

### Step 1: Pre-flight

```bash
ls README.md 2>/dev/null
```

**Mode detection:**
- `--validate` + README exists → skip to Step 5 (council validation only)
- `--rewrite` + README exists → read existing, use as context for rewrite
- README exists, no flags → ask:
  - "Rewrite — regenerate with gold-standard patterns"
  - "Validate — council-check the existing README"
  - "Cancel"
- No README exists → proceed to Step 2 (generate from scratch)

### Step 2: Gather Context

Read available project files silently (no output to user):

```bash
ls README.md PRODUCT.md package.json pyproject.toml go.mod Cargo.toml Makefile 2>/dev/null
ls -d src/ lib/ cmd/ app/ 2>/dev/null
ls -d docs/ 2>/dev/null
ls LICENSE CHANGELOG.md 2>/dev/null
```

Extract:
- **Project name** from manifest files
- **Language/runtime** from build files
- **Existing description** from README or PRODUCT.md
- **License** from LICENSE file
- **Install method** from manifest (npm, pip, brew, go install, cargo, etc.)

### Step 3: Interview

Ask the user about each section. Pre-populate suggestions from Step 2 where possible. Keep questions short.

#### 3a: The Problem

Ask: "What problem does this solve? One sentence — what pain does your user have?"

Options (derived from existing README/PRODUCT.md if available):
- Suggested problem statement
- A punchier variant
- "Let me type my own"

#### 3b: The Fix

Ask: "How does it fix that problem? One sentence — what does your tool actually do?"

#### 3c: Who Is It For

Ask: "Who is this for? Name the runtime, framework, or role."

Example: "Python developers using FastAPI" or "Anyone running Codex or Cursor"

#### 3d: Install

Ask: "What's the install command? (We'll put this front and center)"

Options:
- Detected from manifest (e.g., `npm install <pkg>`, `pip install <pkg>`)
- "Let me type my own"

#### 3e: Quick Demo

Ask: "What's the simplest thing a user can do after installing to see it work? (A command, a code snippet, or a terminal session)"

#### 3f: Trust Concerns

Ask: "Does your tool do any of these? Check all that apply."
- Runs shell commands or hooks
- Modifies config files outside the project
- Makes network calls
- Creates files in the user's repo
- None of the above

#### 3g: Prior Art (optional)

Ask: "Are there similar tools? If so, how is yours different? (Be honest — readers who know the space will check)"

Options:
- "Yes, let me describe" → follow up
- "Not really / I'll skip this"

### Step 4: Generate README

Using the interview responses and the 8 patterns above, generate the README with this structure:

```markdown
<div align="center">

# {Project Name}

### {Problem statement — one line}

{Badges}

{Nav links}

</div>

---

> [!IMPORTANT]
> {Trust block — local-only, what it touches, how to disable, how to uninstall}
> (Skip if no trust concerns from 3f)

{Install command}

---

## The Problem

{2-3 sentences expanding the problem. Acknowledge prior art if applicable.
State what's genuinely new about your approach — once.}

---

## See It Work

{Terminal transcript or code example from 3e. Show, don't describe.}

---

## Install

{Full install details, alternative methods in <details> blocks.
"What it touches" table if trust concerns exist.}

---

## Getting Started

{Adoption path — Day 1, Week 1, etc. Or just "Run X, then Y."}

---

## How It Works

{One paragraph summary + diagram if applicable.}

<details>
<summary><b>Details</b> — {phases, architecture, etc.}</summary>

{Deep content here}

</details>

---

## {Reference sections as needed}

{Skills, API, CLI, etc. — collapsed where appropriate}

---

## FAQ

{Top 3 questions inline, link to full FAQ if it exists}

---

## Contributing

## License
```

**Generation rules:**
- Every `<details>` block must have a blank line after `<summary>` (enables markdown rendering)
- Use markdown inside details blocks, not inline HTML (`<code>`, `<a href>`, `<br>`)
- Trailing blank line before `</details>`
- No emoji unless the user's existing content uses them
- Flywheel/differentiator concept: state ONCE in "The Problem", demonstrate ONCE in "See It Work"
- Never use phrases: "What N months taught me", "This is what makes X different", "I come from X so I applied Y"

Write the generated README to `README.md`.

### Step 5: Council Validation

Run a council to validate the README:

```
$council --quick validate README.md — is it clear, non-repetitive, and does it serve both skimmers and deep readers?
```

**If `--rewrite` or generating from scratch:** Use `--quick` (inline, fast).

**If `--validate` on existing README:** Use default council (2 judges) for thorough review.

Present the council findings to the user. If significant issues found, offer:
- "Fix — apply council recommendations automatically"
- "Show me — display findings, I'll decide"
- "Ship it — good enough"

### Step 6: Apply Fixes (if requested)

Apply council-recommended fixes. Re-validate with `--quick` to confirm.

### Step 7: Report

```
## README Complete

**File:** README.md
**Sections:** {count}
**Patterns applied:** {list which of the 8 patterns were relevant}
**Council verdict:** {PASS/WARN/FAIL}

{If WARN/FAIL: list the top findings and whether they were fixed}
```

---

## Anti-Patterns to Detect

When rewriting or validating, flag these:

| Anti-Pattern | Detection | Fix |
|-------------|-----------|-----|
| **Flywheel echo** | Core value prop stated 3+ times | State once, demonstrate once |
| **Framework-first** | Opens with methodology name, not problem | Rewrite lead as problem statement |
| **Guru tone** | "What I learned", "This is what makes X different" | Strip, let the tool speak |
| **Jargon before definition** | Domain terms used before they're explained | Define on first use or use plain language |
| **Buried trust info** | Security/permissions info below the fold | Move near install |
| **No visible uninstall** | Uninstall not findable within 10 seconds | Add near install block |
| **Install scatter** | Same install command in 3+ locations | One hero install, one canonical reference |
| **Theory before try** | Architecture/philosophy before examples | Reorder: examples first, theory in details |
| **Claim without evidence** | "Best", "different", "unique" without demo | Replace with concrete example or remove |

---

## Examples

### Generating a README from scratch for a new project

**User says:** `$readme`

**What happens:**
1. Pre-flight detects no existing README.md and proceeds to generate from scratch.
2. The skill reads project context (manifest files, source directories, license) and runs a short interview asking about the problem, the fix, the audience, install command, quick demo, and trust concerns.
3. A README is generated following all 8 gold-standard patterns (problem-first lead, trust block near install, collapsed depth, etc.) and validated by a quick council review.

**Result:** A complete `README.md` written to disk that converts skimmers into users and serves deep readers, with a council verdict confirming quality.

### Validating an existing README without changes

**User says:** `$readme --validate`

**What happens:**
1. Pre-flight confirms README.md exists and enters validate-only mode, skipping the interview and generation steps.
2. A full council review (2 judges) evaluates the README against the 8 patterns and the anti-pattern detection table (flywheel echo, guru tone, buried trust info, etc.).
3. Findings are presented with options to auto-fix, review manually, or ship as-is.

**Result:** A detailed council report identifying specific anti-patterns and structural issues in the existing README, with actionable fix suggestions.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Council validation step fails or hangs | The `$council` skill dependency is not installed or is broken | Run `$update` to reinstall all skills, then retry. Verify `$council` works independently |
| Generated README has no trust block | No trust concerns were selected during the interview (step 3f answered "None of the above") | If your tool does run hooks, modify config, or make network calls, re-run `$readme --rewrite` and select the applicable trust concerns |
| `<details>` blocks render as raw HTML on GitHub | Missing blank line after `<summary>` tag or before `</details>` | The skill enforces this formatting rule, but manual edits may break it. Ensure there is a blank line after every `<summary>...</summary>` line and before every `</details>` |
| Interview keeps asking questions the project manifest already answers | The manifest file format is not recognized by the context-gathering step | Ensure your project has a standard manifest (`package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`) in the repo root |
| Anti-pattern detection flags false positives on rewrite | Some content patterns trigger heuristic detection even when intentional | Review each finding during the council step and select "Ship it" for intentional choices. The detection is heuristic, not absolute |

## See Also

- `skills/product/SKILL.md` — PRODUCT.md generation (feeds into README context)
- `skills/doc/SKILL.md` — Code documentation (different scope — API docs, not README)
- `skills/council/SKILL.md` — Validation engine used in Step 5

## Local Resources

### scripts/

- `scripts/validate.sh`


