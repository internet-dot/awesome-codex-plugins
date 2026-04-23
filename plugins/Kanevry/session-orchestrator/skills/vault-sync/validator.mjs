#!/usr/bin/env node
/**
 * validator.mjs — Meta-Vault frontmatter + wiki-link validator (Phase 1).
 *
 * Reads every `.md` file under VAULT_DIR, parses YAML frontmatter, validates
 * against the canonical vaultFrontmatterSchema, and checks wiki-link targets
 * resolve inside the vault. Emits a machine-readable JSON report to stdout and
 * exits 0 on clean vault (warnings allowed), 1 on validation errors, 0 when
 * there is no vault to validate.
 *
 * ── Schema drift ────────────────────────────────────────────────────────────
 * The Zod schema below is auto-vendored from the canonical source:
 *   projects-baseline/packages/zod-schemas/src/vault-frontmatter.ts
 * This skill is intentionally self-contained (no workspace dependency on the
 * shared monorepo package), so the schema is vendored here via the managed
 * sync script: scripts/sync-vault-schema.mjs
 *
 * To update after a canonical change, run:
 *   node scripts/sync-vault-schema.mjs --write
 * then commit the resulting validator.mjs diff.
 *
 * The schema block below is fenced by a pair of sentinel comments managed by
 * sync-vault-schema.mjs. DO NOT edit between them by hand — any manual edit
 * will be overwritten on the next --write run and will cause --check to report
 * drift.
 *
 * Drift is gated by tests/schema-drift.test.mjs (5 scenarios: idempotency,
 * --check clean, --check drift, missing canonical, sentinel presence) and
 * by the GitLab CI pipeline which runs --check mode against a freshly-cloned
 * canonical to catch any out-of-band edits.
 *
 * 2026-04-13: tagPathRegex added for Obsidian nested-tag support (e.g. meta/schema).
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname, basename } from 'node:path';
import { z } from 'zod';
import YAML from 'yaml';

// ── Inline vendored schema (mirrors projects-baseline vault-frontmatter.ts) ──
// ── BEGIN GENERATED SCHEMA (sync-vault-schema.mjs) — do not edit between sentinels ──
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tagPathRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const isoDateRegex =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

const vaultNoteTypeSchema = z.enum([
  'note',
  'daily',
  'project',
  'person',
  'reference',
  'idea',
  'learning',
  'session',
]);

const vaultNoteStatusSchema = z.enum([
  'draft',
  'active',
  'verified',
  'archived',
  'production',
  'mvp',
  'idea',
]);

const vaultFrontmatterSchema = z
  .object({
    id: z
      .string()
      .regex(slugRegex, 'Ungueltige id (kebab-case slug format required)')
      .min(2)
      .max(128),
    type: vaultNoteTypeSchema,
    created: z.string().regex(isoDateRegex, 'Ungueltiges Datum (ISO 8601 required)'),
    updated: z.string().regex(isoDateRegex, 'Ungueltiges Datum (ISO 8601 required)'),
    title: z.string().min(1).max(200).optional(),
    tags: z
      .array(
        z
          .string()
          .regex(tagPathRegex, 'Ungueltiger tag (kebab-case segments joined by / — e.g. meta/schema)')
          .min(1)
          .max(64),
      )
      .optional(),
    status: vaultNoteStatusSchema.optional(),
    expires: z
      .string()
      .regex(isoDateRegex, 'Ungueltiges Datum (ISO 8601 required)')
      .optional(),
    source: z.string().optional(),
    sources: z.array(z.string()).optional(),
    aliases: z.array(z.string().min(1).max(200)).optional(),
  })
  .passthrough();
// ── END GENERATED SCHEMA ──

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const checkExpires = args.includes('--check-expires');

// Parse --mode <hard|warn|off> (default: hard)
// Parse --exclude <glob> (repeatable)
let mode = 'hard';
const excludePatterns = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--mode') {
    const v = args[i + 1];
    if (v === 'hard' || v === 'warn' || v === 'off') {
      mode = v;
    } else {
      process.stderr.write(
        `validator.mjs: invalid --mode value "${v}" (expected hard|warn|off)\n`,
      );
      process.exit(2);
    }
    i++;
  } else if (a.startsWith('--mode=')) {
    const v = a.slice('--mode='.length);
    if (v === 'hard' || v === 'warn' || v === 'off') {
      mode = v;
    } else {
      process.stderr.write(
        `validator.mjs: invalid --mode value "${v}" (expected hard|warn|off)\n`,
      );
      process.exit(2);
    }
  } else if (a === '--exclude') {
    if (args[i + 1]) {
      excludePatterns.push(args[i + 1]);
      i++;
    }
  } else if (a.startsWith('--exclude=')) {
    excludePatterns.push(a.slice('--exclude='.length));
  }
}

// ── Tiny fnmatch-style glob matcher ─────────────────────────────────────────
// Supports:
//   **    — any number of path segments (zero or more)
//   *     — any characters except `/`
//   ?     — any single character except `/`
//   literal path separators and characters otherwise
// Operates on POSIX-style forward-slash relative paths.
function globToRegExp(glob) {
  // Normalise input
  const g = glob.replace(/\\/g, '/');
  let re = '^';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        // `**` — match across path segments
        // Also swallow a following `/` so that `**/foo` matches `foo` at root.
        const nextSlash = g[i + 2] === '/';
        re += '(?:.*?)';
        if (nextSlash) i += 2;
        else i += 1;
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else if ('.+^$(){}|[]\\'.includes(c)) {
      re += '\\' + c;
    } else {
      re += c;
    }
  }
  re += '$';
  return new RegExp(re);
}

const excludeRegexes = excludePatterns.map((p) => globToRegExp(p));

function isExcluded(relPath) {
  const p = relPath.replace(/\\/g, '/');
  for (const re of excludeRegexes) {
    if (re.test(p)) return true;
  }
  return false;
}

// ── Vault marker detection ──────────────────────────────────────────────────
// Returns true if dir contains at least one recognized vault marker:
//   1. _meta/ directory
//   2. CLAUDE.md containing both "## Session Config" and "vault-sync:"
//   3. .obsidian/ directory
function isVaultDir(dir) {
  if (existsSync(join(dir, '_meta')) && statSync(join(dir, '_meta')).isDirectory()) return true;
  if (existsSync(join(dir, '.obsidian')) && statSync(join(dir, '.obsidian')).isDirectory()) return true;
  const claudeMd = join(dir, 'CLAUDE.md');
  if (existsSync(claudeMd)) {
    try {
      const content = readFileSync(claudeMd, 'utf8');
      if (content.includes('## Session Config') && content.includes('vault-sync:')) return true;
    } catch {
      // unreadable CLAUDE.md — not a vault marker
    }
  }
  return false;
}

// ── Resolve vault dir ───────────────────────────────────────────────────────
let vaultDir;
if (process.env.VAULT_DIR) {
  vaultDir = resolve(process.env.VAULT_DIR);
  // Only warn when the directory exists but lacks vault markers.
  // Non-existent dirs are handled further down by the existsSync guard (status: skipped).
  if (existsSync(vaultDir) && statSync(vaultDir).isDirectory() && !isVaultDir(vaultDir)) {
    process.stderr.write(
      'vault-sync: warning: VAULT_DIR set but directory lacks vault markers (_meta/, CLAUDE.md with vault-sync, or .obsidian/)\n',
    );
  }
} else {
  const cwd = process.cwd();
  if (isVaultDir(cwd)) {
    vaultDir = resolve(cwd);
  } else {
    process.stderr.write(
      [
        'vault-sync: error: VAULT_DIR is not set and the current working directory does not look like a Meta-Vault.',
        '',
        'Expected one of the following in cwd:',
        '  - _meta/ directory',
        "  - CLAUDE.md with a '## Session Config' and 'vault-sync:' block",
        '  - .obsidian/ directory',
        '',
        'Fix: set VAULT_DIR to the vault root, or cd into the vault before running.',
        '',
      ].join('\n'),
    );
    process.exit(2);
  }
}

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.obsidian',
  '90-archive',
]);

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

// Mode off → no-op (useful for onboarding / emergency bypass).
if (mode === 'off') {
  emit({
    status: 'skipped-mode-off',
    mode,
    vault_dir: vaultDir,
    files_checked: 0,
    excluded_count: 0,
    files_skipped_no_frontmatter: 0,
    errors: [],
    warnings: [],
  });
  process.exit(0);
}

// No vault to check → skipped.
if (!existsSync(vaultDir) || !statSync(vaultDir).isDirectory()) {
  emit({ status: 'skipped', reason: 'no vault', mode, vault_dir: vaultDir });
  process.exit(0);
}

// ── Crawl .md files ─────────────────────────────────────────────────────────
function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.') {
      // always skip dot-dirs/files except allow top-level
      if (e.isDirectory() && EXCLUDED_DIRS.has(e.name)) continue;
      if (e.isDirectory()) continue;
      // skip hidden files
      continue;
    }
    if (e.isDirectory()) {
      if (EXCLUDED_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(join(dir, e.name));
    }
  }
}

const mdFiles = [];
walk(vaultDir, mdFiles);

if (mdFiles.length === 0) {
  emit({ status: 'skipped', reason: 'no vault', mode, vault_dir: vaultDir });
  process.exit(0);
}

// ── Parse frontmatter ───────────────────────────────────────────────────────
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return { hasFrontmatter: false };
  const yamlBlock = m[1];
  try {
    const data = YAML.parse(yamlBlock);
    return { hasFrontmatter: true, data: data ?? {}, raw: yamlBlock };
  } catch (err) {
    return { hasFrontmatter: true, parseError: err.message || String(err) };
  }
}

// ── Build link index (filename -> path) ─────────────────────────────────────
const fileIndex = new Map(); // basename-without-ext -> [absolute paths]
for (const f of mdFiles) {
  const key = basename(f, '.md');
  if (!fileIndex.has(key)) fileIndex.set(key, []);
  fileIndex.get(key).push(f);
}

// ── Wiki-link regex — captures target (pre-alias, pre-anchor) ───────────────
const WIKILINK_RE = /\[\[([^\]|#]+?)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

function extractWikiLinks(content) {
  const targets = new Set();
  let m;
  while ((m = WIKILINK_RE.exec(content)) !== null) {
    targets.add(m[1].trim());
  }
  return [...targets];
}

function resolveWikiLink(target, sourceFile) {
  // Target may be a bare name ("my-note") or a path ("01-projects/foo/_overview").
  // Try exact path first (relative to vault), then basename lookup.
  const candidate1 = resolve(vaultDir, target.endsWith('.md') ? target : target + '.md');
  if (existsSync(candidate1)) return true;

  // Try relative to source file's directory
  const candidate2 = resolve(
    dirname(sourceFile),
    target.endsWith('.md') ? target : target + '.md',
  );
  if (existsSync(candidate2)) return true;

  // Try basename lookup anywhere in index
  const key = basename(target, '.md');
  if (fileIndex.has(key)) return true;

  return false;
}

// ── Validate each file ──────────────────────────────────────────────────────
const errors = [];
const warnings = [];
let filesChecked = 0;
let filesSkippedNoFrontmatter = 0;
let excludedCount = 0;

const todayIso = new Date().toISOString().slice(0, 10);

for (const file of mdFiles) {
  const rel = relative(vaultDir, file);
  if (isExcluded(rel)) {
    excludedCount++;
    continue;
  }
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (err) {
    errors.push({
      file: rel,
      path: '',
      message: `Cannot read file: ${err.message || err}`,
    });
    continue;
  }

  const fm = parseFrontmatter(raw);

  if (!fm.hasFrontmatter) {
    filesSkippedNoFrontmatter++;
    continue;
  }

  filesChecked++;

  if (fm.parseError) {
    errors.push({
      file: rel,
      path: 'frontmatter',
      message: `YAML parse error: ${fm.parseError}`,
    });
    continue;
  }

  const parsed = vaultFrontmatterSchema.safeParse(fm.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        file: rel,
        path: issue.path.join('.'),
        message: issue.message,
      });
    }
    // Even if frontmatter is invalid, still check wiki-links to surface all problems.
  }

  // Wiki-link check
  const body = raw.slice(raw.match(FRONTMATTER_RE)?.[0].length || 0);
  const links = extractWikiLinks(body);
  for (const target of links) {
    if (!resolveWikiLink(target, file)) {
      warnings.push({
        file: rel,
        type: 'dangling-wiki-link',
        message: `Wiki-link target not found in vault: [[${target}]]`,
      });
    }
  }

  // Expires check (opt-in)
  if (checkExpires && parsed.success && parsed.data.expires) {
    if (parsed.data.expires < todayIso) {
      warnings.push({
        file: rel,
        type: 'expired',
        message: `Note expired on ${parsed.data.expires} (today is ${todayIso})`,
      });
    }
  }
}

const hasErrors = errors.length > 0;
// In warn mode, errors are reported but the status is "ok" for exit-code purposes.
// The errors array is still populated so the caller can surface them as warnings.
const status = hasErrors ? (mode === 'warn' ? 'ok' : 'invalid') : 'ok';
emit({
  status,
  mode,
  vault_dir: vaultDir,
  files_checked: filesChecked,
  excluded_count: excludedCount,
  files_skipped_no_frontmatter: filesSkippedNoFrontmatter,
  errors,
  warnings,
});

process.exit(hasErrors && mode === 'hard' ? 1 : 0);
