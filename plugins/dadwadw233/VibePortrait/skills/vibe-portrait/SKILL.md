---
name: "vibe-portrait"
description: "Developer personality portrait generator. Supports subcommands: (1) 'generate my portrait' / 'analyze my personality' — full analysis; (2) 'update my portrait' — incremental update since last analysis; (3) 'install persona from <url>' — install community persona from GitHub; (4) 'list personas' / '我安装了哪些人格' — show installed; (5) 'remove persona <id>' — uninstall; (6) 'think like <name>' / '像<name>一样思考' — activate a persona. Also triggers on 'vibe-portrait', 'what kind of developer am I'."
---

# Vibe Portrait

Developer personality portrait generator with subcommands.

## Command routing

Determine which subcommand the user wants based on their message:

| Trigger | Action |
|---------|--------|
| "generate my portrait" / "analyze my personality" / just "/vibe-portrait" | → **Generate** (full analysis, Steps 0-8) |
| "update my portrait" / "update portrait" / "更新我的画像" | → **Update** (incremental, see Update section) |
| "install persona from \<url\>" / "安装人格 \<url\>" | → **Install** (see Persona Management) |
| "list personas" / "我安装了哪些人格" | → **List** (see Persona Management) |
| "remove persona \<id\>" / "删除人格 \<id\>" | → **Remove** (see Persona Management) |
| "think like \<name\>" / "像\<name\>一样思考" | → **Activate** (load the persona skill, not handled here — Claude auto-activates from the installed skill) |

If ambiguous, ask the user which action they want.

---

## Generate (full analysis)

## Step 0: Ask analysis mode

Before reading any data, ask the user which analysis mode they prefer:

> **How thorough should the analysis be?**
>
> 1. **⚡ Quick (cost-efficient)** — Sample ~200 messages. Fast, low token cost, good enough for most portraits.
> 2. **🔍 Full (comprehensive)** — Read ALL messages. Higher token cost, but captures every nuance and evolution of your personality. Best for users with long history who want maximum accuracy.

If the user doesn't respond or says "just do it" / "默认" / "whatever", default to **Quick mode**.

In **Quick mode**, follow the sampling strategy described in Step 1c.
In **Full mode**, read all lines from `history.jsonl` (and any imported files). Skip the sampling strategy entirely. If the file exceeds 3000 lines, still read in batches (e.g., 500 lines at a time) to avoid tool errors, but process every line.

## Step 1: Locate and read conversation data

### 1a: Local history

**Always read from ALL available sources regardless of which terminal the user is running.** A developer's personality is shaped by all their AI interactions, not just one tool.

Check and read from every source that exists:

| Source | Path | Message field |
|--------|------|---------------|
| Claude Code history | `~/.claude/history.jsonl` | `display` |
| Claude Code projects | `~/.claude/projects/**/*.jsonl` | `display` |
| Codex history | `~/.codex/history.jsonl` | `text` (also has `ts` unix timestamp) |
| Codex sessions | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` | filter `type=response_item` + `payload.role=user` → iterate `payload.content[]`, take items where `text` does NOT start with `<` (skip system-injected `<environment_context>`, `<permissions>` etc.) |

Merge all messages from all sources into one pool before sampling. Use `ts` timestamps (Codex history) or `timestamp` (Codex sessions) for chronological sorting when available.

### 1b: Multi-machine sync via Git repo

Vibe Portrait uses a **private GitHub repo** to sync persona data across machines. This is the recommended approach for users with multiple development machines.

**First-time setup (if no portrait repo exists yet):**

After analysis is complete (Step 7), the skill will offer to create a private repo. See Step 7 for details.

**If the user already has a portrait repo:**

Ask the user for their portrait repo URL, or check if `~/.vibe-portrait-repo` exists (a file containing the repo URL, written during first-time setup).

```bash
# Check for existing repo config
cat ~/.vibe-portrait-repo 2>/dev/null
```

If found, clone or pull the repo into a temp directory:
```bash
# Clone if not already local
REPO_URL=$(cat ~/.vibe-portrait-repo)
REPO_DIR=~/.cache/vibe-portrait-sync
git clone "$REPO_URL" "$REPO_DIR" 2>/dev/null || (cd "$REPO_DIR" && git pull)
```

Then load existing analysis files from `$REPO_DIR/analysis/*.json`. When merging with the current machine's analysis:
- Each machine's analysis is stored as a separate JSON file: `analysis/{hostname}-{date}.json`
- To merge: average the numeric scores across all machine analyses, weighted by message count
- Union all quotes (deduplicate by text)
- Union all detected domains and tools
- The persona skill (`me/SKILL.md`) is always regenerated from the merged result

**If the user provides a `.jsonl` file directly (fallback):**

Read it as a supplementary source. Merge messages from all sources before sampling:
- Deduplicate messages with identical `display` content
- If timestamps are available, sort merged messages chronologically
- Treat all sources equally

### 1c: Read strategy

Use a bash command to count total lines first:
```bash
wc -l ~/.claude/history.jsonl
```

**Quick mode (default):** Sample strategically:
- Read the **first 50 lines** (early personality)
- Read the **last 100 lines** (current personality)
- Read **50 random lines from the middle** (evolution)
- Total: ≤200 messages per source file

**Full mode:** Read all lines. For large files (>500 lines), read in batches of 500 lines using offset/limit to avoid tool errors. Process every message.

**Parse each line as JSON and extract the `display` field.** Skip lines where `display` is empty, null, or a slash command (starts with `/`).

**Minimum threshold:** If fewer than 20 non-empty messages are found across all sources, inform the user that there isn't enough data for a meaningful portrait. Suggest they try again after more conversations.

## Step 2: Analyze across six dimensions

Read the analysis framework for detailed signal definitions:
→ `references/analysis-framework.md`

Analyze across six dimensions: Communication Style, Technical Breadth, Technical Depth, Decision Patterns, Collaboration Style, Work Rhythm. See the reference file for detailed signal definitions.

**Language detection (for i18n)**: if >50% of sampled messages are in Chinese, set `meta.lang = "zh"`. Otherwise `"en"`. This determines the portrait page language.

**For each dimension, produce:** a score (0-100), a one-line summary, and 2-3 evidence quotes (keep quotes short, anonymize sensitive content).

## Step 3: Compute personality type, rating, and famous match

### 3.1 MBTI Mapping
Read: → `references/mbti-mapping.md`

Map observed signals to four axes:
- **E/I**: delegation breadth vs self-reliance
- **S/N**: implementation focus vs architecture focus
- **T/F**: logic-driven vs people-aware
- **J/P**: structured planning vs exploratory iteration

Each axis: 0-100 score. Letter determined by which side of 50.

### 3.2 Developer Rating
Read: → `references/rating-rubric.md`

Rate on a six-tier scale (provide BOTH `label` for Chinese and `labelEn` for English):

| Tier | label (zh) | labelEn (en) | Emoji |
|------|-----------|--------------|-------|
| S+ | 夯爆了 | Legendary | 👑 |
| S | 夯 | Elite | 💎 |
| A | 人上人 | Above Average | ⭐ |
| B | NPC | NPC | 🤖 |
| C | 拉 | Below Average | 😅 |
| D | 拉完了 | Inactive | 💀 |

Always include strength highlights AND growth areas, even for top-tier ratings.

### 3.3 Famous Person Match
Read: → `references/famous-matching.md`

Match the user across 3 independent dimensions (Technical Spirit / Strategic Mind / Communication Soul), each picking a different historical or contemporary figure. No predefined list — the AI uses its own knowledge. See reference file for rules and anti-bias constraints.

## Step 4: Generate the portrait HTML

Read the HTML template:
→ `templates/portrait.html`

The template contains a `PORTRAIT_DATA` JavaScript object near the top of the `<body>`. Replace the ENTIRE `PORTRAIT_DATA` object with the computed data. The structure is:

```javascript
const PORTRAIT_DATA = {
  meta: {
    username: "...",         // infer from system username or ask
    generatedAt: "...",      // today's date
    messageCount: 0,         // actual count of sampled messages
    dateRange: "...",        // earliest to latest message date
    confidence: "...",       // "Early Sketch" / "Clear Portrait" / "Deep Portrait"
    lang: "..."              // "zh" if user's messages are predominantly Chinese, otherwise "en"
  },
  personality: {
    mbtiType: "XXXX",
    axes: {
      EI: { score: 0, letter: "X", label: "..." },
      SN: { score: 0, letter: "X", label: "..." },
      TF: { score: 0, letter: "X", label: "..." },
      JP: { score: 0, letter: "X", label: "..." }
    },
    summary: "..."
  },
  radar: {
    technicalDepth: 0,
    technicalBreadth: 0,
    communication: 0,
    decisionSpeed: 0,
    collaboration: 0,
    creativity: 0
  },
  rating: {
    tier: "...",
    label: "...",             // Chinese label: 夯爆了/夯/人上人/NPC/拉/拉完了
    labelEn: "...",           // English label: Legendary/Elite/Above Average/NPC/Below Average/Inactive
    emoji: "...",
    color: "...",
    reason: "...",
    strengthHighlights: [],
    growthAreas: []
  },
  famousMatch: {
    technical: {
      name: "...", emoji: "...",
      dimension: "Technical Spirit", dimensionZh: "技术灵魂",
      reason: "...", sharedTraits: []
    },
    strategic: {
      name: "...", emoji: "...",
      dimension: "Strategic Mind", dimensionZh: "思维内核",
      reason: "...", sharedTraits: []
    },
    communication: {
      name: "...", emoji: "...",
      dimension: "Communication Soul", dimensionZh: "表达人格",
      reason: "...", sharedTraits: []
    }
  },
  communication: {
    languages: {},
    directnessScore: 0,
    avgMessageLength: 0,
    topKeywords: [],
    questionRatio: 0
  },
  technical: {
    domains: {},
    topTools: []
  },
  workRhythm: {
    hourlyActivity: [/* 24 integers, one per hour */],
    sessionPattern: "...",
    avgSessionLength: "...",
    projectCount: 0
  },
  quotes: [
    { text: "...", context: "..." }
    // 3-5 representative quotes
  ]
};
```

**IMPORTANT:**
- Replace ONLY the `PORTRAIT_DATA` object. Do not modify any other part of the template.
- All values must be valid JavaScript (strings quoted, arrays bracketed, no trailing commas).
- The rest of the template's JavaScript will automatically render everything from this object.
- Keep quote texts under 100 characters. Anonymize any sensitive data (API keys, tokens, passwords, personal URLs).

## Step 5: Generate persona skill

Read the persona skill template:
→ `references/persona-skill-template.md`

Generate a **multi-file** persona skill. Read the template for the full structure:
→ `references/persona-skill-template.md`

Create the following files under `~/.claude/skills/vibe-portrait-personas/me/`:

```
me/
├── SKILL.md                        # Entry point (~80 lines)
├── portrait-meta.json              # Timestamps for incremental updates
└── references/
    ├── thinking-patterns.md        # From: technical depth + decision patterns
    ├── decision-framework.md       # From: decision patterns + collaboration style
    ├── communication-style.md      # From: communication style analysis
    ├── engineering-philosophy.md   # From: technical depth + breadth + anti-patterns
    └── mindset-markers.md          # Abstracted attitudes (NO raw quotes)
```

**`portrait-meta.json` is critical** — it stores `lastMessageIndex` (line count of history.jsonl at analysis time) and `updatedAt` timestamp. These enable the **update** subcommand to do incremental analysis later.

Create directories if they don't exist. `me/` is reserved for the user's own persona.

## Step 6: Write output files

Write the following files to the current working directory:

**1. HTML Portrait:**
```
vibe-portrait-YYYY-MM-DD.html
```

**2. Portrait Image (auto-export):**

After writing the HTML, attempt to generate a PNG screenshot of the portrait. Try these methods in order:

- **If Playwright MCP is available** (check for `playwright_navigate` and `playwright_screenshot` tools):
  1. Navigate to the local HTML file: `file:///absolute/path/to/vibe-portrait-YYYY-MM-DD.html`
  2. Wait for charts to render (2-3 seconds)
  3. Take a full-page screenshot, save as `vibe-portrait-YYYY-MM-DD.png`

- **If Playwright is not available**, try bash:
  ```bash
  # Try with npx playwright if installed
  npx --yes playwright screenshot --full-page "file://$(pwd)/vibe-portrait-YYYY-MM-DD.html" "vibe-portrait-YYYY-MM-DD.png" 2>/dev/null
  ```

- **If neither works**, skip silently. Tell the user they can use the "Export as Image" button on the HTML page instead.

**3. Analysis JSON** (for sync/merge):
```
vibe-portrait-analysis-YYYY-MM-DD.json
```

Contents:
```json
{
  "version": "1.0",
  "machine": "<hostname from `hostname` command>",
  "exportedAt": "YYYY-MM-DD",
  "sourceFiles": ["~/.claude/history.jsonl"],
  "messageCount": 200,
  "portraitData": { /* the full PORTRAIT_DATA object */ }
}
```

**3. Persona skill** (also written in Step 5):
```
~/.claude/skills/vibe-portrait-personas/me/SKILL.md
```

## Step 7: Sync to portrait repo

After writing all output files, ask the user:

> **Sync to your portrait repo?**
>
> 1. **Yes — create a new repo** (first time)
> 2. **Yes — push to existing repo**
> 3. **No — keep everything local**

### Option 1: Create new portrait repo

1. Check `gh auth status`. If not authenticated, tell user to run `! gh auth login`.
2. Copy `repo-template/` contents into a temp directory.
3. Copy the generated analysis JSON, HTML portrait, and persona skill into the temp directory under `analysis/`, `portraits/`, and `me/` respectively.
4. **Fill in the README.md** — the template contains `{{PLACEHOLDER}}` markers. Read `repo-template/README.md` (see the file for the full list of placeholders) and replace them all with the user's analysis data. Key formatting rules:
   - Badge lists → inline code: `` `item1` `item2` ``
   - Domain bars → Unicode blocks: `**ML/AI** ██████████████░░░░░░ 30%` (20 chars wide, `█` filled, `░` empty)
   - Quotes → blockquotes: `> "text" — *context*`
   - Language breakdown → `"Chinese 65% · English 30% · Mixed 5%"`
5. `git init && git add -A && git commit -m "Initial portrait"`
6. `gh repo create my-vibe-portrait --private --source=. --push`
7. Save repo URL: `gh repo view --json url -q '.url' > ~/.vibe-portrait-repo`

### Option 2: Push to existing repo

1. Read repo URL from `~/.vibe-portrait-repo`.
2. Clone (or pull if already cached at `~/.cache/vibe-portrait-sync`).
3. Copy the latest analysis JSON, HTML, and persona skill into the repo directory.
4. Regenerate `README.md` using the same placeholder-filling process as Option 1.
5. `git add -A && git commit -m "Update portrait from $(hostname)" && git push`

### Option 3: Keep local

Do nothing. Files are already written locally.

## Step 8: Present results

Tell the user:
1. Where the HTML portrait was saved (open in browser)
2. Where the persona skill was installed (`~/.claude/skills/vibe-portrait-personas/me/`)
3. Whether the portrait repo was synced (and the repo URL if applicable)
4. A brief summary of key findings (MBTI type, rating, famous match)
5. How to use the persona: **"think like me"** or **"像我一样思考"**
6. How to sync from another machine: install vibe-portrait there, run it, choose "push to existing repo"

## Confidence levels

Based on total non-empty messages found:
- **< 20**: Do not generate. Tell user to accumulate more history.
- **20-50**: Generate with `confidence: "Early Sketch"`. Warn that results are approximate.
- **50-200**: Generate with `confidence: "Clear Portrait"`.
- **200+**: Generate with `confidence: "Deep Portrait"`.

## Output contract

This skill produces THREE outputs:

### 1. HTML Portrait (`vibe-portrait-YYYY-MM-DD.html`)
- Single self-contained file (only external dependencies: Tailwind CDN + Chart.js CDN)
- Opens correctly in any modern browser
- Contains all analysis data in the `PORTRAIT_DATA` JavaScript object
- Includes actual quotes (anonymized for sensitive content)

### 2. Persona Skill (`~/.claude/skills/vibe-portrait-personas/me/SKILL.md`)
- Valid Claude Code / Codex skill file with proper YAML frontmatter
- Under 200 lines, dense and actionable
- Activates on "think like me" / "像我一样思考" and similar phrases
- Captures thinking patterns, decision framework, communication style, engineering philosophy

### 3. Analysis JSON (`vibe-portrait-analysis-YYYY-MM-DD.json`)
- Portable data file for cross-machine syncing
- Contains full PORTRAIT_DATA plus machine hostname and export metadata
- Synced to portrait repo (if configured) or kept local

### 4. Portrait Repo (optional, private GitHub repo)
- Created via `gh repo create my-vibe-portrait --private`
- Stores persona skill, analysis JSONs from all machines, and latest portrait
- Repo URL cached in `~/.vibe-portrait-repo` for future syncs
- Template provided in `repo-template/` within this skill

## Privacy rules (CRITICAL — read before generating ANY output)

All outputs of VibePortrait (HTML, persona skill, analysis JSON, repo README) are potentially shareable. Apply these rules to **every file you write**:

### What MUST be redacted
- **API keys, tokens, passwords, secrets** → replace with `[REDACTED]`
- **URLs containing credentials** (tokens in query strings, auth headers) → redact the credential portion
- **File paths exposing personal info** (`/home/username/`, `/Users/realname/`) → replace with `~/` or `<home>/`
- **Email addresses, phone numbers, IPs** → redact unless the user explicitly consents
- **Private repo URLs, internal hostnames** → redact

### What MUST NOT appear in persona skills
- **No verbatim chat messages.** Persona reference files must contain only abstracted personality descriptions, never raw conversation text.
- **No project names, company names, or colleague names** from the user's conversations
- **No financial data** (account balances, trading strategies, PnL numbers)
- **No credentials or deployment details** (server IPs, Docker configs, database names)

### What is OK
- Abstracted personality traits, thinking patterns, communication style descriptions
- Generic domain labels ("ML/AI", "Web", "Systems/Infra")
- Tool/framework names (public knowledge: "PyTorch", "Docker", "React")
- MBTI scores, radar scores, rating tier (all computed, not raw data)

### Before pushing to git repo
Scan all files being committed for the redaction patterns above. If any slip through, fix before pushing.

## Anti-patterns

- **Do not fabricate data.** If you can't determine a signal, use a neutral score (50).
- **Do not read files beyond conversation history.** No source code, private documents, SSH keys.
- **Do not skip the template.** Always use `templates/portrait.html` as the base.
- **Do not read all history lines in Quick mode.** Use the sampling strategy.

## Reference files

`references/analysis-framework.md` · `references/mbti-mapping.md` · `references/famous-matching.md` · `references/rating-rubric.md` · `references/persona-skill-template.md` · `templates/portrait.html` · `repo-template/`

## Update (incremental analysis)

When the user says "update my portrait" / "更新我的画像":

1. Read `~/.claude/skills/vibe-portrait-personas/me/portrait-meta.json`.
   - If it doesn't exist, tell the user to run a full generate first.
2. Get `lastMessageIndex` from the meta file.
3. Count current lines in `~/.claude/history.jsonl`.
4. If no new messages since last analysis, tell the user "Portrait is up to date."
5. Otherwise, read only the **new messages** (from line `lastMessageIndex+1` to end).
6. Analyze the new messages across the same 6 dimensions.
7. **Merge** with existing analysis: weighted average of scores by message count (old weight = `totalMessagesAnalyzed`, new weight = new message count).
8. Regenerate: HTML portrait, all persona reference files, portrait-meta.json (update `updatedAt`, `lastMessageIndex`, `totalMessagesAnalyzed`).
9. If portrait repo exists, push the update.

This is much cheaper than a full re-analysis — typically only processes dozens of new messages.

---

## Persona Management

### Install from GitHub

Trigger: "install persona from \<url\>"

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 "<url>" "$TEMP_DIR"
PERSON_ID=$(grep -m1 'personaId' "$TEMP_DIR/me/portrait-meta.json" | sed 's/.*: *"\(.*\)".*/\1/' )
# Fallback: infer from GitHub username
TARGET=~/.claude/skills/vibe-portrait-personas/$PERSON_ID
cp -R "$TEMP_DIR/me" "$TARGET"
rm -rf "$TEMP_DIR"
```

Confirm: where installed + how to invoke (`think like {person-id}`).

### List

Trigger: "list personas" / "我安装了哪些人格"

```bash
ls ~/.claude/skills/vibe-portrait-personas/
```

For each directory, read `portrait-meta.json` and show: name, MBTI type, rating, last updated.

### Remove

Trigger: "remove persona \<id\>"

```bash
rm -rf ~/.claude/skills/vibe-portrait-personas/<id>
```

Confirm before deleting. Refuse to delete `me/` — tell user to run generate to overwrite instead.

### Directory layout

```
~/.claude/skills/vibe-portrait-personas/
├── me/                        ← yours (multi-file, auto-generated)
│   ├── SKILL.md
│   ├── portrait-meta.json
│   └── references/
│       ├── thinking-patterns.md
│       ├── decision-framework.md
│       ├── communication-style.md
│       ├── engineering-philosophy.md
│       └── mindset-markers.md
├── jane-doe/                  ← installed from GitHub
│   ├── SKILL.md
│   ├── portrait-meta.json
│   └── references/...
└── zhuge-liang/               ← installed from community
    └── ...
