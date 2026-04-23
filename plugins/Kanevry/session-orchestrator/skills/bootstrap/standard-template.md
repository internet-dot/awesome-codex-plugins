# Bootstrap Standard Template

> Scaffold instructions for the Standard tier.
> Called from `skills/bootstrap/SKILL.md` Phase 3 when `CONFIRMED_TIER = standard`.

Standard tier is a strict superset of Fast tier. Execute all Fast-tier steps first, then the Standard-specific steps below.

## Step 1–7: Execute Fast Tier

Read and execute `skills/bootstrap/fast-template.md` Steps 1–7 in full. Do not skip any step. The Fast commit (`chore: bootstrap (fast)`) is NOT made — Fast steps produce files only; the single commit happens at Standard Step 7 below.

**Exception to fast-template Step 6:** Do not run the git commit in fast-template Step 6. All files (Fast + Standard) are committed together at Standard Step 7 below.

**Exception to fast-template Step 5 (bootstrap.lock):** Do not write `.orchestrator/bootstrap.lock` yet. The lock is written with `tier: standard` at Standard Step 6.

## Archetype Detection

Before executing the stack-specific steps, resolve the final archetype:

```
ARCHETYPE = CONFIRMED_ARCHETYPE  # set by SKILL.md from intensity-heuristic or user selection
```

Valid values: `static-html` | `node-minimal` | `nextjs-minimal` | `python-uv`

If `ARCHETYPE` is `null` or unset at this point, default to `node-minimal`.

The sections below are conditional on `ARCHETYPE`. Execute only the section that matches.

---

## Archetype: `static-html`

No build tooling needed. Create minimal structure for a static HTML project.

### Step S1: No manifest file

Static HTML has no `package.json` or `pyproject.toml`. Skip to Step S2.

### Step S2: No tsconfig

Static HTML has no TypeScript. Skip to Step S3.

### Step S3: No ESLint / Prettier

No linter for plain HTML/CSS/JS projects. Skip to Step S4.

### Step S4: No test framework

No automated test for static HTML. Skip to Step S5.

### Step S5: Expanded README.md

Overwrite the stub README.md created by the Fast step:

```markdown
# <REPO_NAME>

<One-sentence description.>

## Usage

Open `index.html` in a browser or serve with any static file server:

```bash
npx serve .
```

## Development

Edit `index.html`, `style.css`, and `script.js` directly. No build step required.
```

### Step S6: .editorconfig

Write `.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.html]
indent_size = 2

[*.css]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

---

## Archetype: `node-minimal`

Node/TypeScript project without a framework. Creates `package.json`, `tsconfig.json`, ESLint, Prettier, Vitest, and one sanity test.

### Step S1: package.json

Write `package.json`:

```json
{
  "name": "<REPO_NAME>",
  "version": "0.1.0",
  "description": "<One-sentence description from user prompt>",
  "type": "module",
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### Step S2: tsconfig.json

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step S3: ESLint v9 flat config + Prettier

Write `eslint.config.mjs`:

```js
import js from "@eslint/js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
];
```

Write `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Step S4: Vitest sanity test

Create directory and test file:

```bash
mkdir -p "$REPO_ROOT/tests"
```

Write `tests/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("true is true", () => {
    expect(true).toBe(true);
  });
});
```

Also create the source directory so TypeScript is happy:

```bash
mkdir -p "$REPO_ROOT/src"
```

Write `src/index.ts` (minimal entry point):

```ts
// Entry point — replace with your implementation.
export {};
```

### Step S5: Expanded README.md

Overwrite the stub README.md:

```markdown
# <REPO_NAME>

<One-sentence description.>

## Installation

```bash
pnpm install
```

## Usage

```bash
pnpm build
```

## Development

| Command | Description |
|---------|-------------|
| `pnpm build` | Type-check with TypeScript |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests with Vitest |
```

### Step S6: .editorconfig

Write `.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Archetype: `nextjs-minimal`

Bare Next.js setup. Creates `package.json`, `tsconfig.json`, ESLint, Prettier, Vitest, and one sanity test.

### Step S1: package.json

Write `package.json`:

```json
{
  "name": "<REPO_NAME>",
  "version": "0.1.0",
  "description": "<One-sentence description from user prompt>",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### Step S2: tsconfig.json

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step S3: ESLint v9 flat config + Prettier

Write `eslint.config.mjs`:

```js
import js from "@eslint/js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".next/", "coverage/"],
  },
];
```

Write `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Step S4: Vitest sanity test

Create directory and test file:

```bash
mkdir -p "$REPO_ROOT/tests"
```

Write `tests/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("true is true", () => {
    expect(true).toBe(true);
  });
});
```

Create minimal Next.js app entry:

```bash
mkdir -p "$REPO_ROOT/src/app"
```

Write `src/app/page.tsx`:

```tsx
export default function Home() {
  return <main><h1><REPO_NAME></h1></main>;
}
```

Write `src/app/layout.tsx`:

```tsx
export const metadata = { title: "<REPO_NAME>" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step S5: Expanded README.md

Overwrite the stub README.md:

```markdown
# <REPO_NAME>

<One-sentence description.>

## Installation

```bash
pnpm install
```

## Usage

```bash
pnpm dev      # Start development server at http://localhost:3000
pnpm build    # Production build
pnpm start    # Start production server
```

## Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests with Vitest |
```

### Step S6: .editorconfig

Write `.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Archetype: `python-uv`

Python project using `uv` as the package manager and `pytest` for testing.

### Step S1: pyproject.toml

Write `pyproject.toml`:

```toml
[project]
name = "<REPO_NAME>"
version = "0.1.0"
description = "<One-sentence description from user prompt>"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[project.optional-dependencies]
dev = [
  "pytest>=8.0",
  "ruff>=0.4",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

### Step S2: No tsconfig

Python project. Skip.

### Step S3: Ruff (replaces ESLint/Prettier for Python)

Ruff is already configured in `pyproject.toml` above. No separate config file needed. Note: Ruff is the Python-ecosystem equivalent of ESLint + Prettier for this archetype.

### Step S4: pytest sanity test

```bash
mkdir -p "$REPO_ROOT/tests"
touch "$REPO_ROOT/tests/__init__.py"
mkdir -p "$REPO_ROOT/src"
touch "$REPO_ROOT/src/__init__.py"
```

Write `tests/test_sanity.py`:

```python
def test_sanity() -> None:
    assert True
```

### Step S5: Expanded README.md

Overwrite the stub README.md:

```markdown
# <REPO_NAME>

<One-sentence description.>

## Installation

```bash
uv sync
```

## Usage

```bash
uv run python src/main.py
```

## Development

| Command | Description |
|---------|-------------|
| `uv sync` | Install dependencies |
| `uv run ruff check .` | Lint with Ruff |
| `uv run ruff format .` | Format with Ruff |
| `uv run pytest` | Run tests with pytest |
```

### Step S6: .editorconfig

Write `.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.yml]
indent_size = 2

[*.json]
indent_size = 2
```

---

## Step 3a: Install Parallel-Sessions Rule

Write the vendored rule from `$PLUGIN_ROOT/templates/_shared/rules/parallel-sessions.md` to `$REPO_ROOT/.claude/rules/parallel-sessions.md`.

Idempotency:
- Missing → create
- Exists and byte-identical → skip silently
- Exists and differs → overwrite (vendored is canonical)

Shell:
```bash
mkdir -p "$REPO_ROOT/.claude/rules"
cp "$PLUGIN_ROOT/templates/_shared/rules/parallel-sessions.md" "$REPO_ROOT/.claude/rules/parallel-sessions.md"
```

Why: PSA-003 destructive-command safeguards require every consumer repo to carry the rule. See issue #155.

Note: This step runs before S99. If S99 executes and fetches a newer version of `parallel-sessions.md` from the baseline, the baseline version wins (S99 overwrites by design — acceptable).

## Step 3b: Initialize .orchestrator/metrics/ (#185)

Create the metrics directory and an empty learnings file so the `/evolve` skill and discovery probes have a write target from day one:

```bash
mkdir -p "$REPO_ROOT/.orchestrator/metrics"
[[ -f "$REPO_ROOT/.orchestrator/metrics/learnings.jsonl" ]] || \
  : > "$REPO_ROOT/.orchestrator/metrics/learnings.jsonl"
```

**Idempotent.** Re-running bootstrap does not overwrite an existing file.

**Gitignore guidance:** Do NOT add `.orchestrator/metrics/*.jsonl` to `.gitignore`. The files are intentionally visible in version control — they carry project learnings and session history that future contributors benefit from.

## Step S99: (Optional) Fetch Canonical Rules + Agents from Baseline

This step is OPT-IN and only executes when ALL of the following are true:
- `baseline-ref` is present in Session Config (e.g., `baseline-ref: main`)
- `GITLAB_TOKEN` env var is set
- The session-orchestrator plugin includes `scripts/lib/fetch-baseline.sh`

When triggered, this step pulls the canonical `.claude/rules/*.md` and (optionally) `.claude/agents/*.md` files directly from the baseline GitLab project (project 52 by default) into the new repo, then writes `.claude/.baseline-fetch.lock` recording the fetch.

Without this step, rules arrive in the repo via Clank's weekly baseline sync MRs (the legacy path). This step short-circuits that delay so a freshly-bootstrapped repo starts with current rules immediately.

**Implementation:**

```bash
BASELINE_REF=$(echo "$CONFIG" | jq -r '."baseline-ref" // empty')
BASELINE_PROJECT_ID=$(echo "$CONFIG" | jq -r '."baseline-project-id" // "52"')

if [[ -n "$BASELINE_REF" && -n "${GITLAB_TOKEN:-}" && -f "$PLUGIN_ROOT/scripts/lib/fetch-baseline.sh" ]]; then
  source "$PLUGIN_ROOT/scripts/lib/fetch-baseline.sh"

  # Default rule manifest — superset will harmlessly 404 individual files
  # if the baseline ever drops one (cache will keep last-known-good).
  RULES_MANIFEST=$(mktemp)
  cat > "$RULES_MANIFEST" <<MANIFEST
.claude/rules/development.md
.claude/rules/security.md
.claude/rules/security-web.md
.claude/rules/security-compliance.md
.claude/rules/testing.md
.claude/rules/test-quality.md
.claude/rules/frontend.md
.claude/rules/backend.md
.claude/rules/backend-data.md
.claude/rules/infrastructure.md
.claude/rules/swift.md
.claude/rules/mvp-scope.md
.claude/rules/cli-design.md
.claude/rules/parallel-sessions.md
.claude/rules/ai-agent.md
.claude/rules/claude-code-usage.md
MANIFEST

  echo "Fetching canonical rules from baseline (project $BASELINE_PROJECT_ID, ref $BASELINE_REF)…"
  # fetch_baseline_files_batch writes successful paths to $BASELINE_FETCH_SUCCESS_LOG.
  # Default location is $RULES_MANIFEST.success — override only if you need a custom path.
  if fetch_baseline_files_batch "$BASELINE_PROJECT_ID" "$BASELINE_REF" "$RULES_MANIFEST" "$REPO_ROOT"; then
    SUCCESS_LOG="${BASELINE_FETCH_SUCCESS_LOG:-${RULES_MANIFEST}.success}"
    if [[ -s "$SUCCESS_LOG" ]]; then
      FETCHED_JSON=$(jq -R . < "$SUCCESS_LOG" | jq -s .)
      write_baseline_fetch_lock "$REPO_ROOT/.claude/.baseline-fetch.lock" \
        "$BASELINE_PROJECT_ID" "$BASELINE_REF" "$FETCHED_JSON"
      echo "Wrote .claude/.baseline-fetch.lock ($(wc -l < "$SUCCESS_LOG" | tr -d ' ') files)"
    else
      echo "WARNING: batch reported success but produced empty success log; lock not written" >&2
    fi
    rm -f "$SUCCESS_LOG"
  else
    echo "WARNING: baseline fetch failed; rules will arrive via Clank sync MRs (legacy path)" >&2
  fi
  rm -f "$RULES_MANIFEST"
else
  echo "Skipping baseline fetch: baseline-ref not configured or GITLAB_TOKEN unset (legacy Clank-sync path)"
fi
```

**Failure handling:** If the fetch fails, this step DOES NOT abort bootstrap. The repo still has its scaffold; rules will arrive via the legacy Clank weekly sync MR. The user is informed via stderr.

**Idempotency:** Re-running bootstrap on an existing repo will overwrite `.claude/rules/*.md` files. Local edits to baseline rules in a repo will be lost on re-fetch — this is intentional (rules are canonical). Repo-specific extensions belong in `.claude/rules/local/*.md` (not fetched).

---

## Step 5.5: Vault-Registration Prompt (Product Repos) (#190)

If this repo shows product-repo signals (framework dep + personas/content dir + product env vars), offer to register a vault entry in Session Config.

**Detection (via `scripts/lib/product-repo-detect.mjs`):**

```bash
node --input-type=module -e "
import { detectProductRepo, hasVaultConfig } from '${PLUGIN_ROOT}/scripts/lib/product-repo-detect.mjs';
const result = detectProductRepo({ repoRoot: process.cwd() });
const already = hasVaultConfig('$REPO_ROOT/CLAUDE.md') || hasVaultConfig('$REPO_ROOT/AGENTS.md');
if (!result.isProductRepo || already) process.exit(0);
process.stdout.write(JSON.stringify(result, null, 2));
process.exit(10);  // signal: prompt user
"
```

When the script exits 10 (product signals detected, no vault yet): prompt the user:

> Repo appears to carry product data (framework: \<detected>, signals: \<list>). Create vault registration in Session Config? [Y/n]

**On Y (default):** Append the following block to the `## Session Config` section of CLAUDE.md:

```yaml
vault:
  path: ${VAULT_PATH:-$HOME/Projects/vault}
  product-domain: <prompt user for a short domain tag, e.g. "buchhaltung", "lead-gen">
  persona-db: <optional: path to persona data file, blank if N/A>
```

**On N:** skip silently. The detection may re-run on next bootstrap; idempotency comes from `hasVaultConfig` — once `vault:` exists in Session Config, the prompt is skipped.

**Examples from real repos:**

| Repo | Framework | Signals | Vault Entry |
|------|-----------|---------|-------------|
| BuchhaltGenie | Next.js | supabase, stripe, personas/ | `product-domain: buchhaltung` |
| LeadPipeDACH | Next.js | stripe, posthog | `product-domain: lead-gen` |
| GotzendorferAT | Nuxt | postgres, sentry | `product-domain: portfolio` |

**Idempotent.** If CLAUDE.md already has a `vault:` key inside Session Config, the prompt is skipped.

---

## Step 6: Write bootstrap.lock (Standard)

Write `.orchestrator/bootstrap.lock`:

```yaml
# .orchestrator/bootstrap.lock
version: 1
tier: standard
archetype: <CONFIRMED_ARCHETYPE>
timestamp: <current ISO 8601 UTC — e.g., 2026-04-16T09:30:00Z>
source: <claude-init | plugin-template | projects-baseline>
plugin-version: <session-orchestrator plugin version — read from $PLUGIN_ROOT/package.json .version field>
bootstrapped-at: <current ISO 8601 UTC — same value as timestamp; distinct field for age-validation probe>
```

Set `source` using the same logic as fast-template Step 5:
- `projects-baseline` if `PATH_TYPE = private` and baseline scripts were used
- `claude-init` if `claude init` ran successfully
- `plugin-template` otherwise

## Step 6.5: Quality-Gate Policy File (#183)

Write the canonical quality-gate commands to `.orchestrator/policy/quality-gates.json`. Bootstrap detects the package manager and writes sensible defaults; users may hand-edit afterwards.

**Idempotency:** Skip this step if `.orchestrator/policy/quality-gates.json` already exists. Do not overwrite user edits.

```bash
POLICY_FILE="$REPO_ROOT/.orchestrator/policy/quality-gates.json"
if [[ ! -f "$POLICY_FILE" ]]; then
  mkdir -p "$REPO_ROOT/.orchestrator/policy"
  # Detect package manager via scripts/lib/package-manager.mjs (falls back to npm defaults)
  PM_JSON="$(node --input-type=module -e "
    import { detectPackageManager, defaultQualityGateCommands } from '$PLUGIN_ROOT/scripts/lib/package-manager.mjs';
    const pm = detectPackageManager('$REPO_ROOT');
    process.stdout.write(JSON.stringify(defaultQualityGateCommands(pm)));
  " 2>/dev/null)"

  # Fallback if node helper unavailable: hardcode npm defaults
  if [[ -z "$PM_JSON" ]]; then
    PM_JSON='{"test":{"command":"npm test","required":true},"typecheck":{"command":"npm run typecheck","required":true},"lint":{"command":"npm run lint","required":true}}'
  fi

  jq -n --argjson cmds "$PM_JSON" '{
    "version": 1,
    "rationale": "Canonical quality-gate commands. Generated by bootstrap. Edit to change test/typecheck/lint invocations across skills. Schema: .orchestrator/policy/quality-gates.schema.json",
    "commands": $cmds
  }' > "$POLICY_FILE"
  echo "Wrote $POLICY_FILE"
fi
```

## Step 6.6: STATE.md Scaffold (#184)

Scaffold a placeholder `.claude/STATE.md` using the template at `skills/bootstrap/STATE.md.template`. The placeholder records `status: idle` — sessions overwrite it at Pre-Wave 1b.

**Idempotency:** Skip if `.claude/STATE.md` already exists.

```bash
STATE_FILE="$REPO_ROOT/.claude/STATE.md"
if [[ ! -f "$STATE_FILE" ]]; then
  mkdir -p "$REPO_ROOT/.claude"
  ISO_NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  sed "s|<ISO>|$ISO_NOW|g" "$PLUGIN_ROOT/skills/bootstrap/STATE.md.template" > "$STATE_FILE"
  echo "Wrote $STATE_FILE"
fi
```

On Codex CLI / Cursor IDE, substitute `.codex/` or `.cursor/` for `.claude/` per the platform state-directory convention.

## Step 6.7: .claude/agents/ Scaffold (#189)

Copy the opinionated agent templates into the consumer repo:

```bash
mkdir -p "$REPO_ROOT/.claude/agents"
cp "$PLUGIN_ROOT/skills/bootstrap/templates/agents/"*.md "$REPO_ROOT/.claude/agents/"
```

This scaffolds 3 opinionated agents (`project-discovery`, `project-code-review`, `project-quality-gate`) following CLAUDE.md Agent Authoring Rules. Consumer repos should edit descriptions/bodies to match project specifics — but keep the frontmatter structure intact (validated by `agent-frontmatter-invalid` probe).

**Idempotency:** Existing files under `.claude/agents/` are not overwritten — skip any file that already exists.

## Step 7: Initial Git Commit

Stage all created files and commit:

```bash
cd "$REPO_ROOT"
BOOTSTRAP_FILES=(
  CLAUDE.md AGENTS.md .gitignore README.md .orchestrator/bootstrap.lock
  .orchestrator/policy/quality-gates.json
  package.json pyproject.toml tsconfig.json eslint.config.mjs .prettierrc
  .editorconfig src/ tests/ .claude/
)
# Add only the files bootstrap created — no sweeping -u/-A to avoid catching pre-existing files
for _f in "${BOOTSTRAP_FILES[@]}"; do
  [[ -e "$_f" ]] && git add -- "$_f"
done
git commit -m "chore: bootstrap (standard)"
```

The commit message is fixed — do not vary it.

## Step 8: Report Created Files

After the commit succeeds, output a concise summary of all files created (Fast + Standard). Include the archetype in the header line:

```
Bootstrap (standard, <archetype>) complete. Created:
  CLAUDE.md (or AGENTS.md)             — Session Config (7 mandatory fields, validated)
  .gitignore                            — stack-appropriate rules
  README.md                             — expanded with Installation, Usage, Dev
  .editorconfig                         — consistent editor settings
  <manifest file>                       — e.g., package.json / pyproject.toml
  <tsconfig.json>                       — if JS/TS archetype
  <eslint.config.mjs + .prettierrc>    — if JS/TS archetype
  <tests/sanity.test.ts or equiv>       — sanity test
  .claude/rules/parallel-sessions.md   — vendored PSA rule (issue #155)
  .claude/STATE.md                      — idle placeholder (issue #184)
  .orchestrator/bootstrap.lock          — version: 1, tier: standard
  .orchestrator/policy/quality-gates.json — test/typecheck/lint commands (issue #183)
Committed: "chore: bootstrap (standard)"
```

Then return control to `SKILL.md` Phase 5.
