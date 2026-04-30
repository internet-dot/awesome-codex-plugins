---
name: oss-docs
description: 'Scaffold or audit OSS docs.'
---
# OSS Documentation Skill

Scaffold and audit documentation for open source projects.

## Overview

This skill helps prepare repositories for open source release by:
1. Auditing existing documentation completeness
2. Scaffolding missing standard files
3. Generating content tailored to project type

## Commands

| Command | Action |
|---------|--------|
| `audit` | Check which OSS docs exist/missing |
| `scaffold` | Create all missing standard files |
| `scaffold [file]` | Create specific file |
| `update` | Refresh existing docs with latest patterns |
| `validate` | Check docs follow best practices |

---

## Phase 0: Project Detection

```bash
# Determine project type and language
PROJECT_NAME=$(basename $(pwd))
LANGUAGES=()

[[ -f go.mod ]] && LANGUAGES+=("go")
[[ -f pyproject.toml ]] || [[ -f setup.py ]] && LANGUAGES+=("python")
[[ -f package.json ]] && LANGUAGES+=("javascript")
[[ -f Cargo.toml ]] && LANGUAGES+=("rust")

# Detect project category
if [[ -f Dockerfile ]] && [[ -d cmd ]]; then
    PROJECT_TYPE="cli"
elif [[ -d config/crd ]]; then
    PROJECT_TYPE="operator"
elif [[ -f Chart.yaml ]]; then
    PROJECT_TYPE="helm"
else
    PROJECT_TYPE="library"
fi
```

---

## Subcommand: audit

### Required Files (Tier 1 - Core)

| File | Purpose |
|------|---------|
| `LICENSE` | Legal terms |
| `README.md` | Project overview |
| `CONTRIBUTING.md` | How to contribute |
| `CODE_OF_CONDUCT.md` | Community standards |

### Recommended Files (Tier 2 - Standard)

| File | Purpose |
|------|---------|
| `SECURITY.md` | Vulnerability reporting |
| `CHANGELOG.md` | Version history |
| `AGENTS.md` | AI assistant context |
| `.github/ISSUE_TEMPLATE/` | Issue templates |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template |

### Optional Files (Tier 3 - Enhanced)

| File | When Needed |
|------|-------------|
| `docs/QUICKSTART.md` | Complex setup |
| `docs/ARCHITECTURE.md` | Non-trivial codebase |
| `docs/CLI_REFERENCE.md` | CLI tools |
| `docs/CONFIG.md` | Configurable software |
| `examples/` | Complex workflows |

---

## Subcommand: scaffold

### Template Selection

| Project Type | Focus |
|--------------|-------|
| `cli` | Installation, commands, examples |
| `operator` | K8s CRDs, RBAC, deployment |
| `service` | API, configuration, deployment |
| `library` | API reference, examples |
| `helm` | Values, dependencies, upgrading |

---

## Documentation Organization

```
project/
├── README.md              # Overview + quick start
├── AGENTS.md              # AI assistant context
├── CONTRIBUTING.md        # Contributor guide
├── CHANGELOG.md           # Keep a Changelog format
├── docs/
│   ├── QUICKSTART.md      # Detailed getting started
│   ├── CLI_REFERENCE.md   # Complete command reference
│   ├── ARCHITECTURE.md    # System design
│   └── CONFIG.md          # Configuration options
└── examples/
    └── README.md          # Examples index
```

---

## AGENTS.md Pattern

```markdown
# Agent Instructions

This project uses **<tool>** for <purpose>. Run `<onboard-cmd>` to get started.

## Quick Reference

```bash
<cmd1>              # Do thing 1
<cmd2>              # Do thing 2
```

## Landing the Plane (Session Completion)

**MANDATORY WORKFLOW:**

1. **Run quality gates** - Tests, linters, builds
2. **Commit changes** - Meaningful commit message
3. **PUSH TO REMOTE** - This is MANDATORY
4. **Verify** - All changes committed AND pushed
```

---

## Style Guidelines

1. **Be direct** - Get to the point quickly
2. **Be friendly** - Welcome contributions
3. **Be concise** - Avoid boilerplate
4. **Use tables** - For commands, options, features
5. **Show examples** - Code blocks over prose
6. **Link liberally** - Cross-reference related docs

---

## Skill Boundaries

**DO:**
- Audit existing documentation
- Generate standard OSS files
- Validate documentation quality

**DON'T:**
- Overwrite existing content without confirmation
- Generate code documentation (use `$doc`)
- Create CI/CD files (out of scope — configure CI/CD separately)

## Examples

### OSS Readiness Audit

**User says:** "Audit this repo for open-source documentation readiness."

**What happens:**
1. Evaluate presence/quality of core OSS docs.
2. Identify missing or weak sections.
3. Output prioritized documentation actions.

### Scaffold Missing Docs

**User says:** "Generate missing OSS docs for this project."

**What happens:**
1. Detect project type and documentation gaps.
2. Scaffold standard files with project-aware content.
3. Produce a checklist for final review and landing.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Generated docs feel generic | Project signals too sparse | Add concrete repo context (commands, architecture, workflows) |
| Existing docs conflict | Legacy text diverges from current behavior | Reconcile with current code/process and mark obsolete sections |
| Contributor path unclear | Missing setup/testing guidance | Add explicit quickstart and validation commands |
| Open-source handoff incomplete | Session-end workflow not reflected | Add landing-the-plane and release hygiene steps |

## Reference Documents

- [references/beads-patterns.md](references/beads-patterns.md)
- [references/documentation-tiers.md](references/documentation-tiers.md)
- [references/project-types.md](references/project-types.md)

## Local Resources

### references/

- [references/beads-patterns.md](references/beads-patterns.md)
- [references/documentation-tiers.md](references/documentation-tiers.md)
- [references/project-types.md](references/project-types.md)

### scripts/

- `scripts/audit-oss-docs.sh`
- `scripts/validate.sh`


