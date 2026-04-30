'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

// Env var precedence: KNOX_* (preferred) > CLAUDE_* (back-compat for users who
// installed Knox before the v2 rename). Both supported indefinitely.
// Use __dirname not process.argv[1] — the latter points to the npm bin symlink
// for global installs, not to the package root.
const PLUGIN_ROOT = process.env.KNOX_ROOT ||
  process.env.CLAUDE_PLUGIN_ROOT ||
  path.resolve(__dirname, '..');

// Data dir resolution. KNOX_DATA_DIR is the explicit knox-specific env var.
// CLAUDE_PLUGIN_DATA is only honored when it actually points at a knox dir,
// because Claude Code reuses that env var for whichever plugin is currently
// active — running the CLI from a session where a SIBLING plugin is active
// would otherwise leak audit data to the wrong directory.
//
// Back-compat: if the legacy ~/.claude/plugins/data/knox path already exists,
// keep using it so existing users don't lose audit history.
function _resolveDataDir() {
  if (process.env.KNOX_DATA_DIR) return process.env.KNOX_DATA_DIR;
  if (process.env.CLAUDE_PLUGIN_DATA && /(?:^|[\\/])knox(?:[\\/_-]|$)/i.test(process.env.CLAUDE_PLUGIN_DATA)) {
    return process.env.CLAUDE_PLUGIN_DATA;
  }
  const legacy = path.join(os.homedir(), '.claude', 'plugins', 'data', 'knox');
  const modern = path.join(os.homedir(), '.local', 'share', 'knox');
  try {
    if (fs.existsSync(legacy)) return legacy;
  } catch { /* ignore */ }
  return modern;
}
const PLUGIN_DATA = _resolveDataDir();

function loadJSON(filePath) {
  try {
    const resolved = filePath.startsWith('~/')
      ? path.join(os.homedir(), filePath.slice(2))
      : filePath;
    if (!fs.existsSync(resolved)) return {};
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch { return {}; }
}

function mergeConfigs(...configs) {
  const result = {
    preset: 'standard',
    audit: {
      enabled: true,
      path: path.join(PLUGIN_DATA, 'audit'),
      max_size_mb: 50,
      include_allowed: false,
      command_preview_chars: 120
    },
    alerts: { enabled: false, webhook: '', min_severity: 'high', cooldown_seconds: 60 },
    escalation: { session_threshold: 3, agent_window_hours: 1, agent_threshold: 10 },
    custom_allowlist: [],
    custom_blocklist: [],
    apt_package_extra: [],
    disabled_checks: [],
    sanitize_sudo: true,
    script_inspection: true,
    use_ask_not_deny: false
  };
  for (const cfg of configs) {
    if (!cfg || typeof cfg !== 'object') continue;
    if (cfg.preset) result.preset = cfg.preset;
    if (cfg.audit) Object.assign(result.audit, cfg.audit);
    if (cfg.alerts) Object.assign(result.alerts, cfg.alerts);
    if (cfg.escalation) Object.assign(result.escalation, cfg.escalation);
    if (Array.isArray(cfg.custom_allowlist)) result.custom_allowlist.push(...cfg.custom_allowlist);
    if (Array.isArray(cfg.custom_blocklist)) result.custom_blocklist.push(...cfg.custom_blocklist);
    if (Array.isArray(cfg.apt_package_extra)) result.apt_package_extra.push(...cfg.apt_package_extra);
    if (Array.isArray(cfg.disabled_checks)) {
      // Union merge: add new entries only
      for (const c of cfg.disabled_checks) {
        if (!result.disabled_checks.includes(c)) result.disabled_checks.push(c);
      }
    }
    if (cfg.sanitize_sudo !== undefined) result.sanitize_sudo = cfg.sanitize_sudo;
    if (cfg.script_inspection !== undefined) result.script_inspection = cfg.script_inspection;
    if (cfg.use_ask_not_deny !== undefined) result.use_ask_not_deny = cfg.use_ask_not_deny;
  }
  return result;
}

function loadPreset(presetName) {
  try {
    const presetFile = path.join(PLUGIN_ROOT, 'policies', 'presets', `${presetName}.json`);
    return JSON.parse(fs.readFileSync(presetFile, 'utf8'));
  } catch { return {}; }
}

function loadConfig() {
  const userCfg = loadJSON(path.join(os.homedir(), '.config', 'knox', 'config.json'));
  const projectCfg = loadJSON('.knox.json');
  const localCfg = loadJSON('.knox.local.json');

  // Env vars override (highest precedence). KNOX_* preferred; CLAUDE_PLUGIN_OPTION_*
  // kept for back-compat (Claude Code's plugin manager sets these from userConfig).
  const envCfg = {};
  if (process.env.CLAUDE_PLUGIN_OPTION_PRESET) envCfg.preset = process.env.CLAUDE_PLUGIN_OPTION_PRESET;
  if (process.env.KNOX_PRESET) envCfg.preset = process.env.KNOX_PRESET;
  const webhook = process.env.KNOX_WEBHOOK || process.env.CLAUDE_PLUGIN_OPTION_WEBHOOK;
  if (webhook) envCfg.alerts = { enabled: true, webhook };
  const auditPath = process.env.KNOX_AUDIT_PATH || process.env.CLAUDE_PLUGIN_OPTION_AUDIT_PATH;
  if (auditPath) envCfg.audit = { path: auditPath };

  const result = mergeConfigs(userCfg, projectCfg, localCfg, envCfg);

  // Apply preset-level overrides after merge
  const preset = loadPreset(result.preset);
  if (preset.sanitize_sudo !== undefined) result.sanitize_sudo = preset.sanitize_sudo;
  if (preset.script_inspection !== undefined) result.script_inspection = preset.script_inspection;
  if (preset.use_ask_not_deny !== undefined) result.use_ask_not_deny = preset.use_ask_not_deny;
  if (preset.audit) Object.assign(result.audit, preset.audit);
  if (preset.escalation) Object.assign(result.escalation, preset.escalation);

  // env/local overrides take final priority on scalars
  if (envCfg.preset) result.preset = envCfg.preset;

  return result;
}

module.exports = { loadConfig, PLUGIN_ROOT, PLUGIN_DATA };
