# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Knox, email **apps@qoris.ai** with the subject `[SECURITY] Knox vuln`. Include:
- Affected version(s)
- Steps to reproduce
- Proof-of-concept (if applicable)
- Suggested fix (optional)

We respond within 48 hours and patch critical issues within 7 days.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.2.x   | ✅ |
| 2.1.x   | ✅ |
| 2.0.x   | ⚠️ Security fixes only |
| < 2.0   | ❌ |

## Disclosure Policy

We follow a 90-day coordinated disclosure timeline. Researchers are credited in the changelog and a `SECURITY-CREDITS.md` file unless they request anonymity.

## Scope

Knox's threat model and explicit non-goals are documented in [README.md → Known limitations](README.md#known-limitations-and-red-team-results). In short:

- **In scope:** any bypass of the documented blocklist patterns at the `standard` preset, any hook-evasion technique, any false negative on the documented attack categories.
- **Out of scope:** social engineering against the Claude/Cursor/Codex models themselves, attacks requiring physical access to the developer machine, attacks via disabled hosts (e.g. Knox is not installed on Cursor in your environment).
