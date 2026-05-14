# Review contract

This document defines what Stark promises to ship and test.

## Runtime bundle

The Codex plugin runtime bundle is intentionally limited to files used by installed skills:

- `.codex-plugin/plugin.json`
- `skills/`
- `references/`
- `assets/`
- `commands/`
- `docs/review-contract.md`
- `agents/`
- `scripts/detect_platform.py`
- `scripts/token_export.py`

## Local-only files

These are source-repo or maintainer files, not required in marketplace installs:

- `tests/`
- `.github/`
- generated app examples
- Playwright/browser screenshot helpers
- temporary screenshots
- archive folders

## Helper script contract

`scripts/detect_platform.py` must route:

- explicit single-platform prompts to that named platform
- explicit multi-platform or shared-codebase prompts to `cross-platform`
- platform-free prompts to `ambiguous`

`scripts/token_export.py` must support only the documented targets:

- `tailwind`
- `css`
- `swiftui`
- `compose`
- `winui`

Do not document additional token targets unless the exporter implements and tests them.

Token export must preserve:

- group-level DTCG `$type` inheritance
- nested reference resolution inside composite values
- circular-reference detection
- Tailwind v4 namespace-friendly names
- Compose `ColorScheme` and `Typography`
- SwiftUI color/font output with line-height companion constants
- WinUI alpha-first color conversion

## Change policy

Design guidance changes are low risk and can ship as patch releases when they do not alter helper behavior.

Helper script changes are higher risk and must include focused tests before release. Avoid expanding script scope inside marketplace-listing PRs unless the new behavior is required by existing docs.
