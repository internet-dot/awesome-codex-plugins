> See probes-intro.md for confidence scoring reference.

## Category: `arch`

### Probe: circular-dependencies

**Activation:** Any project with import/require statements.

**Detection Method:**

```bash
# Build import graph from source files
# Step 1: Extract all import relationships
Grep pattern: (import\s+.*from\s+["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))
  --glob "*.{ts,tsx,js,jsx}" --glob "!**/node_modules/**"

# Step 2: Resolve relative paths to absolute
# Step 3: Build adjacency list
# Step 4: Detect cycles using depth-limited BFS (max depth: 10)

# Alternative for Node.js projects with madge installed:
npx madge --circular --extensions ts,tsx,js,jsx src/ 2>/dev/null
```

Algorithm (when madge unavailable):
1. Parse all import statements into `{source_file -> [imported_file]}` map
2. Resolve relative imports to absolute paths
3. For each file, BFS through imports with depth limit of 10
4. If BFS revisits the starting file, record the cycle path

**Evidence Format:**
```
Cycle: <file_a> -> <file_b> -> ... -> <file_a>
Length: <number of files in cycle>
Files Involved:
  - <file_path_1>
  - <file_path_2>
```

**Default Severity:** High.

---

### Probe: complexity-hotspots

**Activation:** Any project with source files.

**Detection Method:**

```bash
# Long functions (>50 lines)
# Count lines between function declarations and closing braces
# Heuristic: find function starts and measure to next function or file end
Grep pattern: (function\s+\w+|const\s+\w+\s*=\s*(async\s+)?\([^)]*\)\s*=>|def\s+\w+|func\s+\w+)
  --glob "*.{ts,tsx,js,jsx,py,go,rs}"

# Deep nesting (>4 levels)
# Count leading whitespace indicating nesting depth
# For standard 2-space indent: >8 spaces = >4 levels
# For standard 4-space indent: >16 spaces = >4 levels
Grep pattern: ^(\s{16,}|\t{4,})\S
  --glob "*.{ts,tsx,js,jsx,py,go,rs}"

# Large files (>500 lines)
wc -l src/**/*.{ts,tsx,js,jsx,py,go,rs} 2>/dev/null | awk '$1 > 500 {print $0}'

# Functions with >5 parameters
Grep pattern: (function\s+\w+|def\s+\w+|func\s+\w+)\s*\([^)]*,[^)]*,[^)]*,[^)]*,[^)]*,
  --glob "*.{ts,tsx,js,jsx,py,go,rs}"
```

**Evidence Format:**
```
File: <path> Line: <n>
Hotspot: long-function | deep-nesting | large-file | many-parameters
Metric: <measured_value> (e.g., "73 lines", "6 levels", "612 lines", "8 params")
Threshold: <threshold_value>
```

**Default Severity:** Medium.

---

### Probe: dependency-security

**Activation:** Package manager detected (`package.json`, `requirements.txt`, `Pipfile`, `Cargo.toml`, `go.mod`).

**Detection Method:**

```bash
# Node.js
npm audit --json 2>/dev/null

# Python
pip-audit --format json 2>/dev/null

# Rust
cargo audit --json 2>/dev/null

# Go
govulncheck ./... 2>/dev/null
```

Parse JSON output for vulnerabilities. Focus on:
- Critical severity CVEs
- High severity CVEs
- Vulnerabilities with known exploits

**Evidence Format:**
```
Package: <name>
Version: <installed_version>
CVE: <CVE-ID>
Severity: critical | high | medium | low
Title: <vulnerability title>
Fix Available: <fixed_version or NONE>
```

**Default Severity:** Critical (critical CVEs), High (high CVEs).

---
