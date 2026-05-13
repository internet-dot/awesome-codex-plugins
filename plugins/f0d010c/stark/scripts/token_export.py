#!/usr/bin/env python3
"""
token_export.py — Translate a DTCG W3C token JSON into platform outputs.

Usage:
  python token_export.py --input tokens.json --target tailwind   --output theme.css
  python token_export.py --input tokens.json --target compose    --output Theme.kt
  python token_export.py --input tokens.json --target swiftui    --output DesignSystem.swift
  python token_export.py --input tokens.json --target winui      --output Resources.xaml
  python token_export.py --input tokens.json --target css        --output theme.css

Targets:
  tailwind  - Tailwind v4 @theme block
  css       - :root CSS custom properties
  compose   - Compose Material3 ColorScheme + Typography
  swiftui   - Swift extension on Color + Font
  winui     - WinUI 3 ResourceDictionary XAML

Tokens follow W3C Design Tokens Community Group format. Resolves $value references like {color.brand.primary}.
"""

from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


REF = re.compile(r"\{([^}]+)\}")


def load_tokens(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def flatten(node: Any, prefix: str = "") -> dict[str, dict[str, Any]]:
    """Walk DTCG tree, return {dotted.path: {$value, $type, ...}}."""
    out: dict[str, dict[str, Any]] = {}
    if isinstance(node, dict):
        if "$value" in node:
            out[prefix] = node
            return out
        for key, child in node.items():
            if key.startswith("$"):
                continue
            new_prefix = f"{prefix}.{key}" if prefix else key
            out.update(flatten(child, new_prefix))
    return out


def resolve(value: Any, all_tokens: dict[str, dict[str, Any]]) -> Any:
    if not isinstance(value, str):
        return value
    while True:
        m = REF.search(value)
        if not m:
            return value
        ref_path = m.group(1)
        if ref_path not in all_tokens:
            return value  # unresolvable, leave as-is
        replacement = str(all_tokens[ref_path]["$value"])
        value = value[: m.start()] + replacement + value[m.end():]


def kebab(s: str) -> str:
    return s.replace(".", "-").replace("_", "-")


# ---- Tailwind v4 ----------------------------------------------------------

def export_tailwind(tokens: dict[str, dict[str, Any]]) -> str:
    lines = ["@theme {"]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        if t == "color":
            lines.append(f"  --color-{kebab(path)}: {v};")
        elif t == "dimension":
            lines.append(f"  --spacing-{kebab(path)}: {v};")
        elif t == "duration":
            lines.append(f"  --duration-{kebab(path)}: {v};")
        elif t == "typography" and isinstance(v, dict):
            name = kebab(path)
            if "fontFamily" in v:
                lines.append(f"  --font-{name}: {v['fontFamily']};")
            if "fontSize" in v:
                lines.append(f"  --text-{name}: {v['fontSize']};")
    lines.append("}")
    return "\n".join(lines) + "\n"


# ---- Plain CSS ------------------------------------------------------------

def export_css(tokens: dict[str, dict[str, Any]]) -> str:
    lines = [":root {"]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        if t in ("color", "dimension", "duration"):
            lines.append(f"  --{kebab(path)}: {v};")
    lines.append("}")
    return "\n".join(lines) + "\n"


# ---- SwiftUI --------------------------------------------------------------

def hex_to_swift_color(h: str) -> str:
    h = h.lstrip("#")
    if len(h) == 6:
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return f"Color(red: {r/255:.3f}, green: {g/255:.3f}, blue: {b/255:.3f})"
    if len(h) == 8:
        r, g, b, a = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), int(h[6:8], 16)
        return f"Color(red: {r/255:.3f}, green: {g/255:.3f}, blue: {b/255:.3f}, opacity: {a/255:.3f})"
    return f"/* unparsed: {h} */ Color.gray"


def export_swiftui(tokens: dict[str, dict[str, Any]]) -> str:
    lines = ["import SwiftUI", "", "extension Color {"]
    for path, tok in tokens.items():
        if tok.get("$type") != "color":
            continue
        v = str(resolve(tok["$value"], tokens))
        var = path.replace(".", "_").replace("-", "_")
        if v.startswith("#"):
            lines.append(f"    static let {var} = {hex_to_swift_color(v)}")
        elif v.startswith("Color"):
            lines.append(f"    static let {var} = {v}")
        else:
            lines.append(f"    // unhandled: {path} = {v}")
    lines.append("}")
    return "\n".join(lines) + "\n"


# ---- Compose --------------------------------------------------------------

def hex_to_compose(h: str) -> str:
    h = h.lstrip("#")
    if len(h) == 6:
        return f"Color(0xFF{h.upper()})"
    if len(h) == 8:
        return f"Color(0x{h[6:8].upper()}{h[0:6].upper()})"
    return f"/* unparsed: {h} */ Color.Gray"


def export_compose(tokens: dict[str, dict[str, Any]]) -> str:
    lines = [
        "package design.tokens",
        "",
        "import androidx.compose.ui.graphics.Color",
        "import androidx.compose.ui.unit.dp",
        "import androidx.compose.ui.unit.sp",
        "",
        "object DesignTokens {",
    ]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        var = "".join(part.capitalize() for part in path.replace("-", "_").split(".") if part)
        var = var[0].lower() + var[1:] if var else var
        if t == "color":
            v_str = str(v)
            if v_str.startswith("#"):
                lines.append(f"    val {var} = {hex_to_compose(v_str)}")
        elif t == "dimension":
            v_str = str(v).replace("px", "").replace("dp", "").replace("sp", "")
            try:
                _ = float(v_str)
                lines.append(f"    val {var} = {v_str}.dp")
            except ValueError:
                pass
    lines.append("}")
    return "\n".join(lines) + "\n"


# ---- WinUI ---------------------------------------------------------------

def export_winui(tokens: dict[str, dict[str, Any]]) -> str:
    lines = [
        '<ResourceDictionary',
        '    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"',
        '    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
    ]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        key = path.replace(".", "_").replace("-", "_")
        v_str = str(v)
        if t == "color" and v_str.startswith("#"):
            lines.append(f'    <Color x:Key="{key}Color">{v_str}</Color>')
            lines.append(f'    <SolidColorBrush x:Key="{key}Brush" Color="{{StaticResource {key}Color}}" />')
        elif t == "dimension":
            num = v_str.replace("px", "").replace("dp", "")
            try:
                _ = float(num)
                lines.append(f'    <x:Double x:Key="{key}">{num}</x:Double>')
            except ValueError:
                pass
    lines.append("</ResourceDictionary>")
    return "\n".join(lines) + "\n"


# ---- Main -----------------------------------------------------------------

EXPORTERS = {
    "tailwind": export_tailwind,
    "css":      export_css,
    "swiftui":  export_swiftui,
    "compose":  export_compose,
    "winui":    export_winui,
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--target", required=True, choices=list(EXPORTERS.keys()))
    ap.add_argument("--output", required=True, type=Path)
    args = ap.parse_args()

    raw = load_tokens(args.input)
    flat = flatten(raw)
    out = EXPORTERS[args.target](flat)
    args.output.write_text(out, encoding="utf-8")
    print(f"wrote {args.output} ({len(out)} chars, {len(flat)} tokens)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
