'use strict';

// Public Node API for @qoris/knox. Lets consumers embed Knox's policy engine
// directly without spawning the CLI:
//
//   const knox = require('@qoris/knox');
//   const config = knox.loadConfig();
//   const result = knox.checkCommand('rm -rf /', config);
//   if (result && result.blocked) { /* deny */ }
//
// Surface kept narrow on purpose. Internal modules (parsers, tokenize, unwrap,
// self-protect) are reachable but unexported — call sites should go through
// the four top-level checkers, which compose them in the right order.

const check = require('./check');
const config = require('./config');
const patterns = require('./patterns');

module.exports = {
  // Policy decisions
  checkCommand: check.checkCommand,
  checkWritePath: check.checkWritePath,
  checkReadPath: check.checkReadPath,
  checkInjection: check.checkInjection,
  isCheckDisabled: check.isCheckDisabled,
  normalizeCommand: check.normalizeCommand,

  // Configuration
  loadConfig: config.loadConfig,
  PLUGIN_ROOT: config.PLUGIN_ROOT,
  PLUGIN_DATA: config.PLUGIN_DATA,

  // Pattern access (read-only)
  loadPatterns: patterns.loadPatterns,
  getBlocklistForPreset: patterns.getBlocklistForPreset,
};
