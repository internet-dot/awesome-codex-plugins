# ru-text

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blue?logo=anthropic)](https://claude.com/plugins) [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-30363D?logo=GitHub-Sponsors&logoColor=EA4AAA)](https://github.com/sponsors/talkstream) [![Last Updated](https://img.shields.io/github/last-commit/talkstream/ru-text/main?label=updated)](https://github.com/talkstream/ru-text)

**Languages:** English | [Русский](README.ru.md)

**Russian text quality plugin for Claude Code, GitHub Copilot, Windsurf, Cursor, JetBrains, and [6 more platforms](#quick-start)** — typography, information style, editorial standards, UX writing, and business correspondence.

~1,044 independently formulated rules informed by 16 canonical Russian-language sources. All formulations are original — no verbatim quotes, full attribution.

## Acknowledgments

This plugin exists because a handful of people decided that Russian text on the internet deserves better. They wrote the books, built the tools, maintained the guides, and set the standards that thousands of editors, writers, and designers now rely on every day. Their work fundamentally changed how Russian text is written, formatted, and read on screens. I am deeply grateful to every one of them. If this plugin saves you time, please buy their books and use their tools — they earned it.


## What it does

ru-text gives your AI coding assistant a deep understanding of Russian text quality. It auto-activates when the assistant produces or edits Russian text, applying typography rules instantly and loading domain-specific knowledge on demand.

Works with Claude Code, GitHub Copilot, Windsurf, Cursor, Cline, JetBrains (Junie), Continue.dev, Codex CLI, Gemini CLI, OpenClaw, and Notion.

- **~1,044 rules** across 7 domains, packed into 9 reference files + addenda
- **Auto-activation** — no need to remember to turn it on
- **Covers everything** — from em dashes and guillemets to UX microcopy and business email tone
- **Non-dogmatic** — your explicit style request always overrides default rules

## Use cases

**This README.** Every dash, quote, and space you see here follows the plugin's own rules. This document was written with ru-text active.

**UX microcopy.** Writing buttons, errors, empty states for a Russian app. The plugin loads 217 UX rules: "Отмена" not "Нет", error structure (what happened + what to do), placeholders as examples, not instructions.

**Business email.** Drafting an email to colleagues or clients. The plugin kills bureaucratic language ("довожу до сведения" → "сообщаю"), structures subject + first sentence + call to action, and suggests respectful tone without being servile.

**Landing page copy.** Writing an "About" section for an IT company. The plugin replaces cliches ("команда профессионалов", "индивидуальный подход") with specific facts and numbers.

**README and documentation.** Writing docs for an open-source project in Russian. Proper typography (guillemets, em dashes, non-breaking spaces), no filler words, clear inverted-pyramid structure.

**Text quality scoring.** Want to know how your text measures up? `/ru-text:ru-score` evaluates text across 5 dimensions (typography, clarity, grammar, structure, reader precision) and returns a 0.0–10.0 score with specific issues per dimension.

**AI agent quality.** Building AI features in your product? Uncertain how the agent will phrase responses in Russian? ru-text ensures predictable, high-quality Russian text from any Claude-powered agent: consistent typography, no bureaucratic language, reader-first structure.

## Quick start

### Claude Code

```bash
# Add the community marketplace (one-time setup)
/plugin marketplace add anthropics/claude-plugins-community

# Install the plugin
/plugin install ru-text@claude-community
```

Available in the [Anthropic plugin marketplace](https://claude.com/plugins). Works in Claude Code CLI, VS Code, JetBrains, Web, and Desktop.

### Codex CLI

Inside a Codex session, use the interactive plugin browser:

```
/plugins
```

Search for "ru-text" and install. Alternatively, use the universal skills CLI (see below).

### Gemini CLI

```bash
gemini extensions install https://github.com/talkstream/ru-text
```

### Cursor

Use the plugin command in Cursor Agent chat:

```
/add-plugin
```

Search for "ru-text" and install. If not listed in the marketplace, copy manually:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text ~/.cursor/skills/ru-text
```

Windows (PowerShell):

```powershell
git clone https://github.com/talkstream/ru-text.git
Copy-Item -Recurse ru-text\skills\ru-text "$env:USERPROFILE\.cursor\skills\ru-text"
```

### GitHub Copilot

If ru-text is already installed for Claude Code in your project, Copilot detects it automatically. Otherwise:

```bash
npx skills add talkstream/ru-text
```

Or copy manually:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text .github/skills/ru-text
```

Works in VS Code, Visual Studio, and JetBrains IDEs with Copilot.

### Windsurf

```bash
npx skills add talkstream/ru-text
```

Or copy manually to the Windsurf skills directory:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text .windsurf/skills/ru-text
```

Invoke with `@ru-text` in Cascade chat. Also available via Cascade panel > Customizations > Skills.

### Cline

If ru-text is already installed for Claude Code in your project, Cline detects it automatically. Otherwise:

```bash
npx skills add talkstream/ru-text
```

Or copy manually:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text .cline/skills/ru-text
```

Enable skills in Cline settings: Features > Enable Skills.

### JetBrains (Junie)

```bash
npx skills add talkstream/ru-text
```

Or copy manually:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text .junie/skills/ru-text
```

Works in IntelliJ IDEA, PyCharm, WebStorm, GoLand, PhpStorm, RubyMine, RustRover, Rider, CLion, and Android Studio.

### Continue

If ru-text is already installed for Claude Code in your project, Continue detects it automatically. Otherwise:

```bash
npx skills add talkstream/ru-text
```

Or copy manually:

```bash
git clone https://github.com/talkstream/ru-text.git
cp -r ru-text/skills/ru-text .continue/skills/ru-text
```

Works in both VS Code and JetBrains extensions.

### OpenClaw

```bash
openclaw skills install ru-text
```

Available on [ClawHub](https://clawhub.ai/talkstream/ru-text). Works with any LLM provider and messaging channel OpenClaw supports.

### Notion

Two integration paths — see [notion/README.md](notion/README.md) for details:

**Notion AI Custom Skill** (standalone, Business/Enterprise plan):
1. Copy [the template page](notion/ru-text-notion-skill.md) into a Notion page
2. Designate the page as an AI skill
3. Select text and invoke "ru-text" from the AI menu

**Notion via MCP** (with Claude Code, any plan):
1. Install ru-text in Claude Code
2. Connect the [Notion MCP server](https://developers.notion.com/guides/mcp/get-started-with-mcp)
3. Ask Claude Code to read, check, and update your Notion pages

### Any platform via skills CLI

```bash
npx skills add talkstream/ru-text
```

### From source

```bash
git clone https://github.com/talkstream/ru-text.git
```

Then add the repo as a plugin source per your platform's docs.

Start writing Russian text — the plugin takes over automatically. If ru-text makes your products better, consider [sponsoring](https://github.com/sponsors/talkstream) continued development.

## Domains

| Domain | Rules | What it covers |
|---|---|---|
| Typography | 96 | Quotes (guillemets, lapki), dashes, non-breaking spaces, digit grouping, special characters, abbreviations |
| Information style | 197 | Stop-words (97 entries), text structure, facts over adjectives, register, T-Zh editorial principles |
| Editorial: punctuation | 88 | Complex sentences, 57 comma-trap constructions, introductory words, semicolons |
| Editorial: grammar | 171 | Capitalization, agreement, 50+ pleonasms, list formatting, clean language principles |
| UX writing | 217 | 51 button labels, error messages, empty states, forms, notifications, dialogs, onboarding |
| Business writing | 128 | Email structure, messenger etiquette, tone, 43 clean phrase patterns, meeting notes |
| Anti-patterns | 139 | Wrong-to-right pairs organized by severity: bureaucratic language, passive voice, bloat |

## Commands

| Command | Description |
|---|---|
| `/ru-text` | Activate the skill manually (auto-activation covers most cases) |
| `/ru-text:ru-check` | Run a comprehensive text quality check on provided text or recent output |
| `/ru-text:ru-score` | Score text quality on a 0.0–10.0 scale across 5 dimensions |

## Style priority

If you explicitly request a specific style — casual, academic, SEO, literary, legal — your prompt overrides the default rules. The plugin provides quality defaults, not mandates.

## Technical quality

Built to Anthropic's Claude Code plugin specs:
- SKILL.md: 539 words, 88 lines (guideline: under 2,000 words, under 500 lines)
- 9 reference files load on demand, never at session start
- ~1,044 rules organized into 7 thematic areas with progressive disclosure

## Intellectual property notice

This plugin is an independent, original work by Arseniy Kamyshev.

The rules and principles contained herein represent the author's personal
understanding of Russian typography, editorial, and writing standards, gained
from years of professional practice and study of published sources listed below.

All formulations are original. No text is quoted verbatim from any source.
The underlying principles (typography rules, grammar norms, editorial methods)
are not subject to copyright under Article 1259(5) of the Russian Civil Code,
17 USC §102(b), and the Berne Convention.

The authors and publishers of the listed sources have not endorsed, reviewed,
or approved this plugin. Source references are provided for reader convenience
and further study.

Product names mentioned are trademarks of their respective owners, used here
for informational purposes only.

## Roadmap

Next steps for expanding ru-text to new audiences:

- **Telegram Bot** — text quality checking and /ru-score via Telegram
- **Browser Extension** — Russian text quality in any web text field (Chrome, Firefox)
- **WordPress Plugin** — typography and quality scoring in the Gutenberg editor

Contributions and ideas welcome — [open an issue](https://github.com/talkstream/ru-text/issues) or [start a discussion](https://github.com/talkstream/ru-text/discussions).

## Sources and credits

### Typography

| # | Source | Contribution | Link |
|---|---|---|---|
| 1 | **Artyom Gorbunov "Typography and Layout"** (2017) | Core typography rules: dashes, quotes, spacing, screen typography | [bureau.ru/projects/book-typography/](https://bureau.ru/projects/book-typography/) |
| 2 | **Bureau Gorbunov "Tips"** (2005–present, 4809+ tips) | Practical micro-advice on typography, editing, design | [bureau.ru/soviet/](https://bureau.ru/soviet/) |
| 3 | **A. Milchin, L. Cheltsova "Publisher's and Author's Handbook"** (2021, 6th ed.) | Punctuation, abbreviations, number formatting, editorial conventions | [store.artlebedev.com](https://store.artlebedev.com) |
| 4 | **Ilya Birman — Typography Layout** (2007–present) | Keyboard layout for typing correct typographic characters | [ilyabirman.ru/typography-layout/](https://ilyabirman.ru/typography-layout/) |
| 5 | **Type.today — Journal** (2016–present) | Cyrillic typeface design, font pairing, readability | [type.today](https://type.today) |

### Information style and clear writing

| # | Source | Contribution | Link |
|---|---|---|---|
| 6 | **Maxim Ilyakhov "Write, Shorten"** (2017, updated 2025) | Foundation of info-style: removing filler, fighting bureaucratic language, reader-first writing | [book.glvrd.ru](https://book.glvrd.ru) |
| 7 | **Maxim Ilyakhov "Clear and Understandable"** (2019) | Advanced info-style: text structure, persuasion, visual-textual integration | [book.glvrd.ru](https://book.glvrd.ru) |
| 8 | **T-Zh editorial policy** (2017–present, 56+ pages) | Tone of voice, formatting, numbers, business writing standards | [journal.tinkoff.ru/manual/](https://journal.tinkoff.ru/manual/) |
| 9 | **Kontur Guides** (2020–present) | UX writing for B2B software: interface text, errors, onboarding | [guides.kontur.ru](https://guides.kontur.ru) |
| 10 | **Yandex Gravity UI** (2023–present) | Design system with content guidelines for Russian UI text | [gravity-ui.com](https://gravity-ui.com) |

### Writing and language

| # | Source | Contribution | Link |
|---|---|---|---|
| 11 | **M. Ilyakhov, L. Sarycheva "New Rules of Business Correspondence"** (2018) | Email structure, respectful tone, messenger etiquette | [book.glvrd.ru](https://book.glvrd.ru) |
| 12 | **Nora Gal "Living Word and Dead Word"** (1972, reprints) | Original critique of bureaucratic language, nominalization abuse, passive voice | [lib.ru](http://lib.ru/TRANSLATORS/NORA_GAL/slowo.txt) |
| 13 | **D. Rozental — Spelling and Style References** (1960s–2000s) | Authoritative Russian grammar, punctuation, orthography baseline | widely available |
| 14 | **Artemy Lebedev "Mandership"** (1998–present) | Screen typography, dashes and quotes, design-text readability | [artlebedev.ru/kovodstvo/](https://www.artlebedev.ru/kovodstvo/) |
| 15 | **Ozon UX Writing Practices** (2021–present) | UX writing at scale: buttons, notifications, errors, product copy | [habr.com](https://habr.com/ru/companies/ozontech/articles/821383/) |
| 16 | **GOST R 7.0.12-2011, GOST 7.12-93** (Rosstandart) | Official standards for bibliographic abbreviations in Russian | GOST databases |

### Online tools

- **Glavred** ([glvrd.ru](https://glvrd.ru)) — checks text for info-style quality, highlights filler, scores 0–10
- **Lebedev Typograf** ([typograf.artlebedev.ru](https://www.artlebedev.ru/typograf/)) — auto-fixes typography: quotes, dashes, non-breaking spaces
- **Orfogrammka** ([orfogrammka.ru](https://orfogrammka.ru)) — grammar, spelling, and punctuation checker

## See also

- [Glavred](https://glvrd.ru) — checks text for info-style quality, highlights filler, scores 0–10
- [Typograf](https://www.artlebedev.ru/typograf/) — auto-fixes typography: quotes, dashes, non-breaking spaces
- [Orfogrammka](https://orfogrammka.ru) — grammar, spelling, and punctuation checker

## Author

**Arseniy Kamyshev** — [nafigator@gmail.com](mailto:nafigator@gmail.com) — [Telegram](https://t.me/nafigator) — [GitHub](https://github.com/talkstream)

## Support

I have spent my life working on social projects. This is where I make the biggest difference for people and communities, so I **always** need financial support. If ru-text makes your products better, consider [sponsoring me on GitHub](https://github.com/sponsors/talkstream).

## License

[MIT](LICENSE) | [Privacy Policy](PRIVACY_POLICY.md)
