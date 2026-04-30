'use strict';
const fs = require('fs');
const path = require('path');
const { PLUGIN_ROOT } = require('./config');

let _cache = null;

function loadPatterns() {
  if (_cache) return _cache;
  const filePath = path.join(PLUGIN_ROOT, 'policies', 'patterns.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Pre-compile all RegExp objects
  _cache = {
    blocklist: data.blocklist.map(p => ({ ...p, re: new RegExp(p.pattern, p.flags || '') })),
    script_content_patterns: data.script_content_patterns.map(p => ({ ...p, re: new RegExp(p.pattern, p.flags || '') })),
    protected_write_paths: data.protected_write_paths,
    injection_patterns: data.injection_patterns.map(p => ({ ...p, re: new RegExp(p.pattern, p.flags || '') })),
    safe_module_allowlist: new Set(data.safe_module_allowlist),
    apt_package_allowlist: new Set(data.apt_package_allowlist),
    version: data.version
  };
  return _cache;
}

function getBlocklistForPreset(preset) {
  const levels = ['minimal', 'standard', 'strict', 'paranoid'];
  const levelIdx = levels.indexOf(preset);
  if (levelIdx < 0) return loadPatterns().blocklist;
  return loadPatterns().blocklist.filter(p => {
    const minIdx = levels.indexOf(p.preset_min || 'minimal');
    return minIdx <= levelIdx;
  });
}

// Allow tests to reset the cache (for different PLUGIN_ROOT values)
function _resetCache() { _cache = null; }

module.exports = { loadPatterns, getBlocklistForPreset, _resetCache };
