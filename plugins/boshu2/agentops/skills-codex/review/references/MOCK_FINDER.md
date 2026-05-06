
<!-- TOC: Problem | THE EXACT PROMPTS | Quick Start | Detection Methods | Beads vs TODO | Compilation | Resolution | Checklist | References -->

# Mock Code Finder

> **Core Insight:** Long-running multi-agent projects accumulate stubs, mocks, placeholders, and TODO code that silently degrades the codebase. Systematic multi-method detection finds what grep alone misses.

## The Problem

Unless you've specifically looked for them, chances are that you've accumulated various forms of "mocks" or fake placeholder code somewhere in your project. Single-keyword grep misses structural stubs (short functions that do nothing substantive). AST analysis alone misses TODO comments. You need both, plus heuristics.

---

## THE EXACT PROMPTS

### Phase 1: Discovery

```
First read ALL of the AGENTS.md file and README.md file super carefully and understand ALL of both! Then use your code investigation agent mode to fully understand the code and technical architecture and purpose of the project.

Then, I need you to search every last INCH of this ENTIRE repo, looking intelligently for ANY signs or indicators that functions, methods, classes, etc. are "stubs" or "mocks" or "placeholders" or "TODO" or otherwise rather than 100% real, working, fully-functioning code.

You can apply a variety of methods for checking for this, but it's imperative that you not miss ANY instances of this sort of thing. One clever way might be to use ast-grep to find and measure the length of any functions/methods/classes/etc. in terms of lines, characters, etc. to look for things that look suspicious because they appear to be too short to do anything substantive.

First compile the comprehensive listing of all such placeholders/mocks/stubs and a short explanation or justification for why you're convinced they qualify as incomplete/placeholders that must be completed. Once we have this table of suspects, we can then decide how to address and resolve them all in a totally comprehensive, optimal, clever way.
```

### Phase 2a: Resolution (Short List — ~4 items or fewer)

```
OK good, now I need you to come up with an absolutely comprehensive, detailed, and granular plan for addressing each and every single one of those placeholders/mocks/stubs that you identified in the most optimal and clever and sophisticated way possible. THEN: please resolve ALL of those actionable items now. Keep a super detailed, granular, and complete TODO list of all items so you don't lose track of anything and remember to complete all the tasks and sub-tasks you identified or which you think of during the course of your work on these items!
```

### Phase 2b: Resolution (Long List — 5+ items, project uses beads)

```
OK good, now I need you to come up with an absolutely comprehensive, detailed, and granular plan for addressing each and every single one of those placeholders/mocks/stubs that you identified in the most optimal and clever and sophisticated way possible.

THEN: please take ALL of that and elaborate on it and use it to create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.) The beads should be so detailed that we never need to consult back to the original markdown plan document. Remember to ONLY use the `br` tool to create and modify the beads and add the dependencies.
```

### Phase 3: Bead Refinement (iterate 2-3 times)

```
Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things! DO NOT OVERSIMPLIFY THINGS! DO NOT LOSE ANY FEATURES OR FUNCTIONALITY! Also make sure that as part of the beads we include comprehensive unit tests and e2e test scripts with great, detailed logging so we can be sure that everything is working perfectly after implementation. Make sure to ONLY use the `br` cli tool for all changes, and you can and should also use the `bv` tool to help diagnose potential problems with the beads.
```

---

## Quick Start

### Step 0: Detect Project Tooling

```bash
# Check for beads
if [ -d ".beads" ] && command -v br &>/dev/null; then
  echo "BEADS_AVAILABLE=true"  # Use Phase 2b workflow
else
  echo "BEADS_AVAILABLE=false" # Use Phase 2a workflow
fi
```

### Step 1: Understand the Project

```bash
cat AGENTS.md README.md   # DOCUMENTATION FIRST — always!
```

Then use Explore agent for full architecture understanding.

### Step 2: Multi-Method Scan

Run all detection methods in parallel (see [DETECTION-METHODS.md](references/DETECTION-METHODS.md)):

```bash
# Text-based detection (ripgrep)
rg -n "TODO|FIXME|HACK|XXX|STUB|PLACEHOLDER|MOCK|DUMMY|FAKE|TEMP|TEMPORARY" \
  --type-not json --type-not lock -g '!target/' -g '!node_modules/' -g '!.git/' .

rg -n "unimplemented!|todo!|panic!\(\"not implemented|NotImplementedError|raise NotImplementedError" .

rg -n "pass$|return None$|return \{\}$|return \[\]$|return \"\"$|return 0$" \
  --type py --type rust --type ts --type js .

# Structural detection (ast-grep) — find suspiciously short functions
ast-grep run -l Rust -p 'fn $NAME($$$) { $SINGLE_STMT }' --json 2>/dev/null
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { todo!() }' --json 2>/dev/null
ast-grep run -l Python -p 'def $NAME($$$):
    pass' --json 2>/dev/null
ast-grep run -l TypeScript -p 'function $NAME($$$) { return; }' --json 2>/dev/null
```

### Step 2.5: Behavioral Detection (Learned From Real Sessions)

Beyond keywords and AST, look for **simulated behavior** patterns:

```bash
# Fake work: sleep() used to simulate real operations
rg -n "sleep\(|thread::sleep|time\.sleep|setTimeout.*simul|fake.*delay" \
  --type rust --type py --type ts --type go .

# Hardcoded scores/metrics (should be computed from data)
rg -n "score\s*=\s*[0-9]|rarity.*=\s*[0-9]|count.*=\s*0[^.]" \
  --type rust --type py --type ts .

# Returns 501 Not Implemented (API route stubs)
rg -n "501|Not Implemented|not.yet.implemented" \
  --type ts --type py --type rust .

# Functions that always return the same thing regardless of input
# (trace callers to confirm — if callers depend on real output, it's a stub)
rg -n "fn.*->.*bool.*\{.*true.*\}|fn.*->.*bool.*\{.*false.*\}" --type rust .
```

### Step 2.6: Cross-Reference and Caller Tracing (Critical!)

For each suspect, **trace callers to understand impact**:

```bash
# Find who calls a suspect function
rg -n "function_name\(" --type rust --type ts --type py .

# Check if the stub's callers depend on real output
# Example: batch-enrichment.ts returned `redFlagsDetected: 0` but the
# API route that called it actually counted them — divergent code paths
```

### Step 3: Compile Findings Table

Add a **"Real Blocker?"** column to triage what's fixable now vs blocked:

```markdown
| # | File:Line | Type | Code Snippet | Why It's Suspicious | Real Blocker? |
|---|-----------|------|-------------|---------------------|---------------|
| 1 | src/foo.rs:42 | stub | `fn process() { todo!() }` | Explicit todo! macro | No — just needs implementation |
| 2 | src/bar.rs:100 | placeholder | `fn validate() -> bool { true }` | Always returns true | No — needs real validation logic |
| 3 | lib/baz.py:55 | mock | `def fetch_data(): return {}` | Returns empty dict | Yes — needs API credentials |
| 4 | src/metrics.rs:100 | hardcoded | `dau_count = 0` | Always 0, no real tracking | Yes — needs analytics pipeline |
```

**Categorize each finding as one of:**
- **Just needs code** — No external dependency, can implement now
- **Blocked on infra** — Needs DB schema, API keys, external service (document the blocker)
- **Dead code** — No callers, stub is unreachable (candidate for deletion)
- **Intentional stub** — Abstract base / trait impl / protocol method (false positive, skip)

### Step 3.5: Check Existing Beads (Avoid Duplicate Work)

If the project uses beads, check what's already tracked:

```bash
br list --status=open 2>/dev/null | grep -i "stub\|mock\|placeholder\|todo\|implement"
```

Only create new beads for findings not already tracked.

### Step 4: Resolve (Branch by Tooling)

- **Beads available + 5+ items** → Phase 2b: Create beads with `br`, refine with `bv`
- **No beads or <5 items** → Phase 2a: Plan and resolve with TODO tracking

---

## Detection Methods Summary

| Method | Tool | Catches | Misses |
|--------|------|---------|--------|
| Keyword search | `rg` | TODOs, FIXMEs, explicit stubs | Unlabeled short functions |
| Return value analysis | `rg` | Hardcoded returns, empty returns | Complex fake implementations |
| AST short-function scan | `ast-grep` | Suspiciously tiny functions/methods | Stubs with boilerplate padding |
| Unimplemented macro scan | `rg` + `ast-grep` | `todo!()`, `unimplemented!()`, `NotImplementedError` | Custom placeholder patterns |
| Empty body detection | `ast-grep` | `pass`, `{}`, empty impls | Functions with only logging |
| Cross-reference analysis | `rg` | Functions never called from tests | Well-tested stubs |
| Simulated work detection | `rg` | `sleep()` as fake I/O, simulated ops | Well-disguised simulations |
| Hardcoded score/metric scan | `rg` | `score=3`, `dau=0`, `count=0` | Intentional defaults |
| API route stub scan | `rg` | 501 responses, "Not Implemented" | Routes with partial logic |
| Divergent path detection | `rg` | Same concept, different impl in two files | Intentionally separate paths |
| Stub test detection | `rg -c` | Test files with <5 assertions | Tests with many but shallow assertions |

**Full detection patterns by language:** [DETECTION-METHODS.md](references/DETECTION-METHODS.md)

---

## Beads Workflow (When Available)

When the project has `.beads/` and `br` CLI:

1. **Create parent epic:** `br create --title="Resolve all mocks/stubs/placeholders" --type=epic --priority=1`
2. **Create child tasks:** One bead per stub/mock, with detailed comments including:
   - What the stub currently does
   - What it should do (the real implementation)
   - Which files need changing
   - What tests to add
   - Dependencies on other stubs (if resolving one requires another)
3. **Add dependencies:** `br dep add <child> <depends-on>` for implementation ordering
4. **Refine with bv:** `bv --robot-triage` to validate dependency graph, find quick wins
5. **Iterate in plan space:** Review and refine beads 2-3 times before implementing
6. **Include test beads:** Every stub resolution bead should have a companion test bead

---

## Lessons From Real Sessions

Patterns discovered across 7+ repos (midas-edge, frankensearch, mcp-agent-mail-rust, rch, ntm, flywheel-connectors, jeffreysprompts):

| Lesson | Context |
|--------|---------|
| **Caller tracing finds divergent code** | midas-edge: `batch-enrichment.ts` returned `redFlagsDetected: 0` but the API route that consumed it actually counted red flags — two code paths diverged |
| **`sleep()` = fake work** | rch: `run_preflight()` used `sleep()` to simulate SSH operations instead of real SSH commands |
| **Hardcoded scores are stubs too** | midas-edge: `rarityScore = 3` hardcoded instead of computed from historical data |
| **Check existing beads first** | frankensearch, mcp-agent-mail: always run `br list --status=open` before creating new beads to avoid duplicates |
| **Cross-reference with existing epic** | mcp-agent-mail: found an existing epic `br-3h13` for test completeness — added new tracks under it rather than creating a parallel epic |
| **Always return 501 = API stub** | midas-edge: `promo/validate/route.ts` returned 501 Not Implemented with no callers |
| **Measure function body length with jq** | Codex sessions: `ast-grep --json \| jq 'sort_by(.range.end.line - .range.start.line)'` to find suspiciously short functions |
| **Tests expose stubs** | mcp-agent-mail: E2E audit found `null_fields` and `unicode` test files were themselves stubs (only 5-7 real assertions) |

**Full detection patterns with these behavioral checks:** [DETECTION-METHODS.md](references/DETECTION-METHODS.md)

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Grep only for "TODO" | Use ALL detection methods — keywords, AST, heuristics |
| Skip project understanding | Read AGENTS.md and README.md first, always |
| Fix stubs without understanding intent | Trace through callers to understand what the real impl should do |
| Create one giant bead | One bead per stub/mock with proper dependencies |
| Start implementing before planning | Iterate in plan space first — it's cheaper |
| Forget tests | Every resolved stub needs tests proving it works |
| Oversimplify the resolution | Real implementations need real logic, not slightly better stubs |

---

## Checklist

- [ ] **Understand project:** Read AGENTS.md, README.md, explore architecture
- [ ] **Detect tooling:** Check for `.beads/` and `br` CLI
- [ ] **Keyword scan:** ripgrep for TODO/FIXME/STUB/MOCK/PLACEHOLDER/etc.
- [ ] **Unimplemented scan:** `todo!()`, `unimplemented!()`, `NotImplementedError`, `pass`
- [ ] **Return value scan:** Hardcoded returns, empty returns, always-true/false
- [ ] **AST scan:** ast-grep for suspiciously short functions/methods/classes
- [ ] **Behavioral scan:** `sleep()` as fake work, hardcoded scores, 501 routes, disabled features
- [ ] **Caller tracing:** For each suspect, trace callers to confirm real dependency on output
- [ ] **Divergent path check:** Look for same concept implemented differently in two places
- [ ] **Stub test check:** Test files with <5 assertions may themselves be stubs
- [ ] **Compile table:** All suspects with file:line, type, snippet, justification, **blocker status**
- [ ] **Categorize:** Just-needs-code / Blocked-on-infra / Dead-code / Intentional-stub
- [ ] **Check existing beads:** Avoid creating duplicates of already-tracked issues
- [ ] **Choose workflow:** Beads (5+ items) or TODO list (<5 items)
- [ ] **Plan resolution:** Comprehensive, detailed plan for each item
- [ ] **Refine plan:** 2-3 iterations in plan space before implementing
- [ ] **Resolve all items:** Implement real code, add tests
- [ ] **Verify:** Run tests, re-scan to confirm zero remaining stubs

---

## References

| Need | File |
|------|------|
| Full detection patterns by language | [DETECTION-METHODS.md](references/DETECTION-METHODS.md) |
| AST-grep patterns for structural analysis | [AST-PATTERNS.md](references/AST-PATTERNS.md) |
| Resolution strategies and examples | [RESOLUTION-STRATEGIES.md](references/RESOLUTION-STRATEGIES.md) |
# AST-Grep Patterns for Mock/Stub Detection

## Rust

### Explicit Stubs

```bash
# todo!() and unimplemented!() in function bodies
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { todo!($$$) }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { unimplemented!($$$) }'
ast-grep run -l Rust -p 'fn $NAME($$$) { todo!($$$) }'

# panic! used as placeholder
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { panic!($$$) }'
```

### Empty / Trivial Implementations

```bash
# Empty function bodies
ast-grep run -l Rust -p 'fn $NAME($$$) { }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { Default::default() }'

# Empty impl blocks
ast-grep run -l Rust -p 'impl $TRAIT for $TYPE { }'

# Impl blocks with only one trivial method
ast-grep run -l Rust -p 'impl $TYPE {
    fn $NAME(&self) -> $RET { $SINGLE }
}'
```

### Suspicious Return Patterns

```bash
# Always returns Ok with empty/default value
ast-grep run -l Rust -p 'fn $NAME($$$) -> Result<$T, $E> { Ok(Default::default()) }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> Result<$T, $E> { Ok(vec![]) }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> Result<$T, $E> { Ok(String::new()) }'

# Always returns Some/None
ast-grep run -l Rust -p 'fn $NAME($$$) -> Option<$T> { None }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> Option<$T> { Some(Default::default()) }'

# Always returns hardcoded bool
ast-grep run -l Rust -p 'fn $NAME($$$) -> bool { true }'
ast-grep run -l Rust -p 'fn $NAME($$$) -> bool { false }'
```

### Error Handling Stubs

```bash
# Empty error arms
ast-grep run -l Rust -p 'Err(_) => {}'
ast-grep run -l Rust -p 'Err($E) => Ok(())'
ast-grep run -l Rust -p 'Err(_) => Default::default()'

# Blanket unwrap (often placeholder for proper error handling)
ast-grep run -l Rust -p '$EXPR.unwrap()'
```

---

## Python

### Explicit Stubs

```bash
# pass-only functions
ast-grep run -l Python -p 'def $NAME($$$):
    pass'

# Ellipsis stubs (protocol/ABC methods)
ast-grep run -l Python -p 'def $NAME($$$):
    ...'

# NotImplementedError
ast-grep run -l Python -p 'def $NAME($$$):
    raise NotImplementedError($$$)'
```

### Trivial Returns

```bash
# Return None (explicit)
ast-grep run -l Python -p 'def $NAME($$$):
    return None'

# Return empty collections
ast-grep run -l Python -p 'def $NAME($$$):
    return {}'
ast-grep run -l Python -p 'def $NAME($$$):
    return []'
ast-grep run -l Python -p 'def $NAME($$$):
    return ""'
```

---

## TypeScript / JavaScript

### Explicit Stubs

```bash
# Empty functions
ast-grep run -l TypeScript -p 'function $NAME($$$) { }'
ast-grep run -l TypeScript -p '($$$) => { }'
ast-grep run -l TypeScript -p 'async function $NAME($$$) { }'

# Throw not-implemented
ast-grep run -l TypeScript -p 'function $NAME($$$) { throw new Error($$$) }'
```

### Trivial Returns

```bash
# Return undefined/null
ast-grep run -l TypeScript -p 'function $NAME($$$) { return undefined; }'
ast-grep run -l TypeScript -p 'function $NAME($$$) { return null; }'

# Return empty structures
ast-grep run -l TypeScript -p 'function $NAME($$$) { return {}; }'
ast-grep run -l TypeScript -p 'function $NAME($$$) { return []; }'
```

### Empty Class Methods

```bash
ast-grep run -l TypeScript -p '$NAME($$$) { }'
ast-grep run -l TypeScript -p 'async $NAME($$$) { }'
```

---

## Go

### Explicit Stubs

```bash
# Empty functions
ast-grep run -l Go -p 'func $NAME($$$) $RET { }'

# Panic placeholders
ast-grep run -l Go -p 'func $NAME($$$) $RET { panic($$$) }'

# Return nil, nil (error swallowing)
ast-grep run -l Go -p 'func $NAME($$$) ($RET, error) { return nil, nil }'
```

---

## Combining ast-grep with jq for Analysis

```bash
# Find all functions, sort by body size (smallest first)
ast-grep run -l Rust -p 'fn $NAME($$$) $$$BODY' --json | \
  jq '[.[] | {
    name: .metaVariables.NAME.text,
    file: .file,
    start_line: .range.start.line,
    end_line: .range.end.line,
    body_lines: (.range.end.line - .range.start.line)
  }] | sort_by(.body_lines) | .[:30]'

# Find functions under N lines (suspicious threshold)
ast-grep run -l Rust -p 'fn $NAME($$$) $$$BODY' --json | \
  jq '[.[] | select((.range.end.line - .range.start.line) < 3) | {
    name: .metaVariables.NAME.text,
    file: .file,
    line: .range.start.line
  }]'
```
# Detection Methods — Full Reference

## Method 1: Keyword Search (ripgrep)

### Universal Keywords

```bash
# Explicit markers — highest confidence
rg -n "TODO|FIXME|HACK|XXX|STUB|PLACEHOLDER|MOCK|DUMMY|FAKE|TEMP\b|TEMPORARY" \
  --type-not json --type-not lock \
  -g '!target/' -g '!node_modules/' -g '!.git/' -g '!vendor/' -g '!dist/' .

# Weaker signals — need manual review
rg -n "WORKAROUND|KLUDGE|REFACTOR|REVISIT|LATER|WIP|INCOMPLETE|SKELETON|BOILERPLATE" \
  --type-not json --type-not lock \
  -g '!target/' -g '!node_modules/' -g '!.git/' .
```

### Language-Specific Unimplemented Patterns

```bash
# Rust
rg -n 'todo!\(|unimplemented!\(|panic!\("not (yet )?implemented|panic!\("TODO' --type rust .

# Python
rg -n 'raise NotImplementedError|pass\s*$|\.\.\.(\s*#.*)?$' --type py .

# TypeScript / JavaScript
rg -n 'throw new Error\(.*(not implemented|TODO|stub)|return undefined\b' --type ts --type js .

# Go
rg -n 'panic\("not implemented|panic\("TODO|// TODO|return nil, nil\b' --type go .

# Java
rg -n 'throw new UnsupportedOperationException|throw new RuntimeException\("TODO|// TODO' --type java .
```

### Suspicious Return Values

```bash
# Functions returning hardcoded trivial values (likely placeholders)
rg -n 'return true$|return false$|return 0$|return -1$|return ""$|return \[\]$|return \{\}$|return None$|return nil$' \
  --type rust --type py --type ts --type js --type go .

# Rust-specific: Ok(()) in functions that should return real data
rg -n 'Ok\(Default::default\(\)\)|Ok\(vec!\[\]\)|Ok\(String::new\(\)\)|Ok\(HashMap::new\(\)\)' --type rust .
```

---

## Method 2: AST Structural Analysis (ast-grep)

### Finding Suspiciously Short Functions

The insight: a function with only 1-2 statements is suspicious if it's supposed to do real work. Use ast-grep to find these structurally.

```bash
# Rust — single-statement functions (likely stubs)
ast-grep run -l Rust -p 'fn $NAME($$$ARGS) { $SINGLE }' --json

# Rust — functions with only todo!/unimplemented!
ast-grep run -l Rust -p 'fn $NAME($$$ARGS) -> $RET { todo!() }' --json
ast-grep run -l Rust -p 'fn $NAME($$$ARGS) -> $RET { unimplemented!() }' --json

# Rust — empty impl blocks
ast-grep run -l Rust -p 'impl $TYPE { }' --json

# Python — pass-only functions
ast-grep run -l Python -p 'def $NAME($$$ARGS):
    pass' --json

# Python — ellipsis-only functions (protocol stubs)
ast-grep run -l Python -p 'def $NAME($$$ARGS):
    ...' --json

# TypeScript — empty/trivial functions
ast-grep run -l TypeScript -p 'function $NAME($$$ARGS) { }' --json
ast-grep run -l TypeScript -p 'function $NAME($$$ARGS) { return; }' --json
ast-grep run -l TypeScript -p '($$$ARGS) => { }' --json

# Go — empty functions
ast-grep run -l Go -p 'func $NAME($$$ARGS) $RET { }' --json
```

### Measuring Function Length

Use ast-grep JSON output to extract function bodies and measure line count:

```bash
# Extract all function definitions with their ranges
ast-grep run -l Rust -p 'fn $NAME($$$) $$$BODY' --json | \
  jq '[.[] | {name: .metaVariables.NAME.text, file: .file, lines: (.range.end.line - .range.start.line)}] | sort_by(.lines) | .[:20]'
```

Functions under 3 lines in a non-trivial codebase deserve scrutiny.

---

## Method 3: Cross-Reference Analysis

### Finding Dead / Uncalled Functions

```bash
# List all function definitions
rg -n "^(pub )?(fn|def|function|func) \w+" --type rust --type py --type ts --type go . > /tmp/fn_defs.txt

# For each function name, check if it's called anywhere else
# (manual step — read the function name, grep for call sites)
```

### Finding Functions With No Tests

```bash
# List functions in src/
rg -on "fn (\w+)" --type rust src/ | sed 's/.*fn //' | sort -u > /tmp/src_fns.txt

# List functions mentioned in tests/
rg -on "\w+" --type rust tests/ | sort -u > /tmp/test_refs.txt

# Functions in src not referenced in tests
comm -23 /tmp/src_fns.txt /tmp/test_refs.txt
```

---

## Method 4: Heuristic Patterns

### Comment-Heavy, Logic-Light

Functions that are mostly comments suggesting what should happen but contain minimal actual logic:

```bash
# Find functions where comment lines outnumber code lines
# (manual analysis — read the function, count comments vs code)
rg -n "// TODO|# TODO|// PLACEHOLDER|# PLACEHOLDER" --type rust --type py --type ts .
```

### Configuration Stubs

```bash
# Default configs that look too simple
rg -n "default.*\{|Default for" --type rust .
rg -n "DEFAULT_.*=|config\[.default.\]" --type py .
```

### Error Handling Stubs

```bash
# Swallowed errors (catch-and-ignore)
rg -n "catch.*\{\s*\}|except.*pass|\.unwrap_or_default\(\)|_ =>" --type rust --type py --type ts .

# Empty error arms in match/switch
ast-grep run -l Rust -p 'Err(_) => {}' --json
ast-grep run -l Rust -p 'Err(_) => Ok(())' --json
```

---

## Method 5: Behavioral Detection (From Real Session Mining)

Discovered across sessions in midas-edge, rch, ntm, mcp-agent-mail-rust, frankensearch:

### Simulated Work (sleep/delay as placeholder for real operations)

```bash
# sleep() used to fake real work (SSH, network calls, processing)
rg -n "sleep\(|thread::sleep|time\.sleep|tokio::time::sleep|setTimeout" \
  --type rust --type py --type ts --type go . | \
  grep -vi "test\|spec\|bench\|retry\|backoff\|rate.limit\|throttle"

# Functions that log "simulating" or "fake" or "mock"
rg -n "simulat|faking|mocking|pretend" --type rust --type py --type ts --type go .
```

### Hardcoded Scores/Metrics (Should Be Computed)

```bash
# Hardcoded numeric scores that should be calculated from data
rg -n "score\s*[:=]\s*[0-9]|rarity.*[:=]\s*[0-9]|count.*[:=]\s*0[^.]|dau.*[:=]\s*0" \
  --type rust --type py --type ts .

# Always-zero metrics (DAU, MRR, counters that never increment)
rg -n "always.*0|= 0.*//|= 0.*#.*todo\|stub\|placeholder\|hack" \
  --type rust --type py --type ts .
```

### API Route Stubs (Return 501/Not Implemented)

```bash
# HTTP endpoints that return 501 or "Not Implemented"
rg -n "501|Not Implemented|not.yet.implemented|NextResponse.*501" \
  --type ts --type py --type rust --type go .
```

### Caching/Storage Stubs (Functions That Skip Real I/O)

```bash
# Functions that should persist but don't (return false, skip, no-op)
rg -n "cacheToR2.*return false|checkCache.*return null|return false.*//.*cache|return null.*//.*cache" \
  --type ts --type rust --type py .

# "warm" config disabled (feature not wired up)
rg -n "warm.*false|enable.*false|config.*false.*//.*todo\|stub\|later\|disabled" \
  --type ts --type rust --type py .
```

### Divergent Code Paths (Real Logic Exists Elsewhere)

This is the subtlest form — the function is a stub, but a *different* code path already does the real work:

```bash
# Find functions with same/similar names in different files
# Example from midas-edge: batch-enrichment.ts returned redFlagsDetected=0
# but the API route transcript-sentiment/route.ts actually counted them
rg -n "redFlags|red_flags" --type ts --type rust --type py .
# If two files have the same concept but different implementations, one is likely a stub
```

### Stub Tests (Test Files That Are Themselves Stubs)

```bash
# Test files with very few assertions (likely placeholder tests)
rg -c "assert|expect|should" tests/ --type rust --type ts --type py | \
  sort -t: -k2 -n | head -20
# Files with < 5 assertions are suspicious
```

---

## Triage: Real Stub vs False Positive

| Signal | Likely Real Stub | Likely False Positive |
|--------|-----------------|----------------------|
| `todo!()` / `unimplemented!()` | Always real | — |
| `pass` / empty body | In production code | In abstract base class / protocol |
| `return true` | In validation function | In feature flag check |
| Short function (1-2 lines) | In complex module | Legitimate accessor/getter |
| `// TODO` | With description of missing work | Old resolved TODO left behind |
| Hardcoded return | In function that should compute | In test fixture / constant |

**Rule of thumb:** Trace callers. If the function's callers depend on real output, it's a stub. If callers only need the type signature (trait impl, protocol), it may be intentional.
# Resolution Strategies

## Decision Tree: How to Resolve Each Finding

```
Finding identified
│
├─ Is it an explicit TODO/FIXME with description?
│  └─ YES → Implement what the comment describes, remove the comment
│
├─ Is it todo!()/unimplemented!()/NotImplementedError?
│  └─ YES → Trace callers to understand expected behavior, implement fully
│
├─ Is it a function returning a hardcoded value?
│  ├─ Validation function returning `true` → Implement real validation logic
│  ├─ Fetch function returning `{}` → Implement real data fetching
│  └─ Conversion returning default → Implement real conversion
│
├─ Is it an empty error handler?
│  └─ YES → Implement proper error propagation or recovery
│
├─ Is it a `pass`/empty body in production code?
│  ├─ Abstract method → May be intentional (verify)
│  └─ Concrete method → Implement real logic
│
└─ Is it a suspiciously short function?
   ├─ Getter/accessor → Likely fine (false positive)
   ├─ Builder pattern → Likely fine (false positive)
   └─ Business logic → Needs real implementation
```

---

## Resolution with Beads (br)

### Creating the Bead Structure

For each stub/mock found, create a bead with enough detail that a future agent can implement it without any additional context:

```bash
# Parent epic
br create \
  --title="Resolve all mocks/stubs/placeholders" \
  --type=epic \
  --priority=1 \
  --comment="Systematic resolution of N stubs/mocks/placeholders identified by mock-code-finder scan on $(date +%Y-%m-%d). See individual child tasks for details."

# Child task (one per finding)
br create \
  --title="Implement real logic for validate_input() in src/parser.rs:42" \
  --type=task \
  --priority=2 \
  --comment="CURRENT STATE: fn validate_input() -> bool { true }
PROBLEM: Always returns true — no actual validation occurs.
CALLERS: Called from process_request() at src/handler.rs:88. Callers depend on this returning false for malformed input.
REQUIRED IMPLEMENTATION:
  1. Parse input according to schema defined in src/schema.rs
  2. Validate required fields present
  3. Validate field types match schema
  4. Return false with error details on failure
FILES TO MODIFY: src/parser.rs
TESTS TO ADD: tests/parser_validation_test.rs — test valid input (returns true), missing fields (returns false), wrong types (returns false), edge cases (empty input, unicode, max-length)"

# Add dependency
br dep add <task-id> <depends-on-id>
```

### Bead Comment Template

Each bead comment should include ALL of these sections:

```
CURRENT STATE: [What the stub currently does — exact code]
PROBLEM: [Why this is insufficient]
CALLERS: [Who calls this function, what they expect]
REQUIRED IMPLEMENTATION: [Numbered steps for the real implementation]
FILES TO MODIFY: [Exact paths]
TESTS TO ADD: [What tests, what they assert]
DEPENDENCIES: [Other stubs that must be resolved first, if any]
CONSIDERATIONS: [Edge cases, performance, compatibility notes]
```

### Validation with bv

After creating all beads:

```bash
# Check dependency graph health
bv --robot-triage | jq '.quick_ref'

# Find circular dependencies (must fix!)
bv --robot-insights | jq '.Cycles'

# Find quick wins (stubs with no dependencies, easy to resolve)
bv --robot-triage | jq '.quick_wins'

# Optimal execution order
bv --robot-plan | jq '.plan.tracks'
```

---

## Resolution with TODO Tracking (No Beads)

For smaller lists or projects without beads, maintain a markdown checklist:

```markdown
## Mock/Stub Resolution Plan

### 1. src/parser.rs:42 — validate_input() always returns true
- [ ] Implement real validation against schema
- [ ] Add test: valid input returns true
- [ ] Add test: missing fields returns false
- [ ] Add test: wrong types returns false
- [ ] Remove stub comment

### 2. src/handler.rs:100 — process_error() is empty
- [ ] Implement error logging
- [ ] Implement error recovery / retry
- [ ] Add test: errors are logged
- [ ] Add test: transient errors trigger retry
```

---

## Post-Resolution Verification

After resolving all stubs:

```bash
# Re-run the full detection scan
rg -n "TODO|FIXME|HACK|XXX|STUB|PLACEHOLDER|MOCK|DUMMY|FAKE" \
  --type-not json --type-not lock -g '!target/' -g '!node_modules/' .

# Re-run ast-grep short-function scan
ast-grep run -l Rust -p 'fn $NAME($$$) -> $RET { todo!() }' --json

# Run test suite
cargo test --all  # or npm test, pytest, etc.

# Confirm zero remaining stubs
echo "Target: 0 findings on rescan"
```

---

## Common Pitfalls in Resolution

| Pitfall | Why It's Bad | Do Instead |
|---------|-------------|------------|
| Replace stub with slightly better stub | Still not real code | Implement fully or defer explicitly |
| Skip tests for resolved stubs | No proof it works | Every resolution needs at least one test |
| Resolve in random order | May hit dependency issues | Use `bv --robot-plan` or resolve leaves first |
| Oversimplify the implementation | Loses functionality | Trace callers to understand full requirements |
| Forget to remove TODO comments | Future scans find stale markers | Delete the marker when the work is done |
| Create beads without enough detail | Future agent can't implement independently | Use the bead comment template above |
