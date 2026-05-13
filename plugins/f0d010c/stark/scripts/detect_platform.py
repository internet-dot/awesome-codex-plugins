#!/usr/bin/env python3
"""
detect_platform.py — Heuristic platform detector for design-router.

Reads a request string from --text or stdin, returns one of:
  web | windows | apple | android | cross-platform | ambiguous

Used by design-router skill as a deterministic fallback when LLM dispatch is uncertain.

Usage:
  echo "Build a Settings screen for our Win11 app with Mica" | python detect_platform.py
  python detect_platform.py --text "I need a SwiftUI tab bar with Liquid Glass"
"""

from __future__ import annotations
import argparse
import re
import sys

SIGNALS: dict[str, list[str]] = {
    "windows": [
        r"\bwinui\b", r"\bxaml\b", r"\bwpf\b", r"\bwinapp\s*sdk\b",
        r"\bfluent\b", r"\bmica\b", r"\bacrylic\b", r"\bwindows 1[12]\b",
        r"\bwin11\b", r"\bwin12\b", r"\bsegoe\b", r"\bmicrosoft store\b",
        r"\bpowertoys\b", r"\b\.xaml\b", r"\bcommunitytoolkit\b",
        r"\bnavigationview\b", r"\bsettingscard\b",
    ],
    "apple": [
        r"\bswiftui\b", r"\buikit\b", r"\bappkit\b", r"\bmacos\b",
        r"\bipados?\b", r"\bios\s*\d+\b", r"\bios app\b",
        r"\bliquid\s*glass\b", r"\bsf\s*symbols?\b", r"\bsf\s*pro\b",
        r"\b\.swift\b", r"\bnavigationsplitview\b", r"\btabview\b",
        r"\bhig\b", r"\bapp\s*store\b", r"\bxcode\b",
        r"\btahoe\b", r"\bcupertino\b", r"\bcatalyst\b",
        r"\bvisionos\b", r"\bwatchos\b",
    ],
    "android": [
        r"\bjetpack compose\b", r"\bcompose\b(?!\s*multiplatform)",
        r"\bmaterial 3\b", r"\bmaterial you\b", r"\bm3 expressive\b",
        r"\bmaterial 3 expressive\b", r"\bm3e\b",
        r"\bandroid\b", r"\bpixel\b(?!\s*art)", r"\bplay store\b",
        r"\b\.kt\b", r"\b\.kts\b", r"\bkotlin\b",
        r"\bnavigationsuitescaffold\b", r"\bpredictive back\b",
    ],
    "web": [
        r"\breact\b", r"\bnext(?:\.js)?\b", r"\bnextjs\b",
        r"\bastro\b", r"\bsveltekit\b", r"\bsvelte\b",
        r"\bvue\b", r"\bsolid(?:\s*js)?\b", r"\bqwik\b",
        r"\btailwind\b", r"\bshadcn\b", r"\bradix\b",
        r"\blanding page\b", r"\bmarketing site\b", r"\bweb app\b",
        r"\bdashboard\b", r"\bhero section\b",
        r"\b\.tsx\b", r"\b\.jsx\b", r"\b\.html\b", r"\b\.svelte\b", r"\b\.vue\b",
        r"\bcss\b", r"\bhtml\b",
    ],
    "cross-platform": [
        r"\btauri\b", r"\belectron\b", r"\bflutter\b",
        r"\breact native\b", r"\brn\b", r"\bexpo\b",
        r"\bcompose multiplatform\b", r"\bcmp\b",
        r"\buno platform\b", r"\bavalonia\b", r"\bmaui\b",
        r"\bcross[\s-]?platform\b", r"\ball platforms\b",
        r"\bone codebase\b",
    ],
}


def score(text: str) -> dict[str, int]:
    text = text.lower()
    return {
        platform: sum(1 for pat in patterns if re.search(pat, text))
        for platform, patterns in SIGNALS.items()
    }


def detect(text: str) -> str:
    scores = score(text)
    nonzero = {p: s for p, s in scores.items() if s > 0}
    if not nonzero:
        return "ambiguous"

    # Cross-platform wins if it has any score AND another platform also scored
    if "cross-platform" in nonzero and len(nonzero) > 1:
        return "cross-platform"

    # Otherwise: highest score
    top = max(nonzero.items(), key=lambda kv: kv[1])
    runner_up = sorted(nonzero.values(), reverse=True)
    if len(runner_up) > 1 and runner_up[0] - runner_up[1] < 2:
        # Close call — multi-platform request
        return "cross-platform"
    return top[0]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--text", help="Request text. If omitted, reads from stdin.")
    ap.add_argument("--verbose", action="store_true", help="Show per-platform scores.")
    args = ap.parse_args()

    text = args.text if args.text else sys.stdin.read()
    if not text.strip():
        print("ambiguous")
        return 0

    if args.verbose:
        for platform, s in sorted(score(text).items(), key=lambda kv: -kv[1]):
            print(f"  {platform:>16}: {s}", file=sys.stderr)

    print(detect(text))
    return 0


if __name__ == "__main__":
    sys.exit(main())
