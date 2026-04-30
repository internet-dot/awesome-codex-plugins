'use strict';
const fs = require('fs');
const path = require('path');

const DEFAULT_PREVIEW_CHARS = 120;

function writeAudit(auditDir, entry) {
  try {
    fs.mkdirSync(auditDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(auditDir, `${date}.jsonl`);

    // Truncate operation_preview to configured limit
    const previewChars = entry._preview_chars || DEFAULT_PREVIEW_CHARS;
    const cleanEntry = { ...entry };
    delete cleanEntry._preview_chars;
    if (cleanEntry.operation_preview && cleanEntry.operation_preview.length > previewChars) {
      cleanEntry.operation_preview = cleanEntry.operation_preview.slice(0, previewChars);
    }

    const line = JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      ...cleanEntry
    }) + '\n';

    fs.appendFileSync(file, line, { flag: 'a' }); // O_APPEND
  } catch (e) {
    // Audit failure must never crash the hook — log to stderr only
    process.stderr.write(`Knox audit write failed: ${e.message}\n`);
  }
}

// Alias used by some test files
const writeAuditEntry = writeAudit;

module.exports = { writeAudit, writeAuditEntry };
