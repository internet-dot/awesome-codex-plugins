#!/usr/bin/env python3
"""Regenerate plugins.json from the README.md Community Plugins section.

Usage:
    python3 scripts/generate_plugins_json.py

This should be run after any change to the plugin list in README.md.
"""
import json
import re
from pathlib import Path

README = Path(__file__).parent.parent / "README.md"
OUTPUT = Path(__file__).parent.parent / "plugins.json"


def parse_plugins(readme_path: Path) -> list[dict]:
    lines = readme_path.read_text(encoding="utf-8").splitlines()

    start = None
    end = None
    for i, line in enumerate(lines):
        if line.strip() == "## Community Plugins":
            start = i + 1
        if start and line.strip().startswith("## ") and line.strip() != "## Community Plugins":
            end = i
            break

    if start is None or end is None:
        raise ValueError("Could not find Community Plugins section")

    section = lines[start:end]
    plugins = []
    current_category = "Uncategorized"
    seen = set()

    for line in section:
        cat_match = re.match(r"^### (.+)", line.strip())
        if cat_match:
            current_category = cat_match.group(1)
            continue

        m = re.match(
            r"^- \[([^\]]+)\]\((https://github\.com/([^/]+)/([^)#]+?))(?:#readme)?\)\s*[-–]\s*(.+)",
            line.strip(),
        )
        if m:
            owner, repo = m.group(3), m.group(4)
            key = f"{owner}/{repo}"
            if key in seen:
                continue
            seen.add(key)
            plugins.append(
                {
                    "name": m.group(1),
                    "url": m.group(2),
                    "owner": owner,
                    "repo": repo,
                    "description": m.group(5).strip(),
                    "category": current_category,
                    "source": "awesome-codex-plugins",
                    "install_url": f"https://raw.githubusercontent.com/{owner}/{repo}/main/.codex-plugin/plugin.json",
                }
            )

    return plugins


def main():
    import datetime

    plugins = parse_plugins(README)
    data = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "name": "awesome-codex-plugins",
        "version": "1.0.0",
        "last_updated": datetime.date.today().isoformat(),
        "total": len(plugins),
        "categories": sorted({p["category"] for p in plugins}),
        "plugins": plugins,
    }
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(plugins)} plugins to {OUTPUT}")


if __name__ == "__main__":
    main()
