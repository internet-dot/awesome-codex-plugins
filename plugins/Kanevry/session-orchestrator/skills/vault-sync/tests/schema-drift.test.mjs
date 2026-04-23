/**
 * schema-drift.test.mjs — Integration tests for sync-vault-schema.mjs
 *
 * Verifies that the vendored schema block in validator.mjs stays in lockstep
 * with the canonical TypeScript source. Tests run the actual script against
 * actual files — no mocks.
 *
 * Run from session-orchestrator root:
 *   pnpm exec vitest run skills/vault-sync/tests/schema-drift.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths relative to this test file
const SYNC_SCRIPT = join(__dirname, '../../../scripts/sync-vault-schema.mjs');
const VALIDATOR_MJS = join(__dirname, '../validator.mjs');
const CANONICAL = join(
  __dirname,
  '../../../../projects-baseline/packages/zod-schemas/src/vault-frontmatter.ts',
);
// Tests below shell out to sync-vault-schema.mjs, which by default reads
// the canonical schema from a sibling projects-baseline checkout. In CI
// (and on any contributor machine without that checkout) the canonical
// file is absent, so we skip these integration tests. The schema-drift
// CI stage runs the script directly against a freshly cloned canonical.
const HAS_CANONICAL = existsSync(CANONICAL);

const SENTINEL_BEGIN = 'BEGIN GENERATED SCHEMA';
const SENTINEL_END = 'END GENERATED SCHEMA';

/**
 * Run sync-vault-schema.mjs with given args.
 * Returns { status, stdout, stderr }.
 * Never throws — captures non-zero exits via try/catch.
 */
function runScript(args = []) {
  try {
    const stdout = execFileSync(process.execPath, [SYNC_SCRIPT, ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      status: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  }
}

describe.skipIf(!HAS_CANONICAL)('sync-vault-schema.mjs', () => {
  it('idempotency — running --write twice produces no diff between runs', () => {
    // Read validator.mjs before any writes
    const before = readFileSync(VALIDATOR_MJS, 'utf-8');

    // First --write
    const first = runScript(['--write']);
    expect(first.status, `first --write failed: ${first.stderr}`).toBe(0);

    // Read after first write
    const afterFirst = readFileSync(VALIDATOR_MJS, 'utf-8');
    expect(afterFirst).toBe(before);

    // Second --write
    const second = runScript(['--write']);
    expect(second.status, `second --write failed: ${second.stderr}`).toBe(0);

    // Read after second write
    const afterSecond = readFileSync(VALIDATOR_MJS, 'utf-8');
    expect(afterSecond).toBe(before);
  });

  it('check-mode-clean — --check exits 0 when canonical and vendored are in sync', () => {
    const result = runScript(['--check']);
    expect(result.status, `--check failed unexpectedly: ${result.stderr}`).toBe(0);
    expect(result.stdout).toContain('no drift');
  });

  it('check-mode-detects-drift — --check exits 1 with diff when canonical differs', () => {
    // Build a temporary fake canonical with a different max for the id field
    const rand = Math.random().toString(36).slice(2);
    const tmpDir = join(tmpdir(), `sync-vault-schema-test-${rand}`);
    mkdirSync(tmpDir, { recursive: true });
    const fakeCanonical = join(tmpDir, 'vault-frontmatter.ts');

    // Read the real canonical and alter it: change .max(128) to .max(256) for id
    const realCanonical = readFileSync(CANONICAL, 'utf-8');
    const altered = realCanonical.replace('.max(128)', '.max(256)');
    writeFileSync(fakeCanonical, altered, 'utf-8');

    try {
      const result = runScript(['--check', '--canonical', fakeCanonical]);
      expect(result.status, 'expected exit 1 for drift').toBe(1);
      // Diff should mention the changed value
      expect(result.stderr).toMatch(/256|drift/);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('failure-mode-missing-canonical — exits 2 with clear message when canonical not found', () => {
    const rand = Math.random().toString(36).slice(2);
    const fakePath = join(tmpdir(), `does-not-exist-${rand}.ts`);

    const result = runScript(['--check', '--canonical', fakePath]);
    expect(result.status, 'expected exit 2 for missing file').toBe(2);
    expect(result.stderr).toContain(fakePath);
  });

  it('sentinel-presence — validator.mjs contains both sentinel markers exactly once in correct order', () => {
    const content = readFileSync(VALIDATOR_MJS, 'utf-8');

    // Count occurrences
    const beginCount = (content.match(/BEGIN GENERATED SCHEMA/g) ?? []).length;
    const endCount = (content.match(/END GENERATED SCHEMA/g) ?? []).length;

    expect(beginCount, 'BEGIN GENERATED SCHEMA must appear exactly once').toBe(1);
    expect(endCount, 'END GENERATED SCHEMA must appear exactly once').toBe(1);

    // BEGIN must appear before END
    const beginPos = content.indexOf(SENTINEL_BEGIN);
    const endPos = content.indexOf(SENTINEL_END);
    expect(beginPos, 'BEGIN sentinel must appear before END sentinel').toBeLessThan(endPos);
  });
});
