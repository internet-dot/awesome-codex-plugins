> See probes-intro.md for confidence scoring reference.

## Category: `ui`

### Probe: accessibility-gaps

**Activation:** React/Vue/HTML files exist (`.tsx`, `.jsx`, `.vue`, `.html`).

**Detection Method:**

```bash
# Images without alt text
Grep pattern: <img(?![^>]*\balt\s*=)[^>]*>
  --glob "*.{tsx,jsx,vue,html}"

# Buttons without accessible text
Grep pattern: <button(?![^>]*aria-label)[^>]*>\s*<(?!span|text)
  --glob "*.{tsx,jsx,vue,html}"

# Links without accessible text
Grep pattern: <a\s(?![^>]*aria-label)[^>]*>\s*<(?!span|text)
  --glob "*.{tsx,jsx,vue,html}"

# Inputs without labels
Grep pattern: <input(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>
  --glob "*.{tsx,jsx,vue,html}"
# Cross-check: is there a <label for="..."> matching this input's id?

# Missing lang attribute
Grep pattern: <html(?![^>]*\blang\s*=)
  --glob "*.html"
```

**Evidence Format:**
```
File: <path> Line: <n>
Violation: img-no-alt | button-no-label | link-no-label | input-no-label | html-no-lang
Element: <matched_element>
WCAG Level: A | AA
```

**Default Severity:** Medium. High for WCAG Level A violations (img-no-alt, html-no-lang).

---

### Probe: responsive-issues

**Activation:** CSS/SCSS/Tailwind files exist.

**Detection Method:**

```bash
# Fixed widths on containers (>99px)
Grep pattern: width:\s*\d{3,}px
  --glob "*.{css,scss,less,sass}"

# Absolute positioning patterns (potential responsive issues)
Grep pattern: position:\s*absolute
  --glob "*.{css,scss,less,sass}"
# Cross-reference: check if parent has position:relative and explicit dimensions

# Missing viewport meta tag
Grep pattern: <meta[^>]*viewport
  --glob "*.html"
# Flag HTML files WITHOUT this pattern
```

**Evidence Format:**
```
File: <path> Line: <n>
Issue: fixed-width | absolute-position | missing-viewport
Code: <matched_text>
Value: <dimension if applicable>
```

**Default Severity:** Medium.

---

### Probe: design-drift

**Activation:** Pencil MCP configured in Session Config (`pencil` path provided, e.g. `pencil: designs/app.pen`).

**Detection Method:**

Use Pencil MCP tools to compare design specifications against implementation:
1. `get_editor_state` -- check current design file
2. `batch_get` -- retrieve design node properties (colors, spacing, typography)
3. `get_screenshot` -- capture design frames for visual comparison

Compare against:
- CSS custom properties / design tokens in codebase
- Component prop values
- Layout dimensions

**Evidence Format:**
```
Component: <component_name>
Design Value: <expected>
Implementation Value: <actual>
Property: color | spacing | typography | layout
Drift: <description>
```

**Default Severity:** High.

---
