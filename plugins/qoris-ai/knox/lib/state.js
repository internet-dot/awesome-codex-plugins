'use strict';
const fs = require('fs');
const path = require('path');
const { PLUGIN_DATA } = require('./config');

const STATE_FILE = path.join(PLUGIN_DATA, 'state.json');
const CROSS_SESSION_FILE = path.join(PLUGIN_DATA, 'escalation.json');

function ensureDir() {
  fs.mkdirSync(PLUGIN_DATA, { recursive: true });
}

function readState(sessionId) {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    if (data.session_id !== sessionId) return { session_id: sessionId, denial_count: 0, flagged: false };
    return data;
  } catch { return { session_id: sessionId, denial_count: 0, flagged: false }; }
}

function writeState(state) {
  ensureDir();
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state), 'utf8');
  fs.renameSync(tmp, STATE_FILE); // atomic
}

function incrementDenial(sessionId, threshold) {
  const state = readState(sessionId);
  state.denial_count = (state.denial_count || 0) + 1;
  state.flagged = state.denial_count >= threshold;
  writeState(state);
  return state;
}

function readCrossSession() {
  try { return JSON.parse(fs.readFileSync(CROSS_SESSION_FILE, 'utf8')); }
  catch { return { denials: [] }; }
}

function recordCrossDenial(sessionId, windowHours) {
  ensureDir();
  const data = readCrossSession();
  const now = Date.now();
  const windowMs = (windowHours || 1) * 3600 * 1000;
  // Prune old entries
  data.denials = (data.denials || []).filter(d => now - d.ts < windowMs);
  data.denials.push({ ts: now, session_id: sessionId });
  const tmp = CROSS_SESSION_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
  fs.renameSync(tmp, CROSS_SESSION_FILE);
  return data.denials.length;
}

module.exports = { readState, writeState, incrementDenial, readCrossSession, recordCrossDenial };
