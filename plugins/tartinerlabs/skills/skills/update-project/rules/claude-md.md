---
title: CLAUDE.md Maintenance
impact: HIGH
tags: claude-md, documentation, instructions
---

**Rule**: Keep Claude's project instructions current and accurate by scanning the project and updating relevant sections.

### What to Scan

- **Build commands**: package.json scripts, Makefile targets, build configs
- **Project structure**: New directories, moved files, changed organisation
- **Tools and scripts**: Linting, testing, deployment commands
- **Environment setup**: Installation steps, required tools, prerequisites
- **Coding conventions**: Patterns, file naming, import styles

### What to Update

- Add new tools, scripts, or build commands discovered in the project
- Remove references to deleted files or deprecated commands
- Update file paths that have changed
- Add new coding conventions observed in recent code

### What NOT to Do

- Don't remove sections that are still valid
- Don't add speculative or unverified information
- Don't duplicate information already in README.md
