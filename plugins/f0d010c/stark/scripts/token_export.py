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


def flatten(node: Any, prefix: str = "", inherited_type: str | None = None) -> dict[str, dict[str, Any]]:
    """Walk DTCG tree, return {dotted.path: {$value, $type, ...}}."""
    out: dict[str, dict[str, Any]] = {}
    if isinstance(node, dict):
        current_type = node.get("$type", inherited_type)
        if "$value" in node:
            token = dict(node)
            if current_type and "$type" not in token:
                token["$type"] = current_type
            out[prefix] = token
            return out
        for key, child in node.items():
            if key.startswith("$"):
                continue
            new_prefix = f"{prefix}.{key}" if prefix else key
            out.update(flatten(child, new_prefix, current_type))
    return out


def resolve(value: Any, all_tokens: dict[str, dict[str, Any]], visited: set[str] | None = None) -> Any:
    if isinstance(value, dict):
        return {k: resolve(v, all_tokens, visited) for k, v in value.items()}
    if isinstance(value, list):
        return [resolve(v, all_tokens, visited) for v in value]
    if not isinstance(value, str):
        return value

    visited = visited or set()
    full_ref = REF.fullmatch(value)
    if full_ref:
        ref_path = full_ref.group(1)
        if ref_path not in all_tokens:
            return value
        if ref_path in visited:
            raise ValueError(f"Circular token reference detected: {' -> '.join([*visited, ref_path])}")
        return resolve(all_tokens[ref_path]["$value"], all_tokens, visited | {ref_path})

    def replace_reference(match: re.Match[str]) -> str:
        ref_path = match.group(1)
        if ref_path not in all_tokens:
            return match.group(0)
        if ref_path in visited:
            raise ValueError(f"Circular token reference detected: {' -> '.join([*visited, ref_path])}")
        resolved = resolve(all_tokens[ref_path]["$value"], all_tokens, visited | {ref_path})
        return str(resolved)

    return REF.sub(replace_reference, value)


def kebab(s: str) -> str:
    return s.replace(".", "-").replace("_", "-")


def strip_category(path: str, category: str) -> str:
    prefix = f"{category}."
    if path == category:
        return path
    if path.startswith(prefix):
        return path[len(prefix):]
    return path


def tailwind_color_name(path: str) -> str:
    if path.startswith("color-dark."):
        return "dark." + path[len("color-dark."):]
    return strip_category(path, "color")


def camel(s: str) -> str:
    parts = [part for part in re.split(r"[._-]+", s) if part]
    if not parts:
        return ""
    return parts[0] + "".join(part[:1].upper() + part[1:] for part in parts[1:])


def numeric_token_value(value: Any, default: float) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = re.search(r"-?\d+(?:\.\d+)?", value)
        if match:
            return float(match.group(0))
    return default


def line_height_value(value: Any, font_size: float) -> float:
    if isinstance(value, (int, float)):
        numeric = float(value)
        return numeric * font_size if 0 < numeric < 4 else numeric
    if isinstance(value, str):
        stripped = value.strip()
        match = re.search(r"-?\d+(?:\.\d+)?", stripped)
        if match:
            numeric = float(match.group(0))
            if not re.search(r"[a-zA-Z%]", stripped) and 0 < numeric < 4:
                return numeric * font_size
            return numeric
    return font_size


def swift_weight(value: Any) -> str:
    if isinstance(value, (int, float)):
        if value >= 800:
            return ".heavy"
        if value >= 700:
            return ".bold"
        if value >= 600:
            return ".semibold"
        if value >= 500:
            return ".medium"
        if value <= 300:
            return ".light"
        return ".regular"

    normalized = str(value).strip().lower().replace(" ", "")
    mapping = {
        "thin": ".thin",
        "extralight": ".ultraLight",
        "ultralight": ".ultraLight",
        "light": ".light",
        "regular": ".regular",
        "normal": ".regular",
        "medium": ".medium",
        "semibold": ".semibold",
        "demibold": ".semibold",
        "bold": ".bold",
        "extrabold": ".heavy",
        "black": ".black",
        "heavy": ".heavy",
    }
    return mapping.get(normalized, ".regular")


# ---- Tailwind v4 ----------------------------------------------------------

def export_tailwind(tokens: dict[str, dict[str, Any]]) -> str:
    lines = ["@theme {"]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        if t == "color":
            lines.append(f"  --color-{kebab(tailwind_color_name(path))}: {v};")
        elif t == "dimension":
            spacing_path = strip_category(strip_category(path, "spacing"), "space")
            lines.append(f"  --spacing-{kebab(spacing_path)}: {v};")
        elif t == "duration":
            lines.append(f"  --duration-{kebab(strip_category(path, 'duration'))}: {v};")
        elif t == "typography" and isinstance(v, dict):
            name = kebab(strip_category(strip_category(path, "typography"), "type"))
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


def swift_font_expr(value: dict[str, Any]) -> str:
    family = value.get("fontFamily")
    size = numeric_token_value(value.get("fontSize"), 16)
    weight = swift_weight(value.get("fontWeight", "regular"))

    if family:
        return f'Font.custom("{family}", size: {size:g}).weight({weight})'
    return f"Font.system(size: {size:g}, weight: {weight})"


def export_swiftui(tokens: dict[str, dict[str, Any]]) -> str:
    lines = ["import SwiftUI", "", "extension Color {"]
    for path, tok in tokens.items():
        if tok.get("$type") != "color":
            continue
        v = str(resolve(tok["$value"], tokens))
        var = camel(path)
        if v.startswith("#"):
            lines.append(f"    static let {var} = {hex_to_swift_color(v)}")
        elif v.startswith("Color"):
            lines.append(f"    static let {var} = {v}")
        else:
            lines.append(f"    // unhandled: {path} = {v}")
    lines.append("}")

    typography_lines = ["", "extension Font {"]
    typography_count = 0
    for path, tok in tokens.items():
        if tok.get("$type") != "typography":
            continue
        v = resolve(tok["$value"], tokens)
        if not isinstance(v, dict):
            continue
        typography_count += 1
        typography_lines.append(f"    static let {camel(path)} = {swift_font_expr(v)}")

    if typography_count:
        typography_lines.append("}")
        lines.extend(typography_lines)

        line_height_lines = ["", "extension CGFloat {"]
        line_height_count = 0
        for path, tok in tokens.items():
            if tok.get("$type") != "typography":
                continue
            v = resolve(tok["$value"], tokens)
            if not isinstance(v, dict) or "lineHeight" not in v:
                continue
            line_height_count += 1
            line_height = numeric_token_value(v.get("lineHeight"), numeric_token_value(v.get("fontSize"), 16))
            line_height_lines.append(f"    static let {camel(path)}LineHeight: CGFloat = {line_height:g}")
        if line_height_count:
            line_height_lines.append("}")
            lines.extend(line_height_lines)
    return "\n".join(lines) + "\n"


# ---- Compose --------------------------------------------------------------

def hex_to_compose(h: str) -> str:
    h = h.lstrip("#")
    if len(h) == 6:
        return f"Color(0xFF{h.upper()})"
    if len(h) == 8:
        return f"Color(0x{h[6:8].upper()}{h[0:6].upper()})"
    return f"/* unparsed: {h} */ Color.Gray"


def css_hex_to_xaml(h: str) -> str:
    h = h.strip()
    if re.fullmatch(r"#[0-9A-Fa-f]{8}", h):
        return f"#{h[7:9]}{h[1:7]}".upper()
    if re.fullmatch(r"#[0-9A-Fa-f]{6}", h):
        return h.upper()
    return h


def compose_font_weight(value: Any) -> str:
    if isinstance(value, (int, float)):
        return f"FontWeight.W{int(value)}"
    normalized = str(value).strip().lower().replace(" ", "")
    mapping = {
        "thin": "FontWeight.Thin",
        "extralight": "FontWeight.ExtraLight",
        "light": "FontWeight.Light",
        "regular": "FontWeight.Normal",
        "normal": "FontWeight.Normal",
        "medium": "FontWeight.Medium",
        "semibold": "FontWeight.SemiBold",
        "demibold": "FontWeight.SemiBold",
        "bold": "FontWeight.Bold",
        "extrabold": "FontWeight.ExtraBold",
        "black": "FontWeight.Black",
    }
    return mapping.get(normalized, "FontWeight.Normal")


def compose_text_style_expr(value: dict[str, Any]) -> str:
    size = numeric_token_value(value.get("fontSize"), 16)
    line_height = line_height_value(value.get("lineHeight"), size)
    weight = compose_font_weight(value.get("fontWeight", "regular"))
    return f"TextStyle(fontSize = {size:g}.sp, lineHeight = {line_height:g}.sp, fontWeight = {weight})"


def compose_typography_slot(path: str) -> str | None:
    name = path.split(".")[-1]
    mapping = {
        "display-large": "displayLarge",
        "display-medium": "displayMedium",
        "display-small": "displaySmall",
        "headline-large": "headlineLarge",
        "headline-medium": "headlineMedium",
        "headline-small": "headlineSmall",
        "title-large": "titleLarge",
        "title-medium": "titleMedium",
        "title-small": "titleSmall",
        "body-large": "bodyLarge",
        "body-medium": "bodyMedium",
        "body-small": "bodySmall",
        "label-large": "labelLarge",
        "label-medium": "labelMedium",
        "label-small": "labelSmall",
    }
    return mapping.get(name)


def export_compose(tokens: dict[str, dict[str, Any]]) -> str:
    lines = [
        "package design.tokens",
        "",
        "import androidx.compose.material3.ColorScheme",
        "import androidx.compose.material3.Typography",
        "import androidx.compose.material3.lightColorScheme",
        "import androidx.compose.ui.graphics.Color",
        "import androidx.compose.ui.text.TextStyle",
        "import androidx.compose.ui.text.font.FontWeight",
        "import androidx.compose.ui.unit.dp",
        "import androidx.compose.ui.unit.sp",
        "",
        "object DesignTokens {",
    ]
    for path, tok in tokens.items():
        t = tok.get("$type")
        v = resolve(tok["$value"], tokens)
        var = camel(path)
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
        elif t == "typography" and isinstance(v, dict):
            lines.append(f"    val {var} = {compose_text_style_expr(v)}")

    color_scheme_args: list[str] = []
    color_scheme_slots = {
        "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
        "inversePrimary", "secondary", "onSecondary", "secondaryContainer",
        "onSecondaryContainer", "tertiary", "onTertiary", "tertiaryContainer",
        "onTertiaryContainer", "background", "onBackground", "surface",
        "onSurface", "surfaceVariant", "onSurfaceVariant", "surfaceTint",
        "inverseSurface", "inverseOnSurface", "error", "onError",
        "errorContainer", "onErrorContainer", "outline", "outlineVariant",
        "scrim",
    }
    for path, tok in tokens.items():
        if tok.get("$type") != "color" or not path.startswith("color."):
            continue
        slot = camel(strip_category(path, "color"))
        if slot in color_scheme_slots:
            color_scheme_args.append(f"        {slot} = {camel(path)}")
    if color_scheme_args:
        lines.append("")
        lines.append("    val colorScheme: ColorScheme = lightColorScheme(")
        lines.append(",\n".join(color_scheme_args))
        lines.append("    )")

    typography_assignments: list[str] = []
    for path, tok in tokens.items():
        if tok.get("$type") != "typography":
            continue
        slot = compose_typography_slot(path)
        if slot:
            typography_assignments.append(f"        {slot} = {camel(path)}")
    if typography_assignments:
        lines.append("")
        lines.append("    val typography = Typography(")
        lines.append(",\n".join(typography_assignments))
        lines.append("    )")
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
            lines.append(f'    <Color x:Key="{key}Color">{css_hex_to_xaml(v_str)}</Color>')
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
