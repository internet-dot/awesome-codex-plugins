<div align="center">

<img src="assets/banner.svg" alt="VibePortrait Banner" width="100%">

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude_Code-skill-14b8a6?logo=anthropic&logoColor=white)](https://claude.ai/claude-code)
[![Codex](https://img.shields.io/badge/Codex-skill-10a37f?logo=openai&logoColor=white)](https://github.com/openai/codex)
[![GitHub stars](https://img.shields.io/github/stars/dadwadw233/VibePortrait?style=social)](https://github.com/dadwadw233/VibePortrait)
[![Release](https://img.shields.io/github/v/release/dadwadw233/VibePortrait?color=14b8a6)](https://github.com/dadwadw233/VibePortrait/releases)

**Your AI conversations already know who you are. VibePortrait makes it visible.**

[English](#what-is-vibeportrait) · [中文](#vibeportrait-是什么)

</div>

---

### ⚡ 30-Second Demo

```bash
# Install (one time)
cp -R VibePortrait/skills/vibe-portrait ~/.claude/skills/vibe-portrait

# Run
/vibe-portrait
```

**Input:** Your `~/.claude/history.jsonl` + `~/.codex/history.jsonl` (read-only, never sent anywhere)

**Output:**

| Output | What you get |
|--------|-------------|
| 📄 `vibe-portrait.html` | Beautiful portrait page — open in browser, export as PNG |
| 🧠 `~/.claude/skills/.../me/` | Persona skill — say "think like me" in any future conversation |
| 🔄 `my-vibe-portrait` repo | Private GitHub repo syncing portraits across all your machines |

<details>
<summary><b>📸 What the portrait looks like (click to expand)</b></summary>

<br>

<img src="assets/portrait-preview.png" alt="VibePortrait Preview" width="100%">

*The portrait includes: MBTI type with per-type color theme · 6-axis capability radar · developer rating (夯爆了→拉完了) · 3-dimension famous match · communication style analysis · tech domain map · work rhythm heatmap · and more.*

</details>

---

## What is VibePortrait?

A skill for **Claude Code** and **Codex**. It reads your conversation history and generates:

- **🖼️ HTML Portrait** — MBTI type (16 color themes), radar chart, developer rating, 3D famous match, communication style, tech domain map, work rhythm heatmap
- **🧠 Persona Skill** — multi-file skill capturing your thinking patterns, decision framework, engineering philosophy — loadable by any AI ("think like me")
- **📸 Image Export** — one-click PNG for sharing on social media
- **🔄 Multi-machine Sync** — private GitHub repo keeps everything in sync across all your dev machines

> Rating philosophy: judged by **observable output**, not claims or intent. No flattery. Evidence speaks.

---

## VibePortrait 是什么？

一个 **Claude Code / Codex 技能**，读取你的对话历史，生成：

- **🖼️ HTML 画像页** — 单文件网页，含 MBTI、能力雷达、开发者评级、名人匹配等可视化
- **🧠 人格 Skill** — 凝练你的思维方式，让 AI 能"像你一样思考"
- **📸 一键导出图片** — PNG 格式，方便分享
- **🔄 多机器同步** — 通过 private GitHub 仓库跨机器同步

> 评分哲学：以**可观察的实际产出**为准。不谄媚，不推测。证据说话。

---

## Quick Start / 快速开始

**Claude Code (marketplace):**

```bash
# Step 1: Add marketplace
/plugin marketplace add dadwadw233/VibePortrait

# Step 2: Install
/plugin install vibe-portrait@vibe-portrait

# Step 3: Run
/vibe-portrait:vibe-portrait
```

**Claude Code (manual):**

```bash
git clone https://github.com/dadwadw233/VibePortrait.git
cp -R VibePortrait/skills/vibe-portrait ~/.claude/skills/vibe-portrait
/vibe-portrait
```

**Codex:**

```bash
$skill-installer install https://github.com/dadwadw233/VibePortrait/tree/main/skills/vibe-portrait
# Then: Use $vibe-portrait to generate my developer personality portrait.
```

---

## How It Works / 工作流程

```
 ⚡ Quick mode (~200 msgs)  or  🔍 Full mode (all msgs)
                        │
          ┌─────────────▼──────────────┐
          │  Read conversation history  │
          │  + import from other machines│
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  Analyze 6 dimensions       │
          │  → MBTI · Rating · Famous   │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  Generate outputs           │
          │  📄 HTML  🧠 Skill  📸 PNG │
          └─────────────┬──────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  Sync to GitHub (optional)  │
          └────────────────────────────┘
```

---

## Portrait Contents / 画像内容

| | Section | Description |
|-|---------|-------------|
| 🧬 | **MBTI Type** | 4-axis mapping with per-type color theme / 四轴映射 + 16 种独立配色 |
| 📊 | **Radar** | Depth · Breadth · Communication · Decision · Collaboration · Creativity |
| 🏆 | **Rating** | `Legendary 夯爆了` → `Elite 夯` → `Above Avg 人上人` → `NPC` → `Below Avg 拉` → `Inactive 拉完了` |
| 🎭 | **Famous Match** | 3 dimensions: Technical Spirit · Strategic Mind · Communication Soul — AI picks from all of human history |
| 💬 | **Communication** | Language split, directness, keywords / 语言分布、直接度、关键词 |
| 🗺️ | **Tech Map** | Domain breakdown + tool badges / 领域分布 + 工具徽章 |
| ⏰ | **Work Rhythm** | 24h heatmap + session patterns / 24h 热力图 + 会话模式 |

## MBTI Themes / 配色主题

| Group | Types | Colors |
|-------|-------|--------|
| 🧠 Analysts 分析师 | INTJ · INTP · ENTJ · ENTP | Teal + Slate 青绿灰蓝 |
| 💚 Diplomats 外交官 | INFJ · INFP · ENFJ · ENFP | Emerald + Amber 翠绿琥珀 |
| 🛡️ Sentinels 哨兵 | ISTJ · ISFJ · ESTJ · ESFJ | Cobalt + Steel 钴蓝钢灰 |
| 🔥 Explorers 探险家 | ISTP · ISFP · ESTP · ESFP | Gold + Rose 金橙玫红 |

---

## Persona Skills / 人格技能

VibePortrait generates a skill that captures: thinking patterns, decision framework, communication style, engineering philosophy.

**No raw chat messages are included** — only abstracted mindset markers.

```bash
# Activate personas / 激活人格
think like me                        # Your own / 你自己的
像马斯克一样思考这个问题               # Community / 社区人格
think like linus-torvalds            # By ID

# Manage / 管理
update my portrait                   # Incremental update (only new msgs) / 增量更新
install persona from <github-url>    # Install from GitHub / 安装
list personas                        # See installed / 查看已安装
remove persona <id>                  # Uninstall / 删除
```

```
~/.claude/skills/vibe-portrait-personas/
├── me/                        ← yours (auto-generated, multi-file)
│   ├── SKILL.md
│   ├── portrait-meta.json     ← timestamps for incremental updates
│   └── references/
│       ├── thinking-patterns.md
│       ├── decision-framework.md
│       ├── communication-style.md
│       ├── engineering-philosophy.md
│       └── mindset-markers.md
├── elon-musk/                 ← installed from GitHub
│   └── ...
└── zhuge-liang/               ← installed from community
    └── ...
```

---

## Multi-Machine Sync / 多机器同步

Syncs via **private GitHub repo** using `gh` CLI.

```
Machine A ──push──► my-vibe-portrait (private) ◄──push── Machine B
                    ├── me/SKILL.md
                    ├── analysis/macbook.json
                    ├── analysis/linux-4090.json
                    ├── portraits/latest.html
                    └── README.md (auto-filled)
```

First run creates the repo. Subsequent runs on any machine pull → merge → push.

---

## Privacy / 隐私

- Only reads local `~/.claude/history.jsonl` — never sends data externally
- API keys, tokens, passwords, file paths, personal info auto-redacted from all outputs
- Persona skills contain **zero raw chat messages** — only abstracted personality descriptions
- Portrait repo is private by default — you control what to share

> 🛡️ **Want real-time protection?** Try [**VibeGuard**](https://github.com/dadwadw233/VibeGuard) — a security plugin for Claude Code that detects secrets, blocks dangerous commands, and logs all tool actions. Pairs naturally with VibePortrait: VibeGuard protects your code in real-time, VibePortrait ensures your exported persona stays clean.
>
> ```bash
> npm install -g @embodot/vibeguard && vibeguard install
> ```

---

## Requirements / 环境要求

- Claude Code or Codex with 20+ messages of history
- Modern browser for HTML viewing
- `gh` CLI for multi-machine sync (optional)

---

## Roadmap

- [x] HTML portrait with 10 visual sections + MBTI color themes
- [x] Persona skill generation (abstracted, no raw quotes)
- [x] Bilingual (zh/en) + one-click image export
- [x] Multi-machine sync via private GitHub repo
- [x] Materialist rating rubric
- [ ] Community platform for sharing & discovering persona skills

---

<div align="center">

**Every great developer evolves. The first step is seeing clearly where you stand.**

**每一次对话都是你的进化轨迹。看见自己，分享自己，成为更强的自己。**

</div>
