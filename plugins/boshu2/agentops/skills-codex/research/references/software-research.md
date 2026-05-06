
# research-software — Software Research

> **Rules:** Latest STABLE tag (not main). Filter to 2025-2026. Code > Docs. Skip Stack Overflow.

## Output First

Every research produces this structure:

```markdown
## [Tool] vX.Y.Z (YYYY-MM-DD)

**Repo:** github.com/org/repo @ abc123

### Commands
| Task | Command | Notes |
|------|---------|-------|

### Config
| Option | Default | Notes |
|--------|---------|-------|

### Env Vars
| Variable | Purpose |
|----------|---------|

### Gotchas
- [problem]: [fix]. Source: [PR/issue/code]

### Sources
- Code: [file:line]
- PRs: #123, #456
- Posts: [url]
```

---

## THE PROMPT

```
Research [TOOL] for [PURPOSE].
Clone to /tmp, checkout latest stable tag.
Spawn Explore agent on source. Find: CLI, config, hidden flags, env vars.
Parallel: GitHub PRs/issues, web search "[tool] 2025".
Output: skill-ready markdown.
```

---

## Pipeline

```bash
# 0. Detect context (if in a project)
# Check package.json, Cargo.toml, pyproject.toml for existing versions

# 1. Clone + stable tag
git clone --depth 1 https://github.com/[org]/[repo] /tmp/[repo]-research
cd /tmp/[repo]-research && git fetch --tags && git checkout $(git describe --tags --abbrev=0)

# 2. Spawn Explore agent (parallel with step 3-4)
# → "Find all CLI commands, config options, hidden flags, env vars in /tmp/[repo]-research"

# 3. GitHub activity
gh pr list -R [org]/[repo] --state merged --limit 30 --json title,mergedAt
gh issue list -R [org]/[repo] --label question --limit 20

# 4. Web search
# → "[tool] 2025" "[tool] 2026" "[tool] tutorial"

# 5. Synthesize → Output structure above

# 6. Cleanup
rm -rf /tmp/[repo]-research
```

---

## Checklist

- [ ] **Detect context:** Check package.json/Cargo.toml/pyproject.toml for versions
- [ ] **Clone repo** to /tmp, checkout latest stable tag
- [ ] **Explore agent:** CLI commands, config schema, hidden flags, env vars
- [ ] **GitHub:** Recent merged PRs, issues tagged "question"/"documentation"
- [ ] **Web search:** "[tool] 2025", "[tool] 2026", skip pre-2025
- [ ] **Synthesize:** Commands table, config table, gotchas, patterns
- [ ] **Cite sources:** repo@commit, PR numbers, blog URLs
- [ ] **Clean up:** `rm -rf /tmp/[repo]-research`

---

## Source Priority

```
1. Source code (actual behavior)
2. Recent PRs (features being added)
3. GitHub issues (real problems)
4. Blog posts 2025-2026 (practical patterns)
5. Official docs (baseline, often outdated)
```

**Skip:** Stack Overflow, anything pre-2025, basic tutorials

---

## Top Mistakes

| Mistake | Fix |
|---------|-----|
| Using beta/canary | Checkout latest stable TAG, not main |
| Old content (pre-2025) | Always add year to search queries |
| Trusting docs over code | Code wins: check actual defaults in source |
| Missing env vars | Search `process.env`, `std::env`, `os.environ` |
| Forgetting cleanup | `rm -rf /tmp/[repo]-research` when done |

---

## Key Searches

```bash
# Hidden/experimental flags
rg "hidden|experimental|unstable" /tmp/[repo]-research

# Environment variables by language
rg "process\.env\." /tmp/[repo]-research --type ts    # TypeScript
rg "std::env::" /tmp/[repo]-research --type rust      # Rust
rg "os\.environ" /tmp/[repo]-research --type py       # Python
rg "os\.Getenv" /tmp/[repo]-research --type go        # Go

# Recent changes
git log --oneline --since="2025-06-01" | head -30
```

---

## Done When

- [ ] Have version number from stable tag
- [ ] Commands table has 5+ entries
- [ ] Config table covers main options
- [ ] Gotchas section has 3+ real issues from GitHub/code
- [ ] All sources cited with links

---

## Decision Tree

```
What are you researching?
│
├─ CLI tool (wrangler, cargo, bun)
│  Focus: src/cli/, commands, flags, env vars
│
├─ Library/Framework (React, Next.js)
│  Focus: packages/*/src/, exported APIs, deprecations
│
├─ Runtime (Bun, Deno, Node)
│  Focus: built-ins, runtime flags, compat layers
│
└─ Database/Service (D1, R2, Postgres)
   Focus: query syntax, config, limits, gotchas
```

### Key Searches by Type

| Type | Where to look | Key searches |
|------|---------------|--------------|
| CLI | `src/cli/`, `bin/` | `hidden.*true`, `#[arg(`, `process.env` |
| Library | `packages/*/src/`, `index.ts` | `export `, `deprecated`, `experimental` |
| Runtime | `src/`, built-ins | `flag`, `--`, `compat` |
| Database | queries, limits | `limit`, `max`, `error` |

**Deep strategies:** [STRATEGIES.md](references/STRATEGIES.md)

---

## Subagent: Code Investigator

```
Investigate /tmp/[repo]-research for [TOOL].
Find: CLI commands, config options, hidden/experimental flags, env vars.
Check git log --oneline -30 for recent changes.
Output as markdown tables.
```
Use model: `sonnet` (balance of speed + depth)

---

## Subagent: Web Researcher

```
Search "[TOOL] 2025" and "[TOOL] 2026".
Find 5-10 recent tutorials, blog posts, announcements.
Extract: patterns, gotchas, tips.
Skip: Stack Overflow, anything pre-2025, basic tutorials.
```
Use model: `haiku` (fast, web-focused)

---

## References

| Need | File |
|------|------|
| Output templates by tool type | [OUTPUT-TEMPLATES.md](references/OUTPUT-TEMPLATES.md) |
| Example research sessions | [EXAMPLES.md](references/EXAMPLES.md) |
| Tool-specific deep strategies | [STRATEGIES.md](references/STRATEGIES.md) |
# Research Examples

Real sessions showing the workflow.

---

## CLI Tool: Wrangler

```bash
# 1. Clone
git clone --depth 1 https://github.com/cloudflare/workers-sdk.git /tmp/workers-sdk-research
cd /tmp/workers-sdk-research && git fetch --tags && git checkout $(git describe --tags --abbrev=0)

# 2. Explore agent prompt:
# "Investigate /tmp/workers-sdk-research/packages/wrangler: CLI commands, config schema, hidden flags, env vars"

# 3. GitHub
gh pr list -R cloudflare/workers-sdk --state merged --limit 30 --json title,mergedAt
gh issue list -R cloudflare/workers-sdk --label "question" --limit 20

# 4. Web search: "wrangler 2025", "cloudflare workers tutorial 2026"

# 5. Cleanup
rm -rf /tmp/workers-sdk-research
```

**Key findings location:** `packages/wrangler/src/` — commands in `src/`, config schema in types.

---

## Framework: Next.js

```bash
# 1. Clone + stable tag
git clone --depth 1 https://github.com/vercel/next.js.git /tmp/nextjs-research
cd /tmp/nextjs-research && git fetch --tags && git checkout $(git describe --tags --abbrev=0)

# 2. Explore agent prompt:
# "Investigate /tmp/nextjs-research/packages/next/src: exported APIs, experimental flags, config options"

# 3. Quick searches
rg "experimental" /tmp/nextjs-research/packages/next/src/server/config-shared.ts
rg "deprecated" /tmp/nextjs-research/packages/next/src --type ts | head -20

# 4. Web search: "next.js 15 2025", "next.js app router 2026"

# 5. Cleanup
rm -rf /tmp/nextjs-research
```

**Key findings location:** `packages/next/src/server/config-shared.ts` for all config options.

---

## Runtime: Bun

```bash
# 1. Clone
git clone --depth 1 https://github.com/oven-sh/bun.git /tmp/bun-research
cd /tmp/bun-research && git fetch --tags && git checkout $(git describe --tags --abbrev=0)

# 2. Explore agent prompt:
# "Investigate /tmp/bun-research/src: CLI flags, built-in APIs (Bun.*), env vars"

# 3. Quick searches
rg "process\.env\." /tmp/bun-research/src --type ts | head -30
rg "Bun\." /tmp/bun-research/packages/bun-types/bun.d.ts | head -50

# 4. Web search: "bun runtime 2025", "bun vs node 2026"

# 5. Cleanup
rm -rf /tmp/bun-research
```

**Key findings location:** `packages/bun-types/` for all Bun.* APIs.

---

## Typical Output

After Wrangler research:

```markdown
## Wrangler v4.59.2 (2026-01-15)

**Repo:** github.com/cloudflare/workers-sdk @ abc123

### Commands
| Task | Command |
|------|---------|
| Dev | `wrangler dev` |
| Deploy | `wrangler deploy` |
| Tail logs | `wrangler tail` |
| Types | `wrangler types` |

### Config
| Option | Default | Notes |
|--------|---------|-------|
| `name` | required | Worker name |
| `main` | required | Entry point |
| `compatibility_date` | required | Runtime version |

### Gotchas
- **wrangler.toml vs wrangler.jsonc**: jsonc now recommended. Source: PR #1234
- **Auto-provisioning**: KV/R2/D1 auto-created if id omitted. Source: v4.50 release

### Sources
- Code: packages/wrangler/src/config/config.ts:45
- PRs: #5678, #5679
- Posts: blog.cloudflare.com/wrangler-4 (2025-09)
```
# Output Templates

Expanded templates for specific tool types. Basic structure is in SKILL.md.

---

## CLI Tool (Expanded)

```markdown
## [Tool] vX.Y.Z (YYYY-MM-DD)

**Repo:** github.com/org/repo @ abc123

### Commands
| Task | Command | Notes |
|------|---------|-------|
| [task] | `[cmd]` | Added in vX.Y |

### Flags (Including Hidden)
| Flag | Description | Source |
|------|-------------|--------|
| `--flag` | [desc] | docs |
| `--hidden` | [desc] | source: file:123 |

### Config (`[filename]`)
```toml
[section]
option = "default"  # [description]
```

### Env Vars
| Variable | Default | Notes |
|----------|---------|-------|
| `VAR` | [default from code] | [notes] |

### Bleeding Edge (unreleased)
| Feature | PR | Status |
|---------|-----|--------|
| [feature] | #123 | merged, not released |

### Gotchas
- **[Issue]**: [fix]. Source: #456

### Patterns
```[lang]
// From: [tests/blog post]
[code]
```

### Sources
- Repo: [url] @ [commit]
- PRs: #123, #456
- Posts: [url] (2025-MM)
```

---

## Library/Framework

```markdown
## [Library] vX.Y.Z (YYYY-MM-DD)

**Install:** `[package manager command]`

### Core API
| Export | Purpose | Since |
|--------|---------|-------|
| `name` | [purpose] | vX.Y |

### New in Latest Release
| API | Description |
|-----|-------------|
| `name` | [desc] |

### Config
```[lang]
{
  option: "default", // [description]
}
```

### Patterns (2025-2026)
```[lang]
// Source: [blog/tests]
[code]
```

### Migration (from vX to vY)
- [breaking change]: [fix]

### Gotchas
- [issue]: [solution]
```

---

## Comparison

When researching alternatives:

```markdown
## [Tool A] vs [Tool B]

| Aspect | [A] | [B] |
|--------|-----|-----|
| Version | vX | vY |
| [aspect] | [A way] | [B way] |

### Use [A] when
- [scenario]

### Use [B] when
- [scenario]

### Migration A → B
1. [step]
```

---

## Minimal (Quick Research)

```markdown
## [Tool] (YYYY-MM-DD)

**Install:** `[cmd]`
**Key:** `[most common cmd]`
**Gotcha:** [one gotcha + fix]
**New:** [one 2025-2026 feature]
**Source:** [repo@commit]
```
# Tool-Specific Research Strategies

Deep-dive strategies for different tool categories.

---

## CLI Tools (wrangler, cargo, bun, etc.)

### Where to Look

```
src/cli/ or src/cli.rs or bin/
├── Command definitions
├── Argument parsing (clap, yargs, etc.)
├── Hidden/experimental flags
└── Default values (often different from docs)
```

### Key Searches

```bash
# Rust CLI
rg "hidden\s*=\s*true" /tmp/[repo]-research --type rust
rg "#\[arg\(" /tmp/[repo]-research --type rust

# TypeScript CLI
rg "hidden:|experimental:" /tmp/[repo]-research --type ts
rg "process\.env\." /tmp/[repo]-research --type ts

# Go CLI
rg "Hidden:\s*true" /tmp/[repo]-research --type go
rg "os\.Getenv" /tmp/[repo]-research --type go
```

### Output Focus

- Commands table with all subcommands
- Flags table (including hidden)
- Environment variables
- Config file schema
- Common patterns

---

## Libraries/Frameworks (React, Next.js, etc.)

### Where to Look

```
packages/[core]/src/
├── Exported APIs (index.ts, exports.ts)
├── Internal APIs (not exported)
├── Deprecation warnings
└── Experimental/canary exports
```

### Key Searches

```bash
# Find exports
rg "^export " /tmp/[repo]-research/packages/*/src/index.ts

# Find deprecations
rg "deprecated|@deprecated" /tmp/[repo]-research

# Find experimental
rg "experimental|unstable|canary" /tmp/[repo]-research
```

### Output Focus

- API reference table
- New APIs (latest release)
- Deprecated APIs (with migration)
- Config options
- Patterns from examples/

---

## Runtimes (Bun, Deno, Node)

### Where to Look

```
src/
├── Built-in modules
├── Runtime flags
├── Environment variables
├── Compatibility layers
└── Performance options
```

### Key Searches

```bash
# Runtime flags
rg "flag|--" /tmp/[repo]-research/src/cli

# Built-in modules
rg "Bun\.|Deno\.|node:" /tmp/[repo]-research

# Env vars
rg "process\.env|Deno\.env|Bun\.env" /tmp/[repo]-research
```

### Output Focus

- CLI flags table
- Built-in APIs
- Node.js compatibility status
- Performance tuning options
- Environment variables

---

## Databases/Services (D1, R2, Postgres)

### Where to Look

```
src/
├── Query syntax
├── Connection options
├── Limits and quotas
├── Error codes
└── Migration tools
```

### Key Searches

```bash
# Limits
rg "limit|max|quota" /tmp/[repo]-research

# Error codes
rg "error|Error" /tmp/[repo]-research --type ts -A 2

# Config
rg "config|options|settings" /tmp/[repo]-research
```

### Output Focus

- Query syntax examples
- Config options table
- Limits/quotas table
- Error codes and fixes
- Migration patterns

---

## Monorepo Navigation

Many tools live in monorepos. Quick navigation:

```bash
# Find the main package
ls /tmp/[repo]-research/packages/

# Find entry points
rg "\"main\":|\"bin\":" /tmp/[repo]-research/packages/*/package.json

# Find CLI entry
rg "#!/" /tmp/[repo]-research --type ts | head -5
```

---

## Version Detection

```bash
# From package.json
jq '.version' /tmp/[repo]-research/package.json

# From Cargo.toml
grep '^version' /tmp/[repo]-research/Cargo.toml

# From git tag
git -C /tmp/[repo]-research describe --tags --abbrev=0

# Latest release via GitHub API
gh release view -R [org]/[repo] --json tagName
```

---

## Changelog Mining

```bash
# Find changelog
ls /tmp/[repo]-research/CHANGELOG* /tmp/[repo]-research/HISTORY* 2>/dev/null

# Recent entries
head -100 /tmp/[repo]-research/CHANGELOG.md

# Search for breaking changes
rg -i "breaking|removed|deprecated" /tmp/[repo]-research/CHANGELOG.md
```

---

## Test Mining

Tests often show real usage patterns:

```bash
# Find test files
fd "test|spec" /tmp/[repo]-research --type f

# Find integration tests
fd "integration|e2e" /tmp/[repo]-research --type d

# Search tests for patterns
rg "it\(|test\(|describe\(" /tmp/[repo]-research --type ts -A 5
```
