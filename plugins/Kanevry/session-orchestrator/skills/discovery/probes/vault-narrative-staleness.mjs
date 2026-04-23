/**
 * skills/discovery/probes/vault-narrative-staleness.mjs
 *
 * Probe: detects stale vault narratives — context.md / decisions.md / people.md
 * files whose `updated` frontmatter field is older than the tier threshold.
 *
 * Tier thresholds (days):
 *   top      = 30
 *   active   = 60  (default when tier is missing or unrecognised)
 *   archived = 180
 *
 * Tier is read from the project's `_overview.md` frontmatter `tier:` field.
 * If `_overview.md` is absent, unreadable, or has no `tier` field, the probe
 * falls back to `active` (60 days).
 *
 * Severity escalation relative to threshold T:
 *   age_days > T * 3  → high
 *   age_days > T * 2  → medium
 *   age_days > T      → low
 *
 * Missing `updated` field → low / confidence 0.7.
 * Parse errors           → low / confidence 0.6 (errors counter incremented).
 */

import { existsSync, readFileSync, readdirSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NARRATIVE_FILES = ['context.md', 'decisions.md', 'people.md'];

const TIER_THRESHOLDS = {
  top: 30,
  active: 60,
  archived: 180,
};

const VALID_TIERS = new Set(Object.keys(TIER_THRESHOLDS));
const DEFAULT_TIER = 'active';

// ---------------------------------------------------------------------------
// Minimal YAML frontmatter parser — top-level scalar key: value only.
// Handles: plain strings, numbers, quoted strings (single + double).
// Does not handle nested mappings, sequences, or block scalars.
// Returns null if no frontmatter block found.
// ---------------------------------------------------------------------------

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return null;
  const block = m[1];
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    // Strip surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
      (val.startsWith("'") && val.endsWith("'") && val.length >= 2)
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveVaultDir(projectRoot, config) {
  if (config?.['vault-integration']?.['vault-dir']) return config['vault-integration']['vault-dir'];
  if (process.env.VAULT_DIR) return process.env.VAULT_DIR;
  return null;
}

function readTier(projectDir, _slug) {
  const overviewPath = join(projectDir, '_overview.md');
  if (!existsSync(overviewPath)) return DEFAULT_TIER;
  let raw;
  try {
    raw = readFileSync(overviewPath, 'utf8');
  } catch {
    return DEFAULT_TIER;
  }
  let fm;
  try {
    fm = parseFrontmatter(raw);
  } catch {
    return DEFAULT_TIER;
  }
  if (!fm) return DEFAULT_TIER;
  const tier = fm.tier ? fm.tier.toLowerCase() : null;
  return tier && VALID_TIERS.has(tier) ? tier : DEFAULT_TIER;
}

function computeSeverity(ageDays, threshold) {
  if (ageDays > threshold * 3) return 'high';
  if (ageDays > threshold * 2) return 'medium';
  return 'low';
}

function makeMetricsPath(projectRoot) {
  return join(projectRoot, '.orchestrator', 'metrics');
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * @param {string} projectRoot  Absolute path to the consumer project root.
 * @param {object} config       Parsed Session Config (may be empty / partial).
 * @returns {Promise<object>}   { findings, metrics, duration_ms [, skipped_reason] }
 */
export async function runProbe(projectRoot, config) {
  const startMs = Date.now();

  try {
    // ── Early exit: vault-dir not configured ──────────────────────────────────
    const vaultDir = resolveVaultDir(projectRoot, config);
    if (!vaultDir) {
      return {
        findings: [],
        metrics: { scanned_projects: 0, scanned_narratives: 0, stale_narratives: 0, errors: 0 },
        duration_ms: Date.now() - startMs,
        skipped_reason: 'vault-dir not configured',
      };
    }

    // ── Early exit: vault-dir does not exist ──────────────────────────────────
    if (!existsSync(vaultDir)) {
      return {
        findings: [],
        metrics: { scanned_projects: 0, scanned_narratives: 0, stale_narratives: 0, errors: 0 },
        duration_ms: Date.now() - startMs,
        skipped_reason: 'vault-dir not found on disk',
      };
    }

    const projectsDir = join(vaultDir, '01-projects');

    // ── Early exit: 01-projects subdir absent ─────────────────────────────────
    if (!existsSync(projectsDir)) {
      return {
        findings: [],
        metrics: { scanned_projects: 0, scanned_narratives: 0, stale_narratives: 0, errors: 0 },
        duration_ms: Date.now() - startMs,
        skipped_reason: '01-projects not found in vault',
      };
    }

    // ── Scan ──────────────────────────────────────────────────────────────────
    const now = Date.now();
    const findings = [];
    let scannedProjects = 0;
    let scannedNarratives = 0;
    let staleNarratives = 0;
    let errors = 0;

    let projectEntries;
    try {
      projectEntries = readdirSync(projectsDir, { withFileTypes: true });
    } catch (err) {
      return {
        findings: [],
        metrics: { scanned_projects: 0, scanned_narratives: 0, stale_narratives: 0, errors: 1 },
        duration_ms: Date.now() - startMs,
        skipped_reason: `cannot read 01-projects: ${err.message || err}`,
      };
    }

    for (const entry of projectEntries) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const projectDir = join(projectsDir, slug);

      scannedProjects++;

      const tier = readTier(projectDir, slug);
      const threshold = TIER_THRESHOLDS[tier];

      for (const narrativeFile of NARRATIVE_FILES) {
        const filePath = join(projectDir, narrativeFile);
        if (!existsSync(filePath)) continue;

        scannedNarratives++;

        // Read file
        let raw;
        try {
          raw = readFileSync(filePath, 'utf8');
        } catch (err) {
          findings.push({
            severity: 'low',
            confidence: 0.6,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: cannot read file`,
            evidence: { slug, tier, file: narrativeFile, error: err.message || String(err) },
          });
          errors++;
          continue;
        }

        // Parse frontmatter
        let fm;
        try {
          fm = parseFrontmatter(raw);
        } catch (err) {
          findings.push({
            severity: 'low',
            confidence: 0.6,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: frontmatter parse error`,
            evidence: { slug, tier, file: narrativeFile, error: err.message || String(err) },
          });
          errors++;
          continue;
        }

        if (!fm) {
          // No frontmatter block at all — treat same as missing updated
          findings.push({
            severity: 'low',
            confidence: 0.7,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: updated field missing`,
            evidence: {
              slug,
              tier,
              file: narrativeFile,
              updated: null,
              age_days: null,
              threshold_days: threshold,
            },
          });
          continue;
        }

        const updatedRaw = fm.updated;
        if (!updatedRaw) {
          findings.push({
            severity: 'low',
            confidence: 0.7,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: updated field missing`,
            evidence: {
              slug,
              tier,
              file: narrativeFile,
              updated: null,
              age_days: null,
              threshold_days: threshold,
            },
          });
          continue;
        }

        // Parse date
        const updatedMs = Date.parse(updatedRaw);
        if (Number.isNaN(updatedMs)) {
          findings.push({
            severity: 'low',
            confidence: 0.6,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: updated field not a valid date`,
            evidence: {
              slug,
              tier,
              file: narrativeFile,
              updated: updatedRaw,
              age_days: null,
              threshold_days: threshold,
            },
          });
          errors++;
          continue;
        }

        const ageDays = (now - updatedMs) / 86400000;

        if (ageDays > threshold) {
          staleNarratives++;
          const ageDaysRounded = Math.round(ageDays);
          const severity = computeSeverity(ageDays, threshold);
          findings.push({
            severity,
            confidence: 0.9,
            title: `[vault-narrative-staleness] ${slug}/${narrativeFile}: ${ageDaysRounded}d since update (${tier} threshold: ${threshold}d)`,
            evidence: {
              slug,
              tier,
              file: narrativeFile,
              updated: updatedRaw,
              age_days: ageDaysRounded,
              threshold_days: threshold,
            },
          });
        }
      }
    }

    const durationMs = Date.now() - startMs;
    const metrics = {
      scanned_projects: scannedProjects,
      scanned_narratives: scannedNarratives,
      stale_narratives: staleNarratives,
      errors,
    };

    // ── JSONL append ──────────────────────────────────────────────────────────
    try {
      const metricsDir = makeMetricsPath(projectRoot);
      if (!existsSync(metricsDir)) mkdirSync(metricsDir, { recursive: true });
      const record = {
        timestamp: new Date().toISOString(),
        probe: 'vault-narrative-staleness',
        project_root: projectRoot,
        vault_dir: vaultDir,
        scanned_projects: scannedProjects,
        scanned_narratives: scannedNarratives,
        stale_narratives: staleNarratives,
        errors,
        duration_ms: durationMs,
        findings: findings.map((f) => ({
          slug: f.evidence.slug,
          file: f.evidence.file,
          tier: f.evidence.tier,
          severity: f.severity,
          age_days: f.evidence.age_days,
          threshold_days: f.evidence.threshold_days,
        })),
      };
      appendFileSync(
        join(metricsDir, 'vault-narrative-staleness.jsonl'),
        JSON.stringify(record) + '\n',
        'utf8',
      );
    } catch {
      // JSONL write failure is non-fatal — probe result is still returned
    }

    return { findings, metrics, duration_ms: durationMs };
  } catch (err) {
    // Top-level safety net — probe must never throw
    return {
      findings: [],
      metrics: { scanned_projects: 0, scanned_narratives: 0, stale_narratives: 0, errors: 1 },
      duration_ms: Date.now() - startMs,
      skipped_reason: `probe error: ${err.message || err}`,
    };
  }
}

export default runProbe;
