#!/usr/bin/env node
/**
 * checker.mjs — CLAUDE.md narrative drift-check (claude-md-drift-check).
 *
 * Four checks: path-resolver, project-count-sync, issue-reference-freshness,
 * session-file-existence. Scans CLAUDE.md + _meta/**\/*.md by default.
 * Emits JSON on stdout. Exit 0 (ok/warn/skip), 1 (hard + errors), 2 (infra).
 *
 * Pure Node stdlib — no runtime dependencies.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const FORWARD_HEADING_RE =
  /(?:^|\b)(what'?s?\s+next|backlog|open\s+issues?|offene\s+(?:issues?|themen)|todo|next\s+steps?|roadmap)(?:$|\b)/i;
const BACKWARD_HEADING_RE =
  /(?:^|\b)(recently\s+closed|done|closed|archive|history|changelog|decisions?|status|references?)(?:$|\b)/i;

function parseArgs(argv) {
  const out = {
    mode: 'warn',
    includePaths: [],
    skipPathResolver: false,
    skipProjectCount: false,
    skipIssueRefs: false,
    skipSessionFiles: false,
    repo: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') out.mode = argv[++i];
    else if (a === '--include-path') out.includePaths.push(argv[++i]);
    else if (a === '--repo') out.repo = argv[++i];
    else if (a === '--skip-path-resolver') out.skipPathResolver = true;
    else if (a === '--skip-project-count') out.skipProjectCount = true;
    else if (a === '--skip-issue-refs') out.skipIssueRefs = true;
    else if (a === '--skip-session-files') out.skipSessionFiles = true;
    else if (a === '--help' || a === '-h') {
      process.stdout.write('Usage: checker.mjs [--mode hard|warn|off] [--include-path GLOB]... [--repo OWNER/NAME] [--skip-*]\n');
      process.exit(0);
    } else {
      process.stderr.write(`{"status":"infra-error","reason":"unknown arg: ${a}"}\n`);
      process.exit(2);
    }
  }
  if (out.includePaths.length === 0) {
    out.includePaths = ['CLAUDE.md', '_meta/**/*.md'];
  }
  return out;
}

function resolveScopeFiles(vaultDir, patterns) {
  const files = new Set();
  for (const pattern of patterns) {
    if (pattern.includes('**/')) {
      const [prefix, suffix] = pattern.split('/**/');
      const extMatch = /^\*\.(\w+)$/.exec(suffix || '');
      const ext = extMatch ? `.${extMatch[1]}` : null;
      const dir = join(vaultDir, prefix);
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        walkDir(dir, (f) => {
          if (!ext || f.endsWith(ext)) files.add(f);
        });
      }
    } else {
      const abs = join(vaultDir, pattern);
      if (existsSync(abs) && statSync(abs).isFile()) files.add(abs);
    }
  }
  return Array.from(files).sort();
}

function walkDir(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, visit);
    else if (entry.isFile()) visit(full);
  }
}

function classifySection(heading) {
  if (!heading) return null;
  if (BACKWARD_HEADING_RE.test(heading)) return 'backward';
  if (FORWARD_HEADING_RE.test(heading)) return 'forward';
  return null;
}

const REPO_SHAPE_RE = /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+$/;

function detectRepo(vaultDir) {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: vaultDir, encoding: 'utf8' }).trim();
  const m = /[:/]([^:/\s]+\/[^/\s]+?)(?:\.git)?$/.exec(url);
  const candidate = m ? m[1] : null;
  return candidate && REPO_SHAPE_RE.test(candidate) ? candidate : null;
}

function hasGlab() {
  try {
    execFileSync('sh', ['-c', 'command -v glab'], { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function lookupIssueState(iid, repo, cache) {
  if (cache.has(iid)) return cache.get(iid);
  let state = 'unknown';
  try {
    const out = execFileSync('glab', ['issue', 'view', iid, '--repo', repo], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const m = /^state:\s*(open|closed)/im.exec(out);
    if (m) state = m[1];
  } catch { /* glab returned non-zero — leave as unknown */ }
  cache.set(iid, state);
  return state;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const vaultDir = resolve(process.env.VAULT_DIR || process.cwd());

  if (!['hard', 'warn', 'off'].includes(args.mode)) {
    process.stderr.write(`{"status":"infra-error","reason":"invalid --mode: ${args.mode}"}\n`);
    process.exit(2);
  }

  if (args.mode === 'off') {
    process.stdout.write(JSON.stringify({ status: 'skipped-mode-off', mode: 'off', vault_dir: vaultDir }) + '\n');
    process.exit(0);
  }

  if (!existsSync(vaultDir) || !statSync(vaultDir).isDirectory()) {
    process.stderr.write(`{"status":"infra-error","reason":"VAULT_DIR does not exist: ${vaultDir}"}\n`);
    process.exit(2);
  }

  const scopeFiles = resolveScopeFiles(vaultDir, args.includePaths);
  const checksSkipped = [];

  let actualProjectCount = null;
  if (!args.skipProjectCount) {
    const projectsDir = join(vaultDir, '01-projects');
    if (existsSync(projectsDir) && statSync(projectsDir).isDirectory()) {
      actualProjectCount = readdirSync(projectsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
        .length;
    } else {
      checksSkipped.push('project-count-sync: no 01-projects/ directory at vault root');
    }
  }

  let repo = args.repo;
  const glabPresent = !args.skipIssueRefs && hasGlab();
  if (!args.skipIssueRefs && !glabPresent) {
    checksSkipped.push('issue-reference-freshness: glab not found in PATH');
  }
  if (!args.skipIssueRefs && glabPresent && !repo) {
    try { repo = detectRepo(vaultDir); } catch { /* ignore */ }
    if (!repo) checksSkipped.push('issue-reference-freshness: could not detect origin repo (use --repo)');
  }
  const runIssueCheck = !args.skipIssueRefs && glabPresent && !!repo;

  const checksRun = [];
  if (!args.skipPathResolver) checksRun.push('path-resolver');
  if (!args.skipProjectCount && actualProjectCount !== null) checksRun.push('project-count-sync');
  if (runIssueCheck) checksRun.push('issue-reference-freshness');
  if (!args.skipSessionFiles) checksRun.push('session-file-existence');

  if (scopeFiles.length === 0) {
    process.stdout.write(JSON.stringify({
      status: 'skipped', mode: args.mode, vault_dir: vaultDir,
      files_scanned: 0, checks_run: checksRun, checks_skipped: checksSkipped,
      errors: [], warnings: [], reason: 'no scope files matched',
    }) + '\n');
    process.exit(0);
  }

  const errors = [];
  const warnings = [];
  const issueCache = new Map();

  for (const abs of scopeFiles) {
    const rel = relative(vaultDir, abs);
    const content = readFileSync(abs, 'utf8');
    const lines = content.split('\n');

    let inFence = false;
    let currentSection = null;
    let currentSectionType = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (/^\s*```/.test(line)) { inFence = !inFence; continue; }

      const hmatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (hmatch && !inFence) {
        currentSection = hmatch[2];
        currentSectionType = classifySection(currentSection);
        continue;
      }

      if (!args.skipPathResolver && !inFence) {
        const pathRegex = /\/Users\/[A-Za-z0-9._/-]+/g;
        let m;
        while ((m = pathRegex.exec(line)) !== null) {
          const p = m[0].replace(/[.,;:)\]`"']+$/, '');
          if (!existsSync(p)) {
            errors.push({
              check: 'path-resolver', file: rel, line: lineNum,
              message: `Absolute path does not exist: ${p}`,
              extracted: p,
            });
          }
        }
      }

      if (!args.skipProjectCount && actualProjectCount !== null) {
        const countRegex = /\((\d+)\s+(registered|projects?|subfolders?)\)/gi;
        let m;
        while ((m = countRegex.exec(line)) !== null) {
          const claimed = parseInt(m[1], 10);
          if (claimed !== actualProjectCount) {
            errors.push({
              check: 'project-count-sync', file: rel, line: lineNum,
              message: `Hardcoded count claims ${claimed} ${m[2]} but actual 01-projects/ count is ${actualProjectCount}`,
              extracted: m[0],
            });
          }
        }
      }

      if (runIssueCheck && currentSectionType === 'forward' && !inFence) {
        const issueRegex = /#(\d+)\b/g;
        let m;
        while ((m = issueRegex.exec(line)) !== null) {
          const iid = m[1];
          const state = lookupIssueState(iid, repo, issueCache);
          if (state === 'closed') {
            errors.push({
              check: 'issue-reference-freshness', file: rel, line: lineNum,
              message: `Issue #${iid} is closed but referenced in forward-looking section "${currentSection}"`,
              extracted: `#${iid}`,
            });
          } else if (state === 'unknown') {
            warnings.push({
              check: 'issue-reference-freshness', file: rel, line: lineNum,
              message: `Could not resolve state of issue #${iid} via glab (may not exist or auth issue)`,
              extracted: `#${iid}`,
            });
          }
        }
      }

      if (!args.skipSessionFiles) {
        const sessionRegex = /50-sessions\/(\d{4}-\d{2}-\d{2}-[a-z0-9-]+)\.md/g;
        let m;
        while ((m = sessionRegex.exec(line)) !== null) {
          const sessPath = join(vaultDir, '50-sessions', `${m[1]}.md`);
          if (!existsSync(sessPath)) {
            errors.push({
              check: 'session-file-existence', file: rel, line: lineNum,
              message: `Referenced session file does not exist: 50-sessions/${m[1]}.md`,
              extracted: m[0],
            });
          }
        }
      }
    }
  }

  const status = errors.length === 0 ? 'ok' : 'invalid';
  process.stdout.write(JSON.stringify({
    status, mode: args.mode, vault_dir: vaultDir,
    files_scanned: scopeFiles.length,
    checks_run: checksRun,
    checks_skipped: checksSkipped,
    errors, warnings,
  }) + '\n');

  process.exit(errors.length > 0 && args.mode === 'hard' ? 1 : 0);
}

main();
