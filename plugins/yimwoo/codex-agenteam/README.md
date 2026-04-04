<p align="center">
  <img src="assets/agenteam-banner.png" alt="AgenTeam — Role-based AI team for Codex" width="100%">
</p>

<p align="center">
  <a href="https://github.com/yimwoo/codex-agenteam/releases"><img src="https://img.shields.io/github/v/release/yimwoo/codex-agenteam?color=2563EB&label=version&style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2563EB?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/yimwoo/codex-agenteam/stargazers"><img src="https://img.shields.io/github/stars/yimwoo/codex-agenteam?color=2563EB&style=flat-square" alt="Stars"></a>
  <a href="https://github.com/yimwoo/codex-agenteam/issues"><img src="https://img.shields.io/github/issues/yimwoo/codex-agenteam?color=2563EB&style=flat-square" alt="Issues"></a>
</p>

<p align="center">
  <strong>A full AI development team — researcher, PM, architect, dev, QA, and reviewer — as native Codex agents, orchestrated through a configurable pipeline.</strong>
</p>

---

## Quick Start

**1.** Install:

```bash
curl -fsSL https://raw.githubusercontent.com/yimwoo/codex-agenteam/main/install.sh | bash
```

**2.** Restart Codex, go to **Plugins > Local Plugins**, and install AgenTeam.

**3.** Initialize your team:

```
@ATeam build my team
```

---

## Usage

Once initialized, type `@` in Codex to see your full team:

| Role | Mention | Responsibility |
|------|---------|----------------|
| Researcher | `@Researcher` | Investigates docs, trends, and prior art |
| PM | `@Pm` | Prioritizes work, writes specs |
| Architect | `@Architect` | Designs systems, identifies risks |
| Dev | `@Dev` | Writes production code |
| Qa | `@Qa` | Writes tests, catches regressions |
| Reviewer | `@Reviewer` | Reviews for correctness and security |

Talk to any role directly, or use `@ATeam` for the full pipeline:

```
@Architect review this API design
@Dev fix the race condition in src/queue.py
@ATeam add user authentication
```

```
Researcher  ->  PM  ->  Architect  ->  Dev  ->  Qa  ->  Reviewer
```

Need a specialist? `@ATeam add a security auditor that focuses on OWASP top 10`

---

## Why AgenTeam?

Most AI coding tools give you one agent. AgenTeam gives you a team. Each role has a focused job, a scoped write area, and a place in the pipeline — less context confusion, safer parallel execution, and a workflow that mirrors how real teams operate.

AgenTeam remembers what happened in previous runs. Each completed run's summary and lessons (verify failures, rework paths, gate decisions) are persisted and injected as context into future runs when relevant.

---

## Documentation

- [**Setup & Installation**](https://github.com/yimwoo/codex-agenteam/blob/main/docs/setup.md) -- prerequisites, install, update
- [**Configuration**](https://github.com/yimwoo/codex-agenteam/blob/main/docs/configuration.md) -- roles, isolation, profiles, migration
- [**Pipeline & Profiles**](https://github.com/yimwoo/codex-agenteam/blob/main/docs/pipeline.md) -- stages, gates, verification, resume
- [**CLI Reference**](https://github.com/yimwoo/codex-agenteam/blob/main/docs/cli.md) -- all commands and skills
- [**HOTL Integration**](https://github.com/yimwoo/codex-agenteam/blob/main/docs/hotl.md) -- structured execution with the HOTL plugin

---

## Contributing

Found a bug or have a role idea? [Open an issue](https://github.com/yimwoo/codex-agenteam/issues) or submit a PR.

## License

MIT © [Yiming Wu](https://github.com/yimwoo)
