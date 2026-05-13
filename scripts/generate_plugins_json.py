#!/usr/bin/env python3
"""Regenerate compatibility metadata and the curated Codex marketplace from README.

Usage:
    python3 scripts/generate_plugins_json.py

This script keeps three artifacts aligned:

- plugins.json compatibility output for legacy tooling
- .agents/plugins/marketplace.json for Codex repo marketplace installs
- mirrored installable plugin bundles under plugins/<owner>/<repo>/
"""

from __future__ import annotations

import datetime
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

README = Path(__file__).parent.parent / "README.md"
OUTPUT = Path(__file__).parent.parent / "plugins.json"
MARKETPLACE_OUTPUT = Path(__file__).parent.parent / ".agents" / "plugins" / "marketplace.json"
PLUGINS_ROOT = Path(__file__).parent.parent / "plugins"
REQUEST_TIMEOUT_SECONDS = 60
MAX_RETRIES = 3
USER_AGENT = "awesome-codex-plugins-generator"
RAW_DEFAULT_BRANCH_REF = "HEAD"
OPTIONAL_PLUGIN_FILES = (
    "README.md",
    "SECURITY.md",
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    ".codexignore",
  )


def normalize_relative_path(value: str) -> str:
    return value.replace("\\", "/").lstrip("./")


def parse_plugins(readme_path: Path) -> list[dict[str, str]]:
    lines = readme_path.read_text(encoding="utf-8").splitlines()

    start = None
    end = None
    for index, line in enumerate(lines):
        if line.strip() == "## Community Plugins":
            start = index + 1
        if start is not None and line.strip().startswith("## ") and line.strip() != "## Community Plugins":
            end = index
            break

    if start is None:
        raise ValueError("Could not find Community Plugins section")
    if end is None:
        end = len(lines)

    section = lines[start:end]
    plugins: list[dict[str, str]] = []
    current_category = "Uncategorized"
    seen: set[str] = set()

    for line in section:
        category_match = re.match(r"^### (.+)", line.strip())
        if category_match:
            current_category = category_match.group(1)
            continue

        plugin_match = re.match(
            r"^- \[([^\]]+)\]\((https://github\.com/([^/]+)/([^)#]+?))(?:#readme)?\)\s*[-–]\s*(.+)",
            line.strip(),
        )
        if not plugin_match:
            continue

        owner, repo = plugin_match.group(3), plugin_match.group(4)
        repo = repo.removesuffix(".git")
        key = f"{owner}/{repo}"
        if key in seen:
            continue
        seen.add(key)
        plugins.append(
            {
                "name": plugin_match.group(1),
                "url": plugin_match.group(2),
                "owner": owner,
                "repo": repo,
                "description": plugin_match.group(5).strip(),
                "category": current_category,
                "source": "awesome-codex-plugins",
                "install_url": f"https://raw.githubusercontent.com/{owner}/{repo}/{RAW_DEFAULT_BRANCH_REF}/.codex-plugin/plugin.json",
            }
        )

    return plugins


def fetch_repo_archive(owner: str, repo: str) -> zipfile.ZipFile:
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            request = urllib.request.Request(
                f"https://github.com/{owner}/{repo}/archive/HEAD.zip",
                headers={"User-Agent": USER_AGENT},
            )
            with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                return zipfile.ZipFile(io.BytesIO(response.read()))
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                import time
                time.sleep(2 ** attempt)  # exponential backoff
    raise last_error


def resolve_plugin_root(names: set[str]) -> PurePosixPath:
    for name in sorted(names):
        if name.endswith("/.codex-plugin/plugin.json"):
            return PurePosixPath(name).parent.parent
    raise ValueError("Archive does not contain .codex-plugin/plugin.json")


def load_manifest(archive: zipfile.ZipFile, plugin_root: PurePosixPath) -> dict[str, object]:
    manifest_name = plugin_root.joinpath(".codex-plugin", "plugin.json").as_posix()
    return json.loads(archive.read(manifest_name).decode("utf-8"))


def plugin_root_relative_path(plugin_root: PurePosixPath) -> str:
    repo_relative_parts = plugin_root.parts[1:]
    return PurePosixPath(*repo_relative_parts).as_posix() if repo_relative_parts else ""


def build_raw_manifest_url(plugin: dict[str, str], plugin_root_relative: str) -> str:
    manifest_path = ".codex-plugin/plugin.json"
    if plugin_root_relative:
        manifest_path = f"{plugin_root_relative}/{manifest_path}"
    return (
        f"https://raw.githubusercontent.com/{plugin['owner']}/{plugin['repo']}/"
        f"{RAW_DEFAULT_BRANCH_REF}/{manifest_path}"
    )


def add_recursive_selection(
    selected: set[str],
    all_names: set[str],
    plugin_root: PurePosixPath,
    relative_path: str,
) -> None:
    normalized = normalize_relative_path(relative_path)
    if not normalized:
        return
    archive_prefix = plugin_root.joinpath(PurePosixPath(normalized)).as_posix()
    if archive_prefix in all_names:
        selected.add(normalized)
    prefix_with_slash = f"{archive_prefix}/"
    for name in all_names:
        if name.startswith(prefix_with_slash):
            relative_name = PurePosixPath(name).relative_to(plugin_root).as_posix()
            selected.add(relative_name)


def collect_selected_paths(
    manifest: dict[str, object],
    all_names: set[str],
    plugin_root: PurePosixPath,
) -> set[str]:
    selected = {".codex-plugin/plugin.json"}

    for optional_name in OPTIONAL_PLUGIN_FILES:
        candidate = plugin_root.joinpath(optional_name).as_posix()
        if candidate in all_names:
            selected.add(optional_name)

    for key in ("skills", "mcpServers", "apps", "app", "appConfig"):
        value = manifest.get(key)
        if isinstance(value, str):
            add_recursive_selection(selected, all_names, plugin_root, value)

    interface = manifest.get("interface")
    if isinstance(interface, dict):
        for key in ("composerIcon", "logo"):
            value = interface.get(key)
            if isinstance(value, str):
                add_recursive_selection(selected, all_names, plugin_root, value)
        screenshots = interface.get("screenshots")
        if isinstance(screenshots, list):
            for screenshot in screenshots:
                if isinstance(screenshot, str):
                    add_recursive_selection(selected, all_names, plugin_root, screenshot)

    return selected


def mirror_plugin_bundle(plugin: dict[str, str]) -> tuple[dict[str, object], str, str]:
    owner_repo = f"{plugin['owner']}/{plugin['repo']}"
    try:
        archive = fetch_repo_archive(plugin["owner"], plugin["repo"])
    except Exception as e:
        raise ValueError(f"Failed to fetch {owner_repo}: {e}") from e
    names = {name for name in archive.namelist() if not name.endswith("/")}
    try:
        plugin_root = resolve_plugin_root(names)
    except ValueError:
        raise ValueError(f"Archive for {owner_repo} does not contain .codex-plugin/plugin.json") from None
    manifest = load_manifest(archive, plugin_root)
    selected_paths = collect_selected_paths(manifest, names, plugin_root)

    destination_root = PLUGINS_ROOT / plugin["owner"] / plugin["repo"]
    destination_root.mkdir(parents=True, exist_ok=True)

    for relative_path in sorted(selected_paths):
        archive_name = plugin_root.joinpath(PurePosixPath(relative_path)).as_posix()
        destination_path = destination_root / PurePosixPath(relative_path)
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        destination_path.write_bytes(archive.read(archive_name))

    return manifest, f"./plugins/{plugin['owner']}/{plugin['repo']}", plugin_root_relative_path(plugin_root)


def build_marketplace_entry(
    plugin: dict[str, str],
    manifest: dict[str, object],
    marketplace_path: str,
    icon_path: str | None = None,
) -> dict[str, object]:
    manifest_name = str(manifest.get("name") or "").strip() or plugin["repo"]
    interface = manifest.get("interface", {})
    display_name = plugin["name"]  # from README, human-readable
    description = plugin.get("description", "").strip()
    if not description:
        description = str(interface.get("shortDescription") or interface.get("longDescription") or "").strip()

    entry: dict[str, object] = {
        "name": manifest_name,
        "displayName": display_name,
        "source": {
            "source": "local",
            "path": marketplace_path,
        },
        "policy": {
            "installation": "AVAILABLE",
            "authentication": "ON_INSTALL",
        },
        "category": plugin["category"],
    }
    if description:
        entry["description"] = description
    if icon_path:
        entry["icon"] = icon_path

    return entry


def write_json(path: Path, data: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    plugins = parse_plugins(README)
    mirrored_entries: list[dict[str, object]] = []
    for plugin in plugins:
        manifest, marketplace_path, plugin_root_relative = mirror_plugin_bundle(plugin)
        plugin["install_url"] = build_raw_manifest_url(plugin, plugin_root_relative)

        # Determine icon path if available and actually mirrored
        icon_path: str | None = None
        interface = manifest.get("interface", {})
        if isinstance(interface, dict):
            composer_icon = interface.get("composerIcon") or interface.get("logo")
            if isinstance(composer_icon, str) and composer_icon.strip():
                rel = composer_icon.lstrip("./")
                candidate = f"{marketplace_path}/{rel}"
                # Verify the file exists in the mirrored plugin directory
                abs_path = PLUGINS_ROOT / plugin["owner"] / plugin["repo"] / rel
                if abs_path.exists():
                    icon_path = candidate

        mirrored_entries.append(build_marketplace_entry(plugin, manifest, marketplace_path, icon_path))

    marketplace = {
        "name": "awesome-codex-plugins",
        "interface": {
            "displayName": "Awesome Codex Plugins",
        },
        "plugins": mirrored_entries,
    }
    plugins_json = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "name": "awesome-codex-plugins",
        "version": "1.0.0",
        "last_updated": datetime.date.today().isoformat(),
        "total": len(plugins),
        "categories": sorted({plugin["category"] for plugin in plugins}),
        "plugins": plugins,
    }

    write_json(MARKETPLACE_OUTPUT, marketplace)
    write_json(OUTPUT, plugins_json)
    print(f"Wrote {len(plugins)} plugins to {OUTPUT}")
    print(f"Wrote curated marketplace to {MARKETPLACE_OUTPUT}")


if __name__ == "__main__":
    main()
