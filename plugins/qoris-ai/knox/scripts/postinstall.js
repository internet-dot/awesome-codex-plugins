#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

// Absolute path at install time (KNOX_ROOT/CLAUDE_PLUGIN_ROOT may not be set in npm context)
const PLUGIN_ROOT = process.env.KNOX_ROOT || process.env.CLAUDE_PLUGIN_ROOT || path.dirname(__dirname);
const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');

// Complete hook registration for all 11 event types.
// Sync (timeout) for blocking hooks, async:true for audit-only / info hooks.
function buildHookEntries(root) {
  return {
    // ── PreToolUse (7 matcher groups, all SYNC — must block before execution) ──
    PreToolUse: [
      {
        matcher: 'Bash|Monitor|PowerShell|Read',
        hooks: [{ type: 'command', command: `${root}/bin/run-check.sh`, timeout: 10 }]
      },
      {
        matcher: 'Write|Edit|MultiEdit|NotebookEdit',
        hooks: [{ type: 'command', command: `${root}/bin/run-check.sh`, timeout: 5 }]
      },
      {
        matcher: 'CronCreate',
        hooks: [{ type: 'command', command: `${root}/bin/knox-cron-guard`, timeout: 5 }]
      },
      {
        matcher: '^mcp__',
        hooks: [{ type: 'command', command: `${root}/bin/run-check.sh`, timeout: 5 }]
      }
    ],

    // ── UserPromptSubmit (SYNC — exit 2 erases poisoned prompt) ──
    UserPromptSubmit: [
      {
        matcher: '',
        hooks: [{ type: 'command', command: `${root}/bin/knox-guard`, timeout: 3 }]
      }
    ],

    // ── ConfigChange (SYNC — blocks self-removal attempts) ──
    ConfigChange: [
      {
        matcher: 'user_settings|project_settings|local_settings',
        hooks: [{ type: 'command', command: `${root}/bin/knox-guard`, timeout: 3 }]
      }
    ],

    // ── InstructionsLoaded (SYNC — audit-only, cannot block, but timeout prevents hang) ──
    InstructionsLoaded: [
      {
        matcher: 'session_start|include|path_glob_match|nested_traversal|compact',
        hooks: [{ type: 'command', command: `${root}/bin/knox-guard`, timeout: 3 }]
      }
    ],

    // ── PostToolUse (ASYNC — audit + additionalContext injection after every tool call) ──
    PostToolUse: [
      {
        matcher: '*',
        hooks: [{ type: 'command', command: `${root}/bin/knox-post-audit`, async: true }]
      }
    ],

    // ── PermissionDenied (SYNC — ensures audit write completes before session moves on) ──
    PermissionDenied: [
      {
        matcher: '*',
        hooks: [{ type: 'command', command: `${root}/bin/knox-post-audit`, timeout: 5 }]
      }
    ],

    // ── SubagentStart (ASYNC — injects Knox context into spawned subagents) ──
    SubagentStart: [
      {
        matcher: '*',
        hooks: [{ type: 'command', command: `${root}/bin/knox-session`, async: true }]
      }
    ],

    // ── FileChanged (ASYNC — live config reload when .knox.json changes) ──
    FileChanged: [
      {
        matcher: '.knox.json|.knox.local.json',
        hooks: [{ type: 'command', command: `${root}/bin/knox-session`, async: true }]
      }
    ],

    // ── TaskCreated (SYNC — blocks injection in scheduled task prompts) ──
    TaskCreated: [
      {
        matcher: '',
        hooks: [{ type: 'command', command: `${root}/bin/knox-cron-guard`, timeout: 5 }]
      }
    ],

    // ── SessionEnd (ASYNC — flush audit, write session summary) ──
    SessionEnd: [
      {
        matcher: 'clear|prompt_input_exit|logout|resume|bypass_permissions_disabled|other',
        hooks: [{ type: 'command', command: `${root}/bin/knox-session`, async: true }]
      }
    ],

    // ── SessionStart (ASYNC — init state, prune stale escalation records) ──
    SessionStart: [
      {
        matcher: 'startup|resume|clear|compact',
        hooks: [{ type: 'command', command: `${root}/bin/knox-session`, async: true }]
      }
    ]
  };
}

// Returns true if this entry group is already registered for Knox
function isKnoxEntry(entry) {
  return (entry.hooks || []).some(h => h.command && h.command.includes('knox'));
}

function main() {
  console.log('Knox: wiring all 11 hooks into ~/.claude/settings.json...');

  let settings = {};
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch {
    console.warn('Knox: could not read existing settings.json, starting fresh');
  }
  if (!settings.hooks) settings.hooks = {};

  const entries = buildHookEntries(PLUGIN_ROOT);
  let wired = 0;
  let skipped = 0;

  for (const [event, newEntries] of Object.entries(entries)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    for (const entry of newEntries) {
      // Skip if an identical Knox entry already exists for this matcher
      const alreadyPresent = settings.hooks[event].some(
        e => isKnoxEntry(e) && e.matcher === entry.matcher
      );
      if (!alreadyPresent) {
        settings.hooks[event].push(entry);
        wired++;
      } else {
        skipped++;
      }
    }
  }

  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  const tmp = SETTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(settings, null, 2));
  fs.renameSync(tmp, SETTINGS_FILE);

  const eventCount = Object.keys(entries).length;
  console.log(`Knox: ${wired} hook entries wired across ${eventCount} events${skipped ? ` (${skipped} already present, skipped)` : ''}.`);
  console.log('Knox: run `knox verify` to confirm enforcement is active.');
}

try { main(); } catch (e) { console.error('Knox postinstall warning:', e.message); }
