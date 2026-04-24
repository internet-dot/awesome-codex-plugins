---
name: llm-wiki
description: 'Build an external-knowledge wiki from clipped articles, papers, and transcripts.'
---
# LLM Wiki Skill (proposal)

> **Purpose:** Keep a compounding markdown wiki of **external knowledge** (articles, papers, transcripts, clipped web content) maintained by an LLM so the bookkeeping is free and the knowledge accumulates. Based on Andrej Karpathy's "LLM Wiki" pattern published April 2026. See [references/architecture.md](references/architecture.md) for the full design rationale and how it interoperates with existing AgentOps skills.
>
> **Status:** PROPOSAL — not yet merged. Opened 2026-04-11 for council review. See `.agents/research/2026-04-11-karpathy-llm-wiki-integration.md` for the research that motivated this skill.

## The core idea in one paragraph

RAG has a critical flaw: **there is no accumulation**. Each query re-discovers fragments from the raw source corpus. The LLM Wiki pattern replaces per-query RAG with a persistent LLM-maintained markdown wiki that sits between raw sources and the user. The LLM reads each raw doc once, extracts concepts, writes summaries, cross-links related ideas, and keeps the whole thing current. On query time, the LLM reads the already-compiled wiki — much faster, much richer, and it compounds.

Karpathy's metaphor: *"Obsidian is the IDE. The LLM is the programmer. The wiki is the codebase."* Same as AgentOps's internal-flywheel pattern, applied to external knowledge.

## What this skill IS

A specification for four operations against a wiki-structured vault:
1. **`ingest`** — process new raw source → write wiki pages + update index + log
2. **`query`** — answer a question from wiki pages → file synthesis results back as new pages
3. **`lint`** — periodic health-check for contradictions, stale claims, orphans, missing concepts
4. **`promote`** — move a mature wiki page from draft to reviewed, or from wiki to authored content

## What this skill is NOT

- **Not a replacement for `compile`** — `skills/compile` handles internal AgentOps artifacts (`.agents/learnings/` → `.agents/compiled/`). `llm-wiki` handles **external** source material (`raw/` → `wiki/`). They complement; they don't overlap. See `references/architecture.md` for the distinction.
- **Not a replacement for `research`** — `research` writes net-new research artifacts from investigation; `llm-wiki` organizes pre-existing external material. A research artifact can *cite* wiki pages; a wiki page can inform a research artifact.
- **Not a RAG system** — it's the opposite. RAG retrieves fragments per query; LLM Wiki pre-compiles them into durable pages.
- **Not auto-scheduled** — the skill defines the operations; scheduling (cron / systemd / launchd / Codex hooks) is the host's problem. References doc explains the 3-tier model (always-on Tier 1 local LLM, on-demand Tier 2 Claude, human Tier 3) but doesn't force a specific scheduler.

## Quick Start

```bash
# Initialize the wiki layout in the current project
$llm-wiki init

# Drop a raw file into raw/articles/ then ingest it
$llm-wiki ingest raw/articles/karpathy-llm-wiki-gist.md

# Query the wiki for what we know about a topic
$llm-wiki query "what's the Karpathy LLM Wiki pattern?"

# Lint the wiki for orphans, contradictions, stale pages
$llm-wiki lint

# Promote a mature wiki page out to authored content
$llm-wiki promote wiki/concepts/llm-wiki.md --to platform-lab/patterns/llm-wiki-architecture.md
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--tier 1\|2\|3` | 2 | Operator tier. Tier 1 writes `status: draft` only and never touches authored dirs. Tier 2 writes `status: reviewed` and can promote. Tier 3 (human) does the final promotion to `MEMORY.md` / authored paths. |
| `--raw PATH` | `raw/` | Override the default raw inbox location |
| `--wiki PATH` | `wiki/` | Override the default wiki output location |
| `--dry-run` | off | Show what would be ingested/written without making changes |
| `--force` | off | For `lint`, apply auto-fixes (orphan linking, stale flagging) instead of just reporting |
| `--since DATE` | 30 days | For `lint`, only consider pages touched since this date |
| `--index PATH` | `INDEX.md` | Override the index location |
| `--log PATH` | `LOG.md` | Override the log location |

## Execution phases

### Phase 1 — `init`

Create the wiki layout in the current project if not already present:

```
<project>/
├── INDEX.md                 ← content catalog
├── LOG.md                   ← append-only operation log
├── SOUL.md                  ← (optional) user identity for always-load
├── CRITICAL_FACTS.md        ← (optional) ~150-token always-load context
├── raw/                     ← Karpathy raw layer
│   ├── articles/
│   ├── papers/
│   ├── transcripts/
│   ├── screenshots/
│   └── assets/
└── wiki/                    ← Karpathy compiled layer
    ├── sources/             ← per-raw-doc summaries
    ├── entities/            ← people, orgs, products, tools
    ├── concepts/            ← ideas, frameworks, theories
    └── synthesis/           ← cross-cutting analyses
```

Seeds `INDEX.md` and `LOG.md` with headers; leaves `SOUL.md` and `CRITICAL_FACTS.md` as optional stubs. Writes a `_CLAUDE.md` (or updates existing) with the workflow sections. **Idempotent** — re-running on an existing layout is a no-op.

### Phase 2 — `ingest <raw-path>`

For each raw source:
1. Read it fully (don't skim).
2. Write a summary page at `wiki/sources/<slug>.md` with frontmatter:
   ```yaml
   type: source
   raw: <path to raw file>
   ingested: <ISO datetime>
   status: draft|reviewed    # draft if Tier 1, reviewed if Tier 2
   ```
3. Extract candidate **entities** (people, organizations, products, tools) → stub pages in `wiki/entities/` or update existing ones. Add a backlink from the source page.
4. Extract candidate **concepts** (ideas, frameworks) → stub pages in `wiki/concepts/` or update existing ones.
5. Update `INDEX.md` with every new page. **Failure to update index = lint failure later.**
6. Append to `LOG.md`: `YYYY-MM-DD HH:MM | <actor> | INGEST | <source slug> | <pages created> | <wikilink>`
7. If any existing `wiki/synthesis/*` page covers this topic, revise it to incorporate the new source; don't leave stale versions.

**Tier 1 constraint:** If running as `--tier 1`, all writes get `status: draft`. Tier 1 never touches `wiki/synthesis/` (synthesis requires review). Tier 1 never modifies existing `status: reviewed` pages.

### Phase 3 — `query <question>`

Answer a question from the wiki:
1. Search `wiki/**` for relevant pages. Also check `.agents/learnings/`, `.agents/findings/`, authored content dirs if present.
2. Synthesize an answer with citations — every non-trivial claim must cite a specific page via wikilink.
3. If the answer is non-trivial and likely to be asked again, file it as a new `wiki/synthesis/<slug>.md` with the question, answer, and citations.
4. Append to `LOG.md` with op `QUERY`.

**Authored content takes precedence over wiki drafts.** If a concept is already covered in `.agents/findings/` or `.agents/learnings/`, cite that first and treat the wiki as supplementary.

### Phase 4 — `lint`

Walk `wiki/` and flag:
1. **Orphan pages** — no backlinks from any other wiki page and no entry in `INDEX.md`
2. **Broken wikilinks** — links pointing at pages that don't exist
3. **Stale pages** — `ingested` date > `--since` cutoff AND the domain is evolving (user-configured stale-domain list)
4. **Contradictions** — two pages making incompatible claims without a reconciliation note. Simple keyword heuristic + LLM re-read for candidates.
5. **Missing concepts** — entities or concepts referenced in `wiki/sources/` that don't have a dedicated page
6. **Index drift** — files in `wiki/**` that aren't listed in `INDEX.md`, OR index entries that point at non-existent files

Write findings to `wiki/synthesis/lint-YYYY-MM-DD.md`. **Don't auto-fix by default** — lint reports, human or Tier 2 decides.

With `--force`, auto-fix:
- Add missing index entries
- Flag stale pages with `status: stale`
- Write orphan warning comments to orphan pages

Append to `LOG.md` with op `LINT`.

### Phase 5 — `promote <wiki-path> --to <destination>`

Move a mature wiki page to authored content:
1. Verify the destination is a valid target (`platform-lab/patterns/*`, `career/*`, `learning/*`, or similar project-specific authored dirs).
2. `git mv` to preserve history if possible; otherwise rewrite.
3. Update `INDEX.md` — remove from wiki section, add to authored section.
4. Find and update all backlinks to the old path.
5. Append to `LOG.md` with op `PROMOTE`.

**Tier 1 cannot promote.** Tier 2 can promote within the wiki (`status: draft` → `reviewed`). Tier 3 (human) promotes out of the wiki to authored dirs.

## Integration with existing AgentOps skills

| Skill | Interaction |
|---|---|
| `skills/compile` | Operates on internal `.agents/` artifacts → `.agents/compiled/`. Structurally identical to `llm-wiki` but for internal sources. The two wikis (`wiki/` and `.agents/compiled/`) can cross-link but don't merge. |
| `skills/research` | Can cite wiki pages in research artifacts. Can optionally run `llm-wiki ingest` on material as a pre-step to writing a research artifact. |
| `skills/forge` | Can promote wiki-page concepts that have crystallized into reusable patterns into `.agents/findings/` via its normal finding-registry flow. |
| `skills/inject` | Should learn to inject relevant `wiki/` pages alongside `.agents/*` content when a session starts. |
| `skills/post-mortem` | Phase 2 (Extract Learnings) can be informed by recent `wiki/synthesis/` pages as supporting context. |
| `skills/pre-mortem` | Can query `wiki/` for past context on the domain being pre-mortem'd. |
| `skills/knowledge-activation` | Can activate high-value wiki pages into MEMORY.md alongside `.agents/learnings/` promotions. |

## Relationship to the AgentOps flywheel

The AgentOps flywheel compounds **internal work knowledge** (what we did, what we learned, what went wrong). The LLM Wiki compounds **external reading knowledge** (what we read, what others figured out, what the state of the art is).

Both flywheels feed each other:
- Wiki pages can be cited by research artifacts that feed the internal flywheel
- Internal learnings can reference wiki pages when explaining "why we adopted approach X"
- Findings can be enriched with wiki-sourced context

**Design principle:** external and internal knowledge live in separate trees (`wiki/` vs `.agents/`) so the provenance is always clear. The two trees cross-link; they don't merge.

## Scheduling (not part of this skill, but referenced)

The Karpathy pattern works best when the skill runs **on a schedule**, not just on-demand. The proposed 3-tier model (from the community implementations):

- **Tier 1 — always on, cheap local LLM** (e.g., Gemma 4 26B A4B on a consumer GPU). Nightly ingest of `raw/`, draft generation, orphan detection, lint.
- **Tier 2 — on-demand expensive expert** (Claude / Codex / equivalent). Weekly review of drafts, synthesis, promotion to authored content.
- **Tier 3 — human**. Weekly approval of promotions to long-term memory / authored content.

See `references/architecture.md` for the full tier model and scheduling recommendations. The skill is tier-agnostic; the host project wires up the scheduler.

## Open questions for council review

1. Should the wiki layout (`raw/`, `wiki/`) live at project root, or under `.agents/wiki/`? **Proposal recommendation: project root**, to keep external knowledge visibly distinct from internal work.
2. Does this overlap with `skills/compile` enough that the two should merge? **Proposal recommendation: no** — keep them separate and document the split.
3. Should the 3-tier model be baked into the skill via a `--tier` flag, or left as convention? **Proposal recommendation: `--tier` flag** with Tier 2 as default.
4. Should `init` also seed `SOUL.md` and `CRITICAL_FACTS.md`, or leave them optional? **Proposal recommendation: seed as stubs** with instructions.
5. What's the right output contract? Post-mortem uses `council/schemas/verdict.json`; should `llm-wiki` have its own output schema for ingest/query/lint results? **Proposal recommendation: yes**, shape TBD by council.

## References

- `.agents/research/2026-04-11-karpathy-llm-wiki-integration.md` — the research artifact that motivated this skill
- [references/architecture.md](references/architecture.md) — full design rationale, tier model, interop details, anti-patterns
- [references/research.md](references/research.md) — external-source research summary and synthesis
- [Karpathy's original LLM Wiki gist (April 2026)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Community implementations: [NicholasSpisak/second-brain](https://github.com/NicholasSpisak/second-brain), [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain)

## See Also

- `skills/compile/SKILL.md` — the internal-artifact compiler (structurally identical pattern, different source)
- `skills/research/SKILL.md` — research artifact authoring
- `skills/forge/SKILL.md` — mining knowledge from transcripts
- `skills/inject/SKILL.md` — context injection at session start
- `skills/post-mortem/SKILL.md` — the six-phase knowledge flywheel this skill extends externally

---

**Proposal status: OPEN**. This SKILL.md describes the intended behavior but **there is no implementation yet**. Council review (via `$pre-mortem --preset=product`) should validate the design before any code is written. If accepted, the next step is to implement the `ingest` and `query` phases first (ship them as experimental), then `lint` and `promote` once the first two are validated.

## Local Resources

### references/

- [references/architecture.md](references/architecture.md)
- [references/research.md](references/research.md)


