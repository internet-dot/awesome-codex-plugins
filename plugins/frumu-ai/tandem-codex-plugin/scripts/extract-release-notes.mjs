#!/usr/bin/env node
/**
 * Extract release notes for a given tag/version.
 *
 * Sources, in priority order:
 * - docs/WHATS_NEW_vX.Y.Z.md
 * - RELEASE_NOTES.md
 * - CHANGELOG.md
 *
 * Usage:
 *   node scripts/extract-release-notes.mjs v0.1.0
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/extract-release-notes.mjs <tag-or-version>");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const raw = input.replace(/^refs\/tags\//, "");
const versionNumber = raw.replace(/^v/, "");
const baseVersion = versionNumber.replace(/[-+].*$/, "");
const currentTag = raw.startsWith("v") ? raw : `v${versionNumber}`;
const repo = process.env.GITHUB_REPOSITORY || process.env.REPO || "frumu-ai/tandem-codex-plugin";

const whatsNewPath = path.join(repoRoot, "docs", `WHATS_NEW_v${baseVersion}.md`);
const releaseNotesPath = path.join(repoRoot, "RELEASE_NOTES.md");
const changelogPath = path.join(repoRoot, "CHANGELOG.md");

const intro = "Install or update the plugin from the tagged Git ref:";
const installBlock = [
  "```bash",
  `codex plugin marketplace add ${repo}@${currentTag}`,
  "```",
].join("\n");

const fromWhatsNew = safeRead(whatsNewPath);
const fromReleaseNotes = safeRead(releaseNotesPath);
const fromChangelog = safeRead(changelogPath);
const versionCandidates = Array.from(new Set([versionNumber, baseVersion]));

const extracted =
  (fromWhatsNew ? extractWholeMarkdown(fromWhatsNew) : null) ||
  (fromReleaseNotes ? extractFromReleaseNotesMd(fromReleaseNotes, versionCandidates) : null) ||
  (fromChangelog ? extractFromChangelog(fromChangelog, versionCandidates) : null) ||
  null;

const previousTag = getPreviousTag(currentTag);
const fullChangelogLine = previousTag
  ? `**Full Changelog**: https://github.com/${repo}/compare/${previousTag}...${currentTag}`
  : null;

const bodyParts = [
  intro,
  installBlock,
  extracted?.trim()
    ? stripLeadingTopHeader(extracted.trim())
    : "## What's Changed\n\n- Plugin updates and documentation improvements.",
  fullChangelogLine,
].filter(Boolean);

process.stdout.write(`${bodyParts.join("\n\n")}\n`);

function safeRead(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function stripLeadingTopHeader(markdown) {
  const lines = markdown.split(/\r?\n/);
  if (!lines.length || !/^#\s+/.test(lines[0])) return markdown;
  let start = 1;
  if (lines[start] === "") start += 1;
  return lines.slice(start).join("\n").trim();
}

function extractWholeMarkdown(markdown) {
  return markdown.trim();
}

function extractFromReleaseNotesMd(markdown, versions) {
  for (const version of versions) {
    const section = extractVersionSectionFromReleaseNotes(markdown, version);
    if (section) return section;
  }
  return null;
}

function extractVersionSectionFromReleaseNotes(markdown, version) {
  const startRe = new RegExp(
    `^(?:##\\s+v${escapeRegExp(version)}\\b.*|#\\s+Tandem Codex Plugin\\s+v${escapeRegExp(version)}\\b.*)$`,
    "im",
  );
  const startMatch = markdown.match(startRe);
  if (!startMatch || startMatch.index == null) return null;

  const afterStart = markdown.slice(startMatch.index);
  const nextRe =
    /^(?:##\s+v\d+\.\d+\.\d+\b.*|#\s+Tandem Codex Plugin\s+v\d+\.\d+\.\d+\b.*)$/gim;
  nextRe.lastIndex = startMatch[0].length;
  const nextMatch = nextRe.exec(afterStart);
  const endIdx = nextMatch?.index != null ? nextMatch.index : afterStart.length;

  return afterStart.slice(0, endIdx).trim();
}

function extractFromChangelog(markdown, versions) {
  for (const version of versions) {
    const versionRe = new RegExp(
      `^##\\s+\\[${escapeRegExp(version)}\\]([\\s\\S]*?)(?=^##\\s+\\[|\\Z)`,
      "im",
    );
    const match = markdown.match(versionRe);
    if (match) return `## What's Changed\n\n${match[1].trim()}`;
  }

  const unreleasedRe = /^##\s+\[Unreleased\]([\s\S]*?)(?=^##\s+\[|\Z)/im;
  const unreleasedMatch = markdown.match(unreleasedRe);
  if (unreleasedMatch) return `## What's Changed\n\n${unreleasedMatch[1].trim()}`;

  return null;
}

function getPreviousTag(current) {
  try {
    const tags = execSync('git tag --list "v*" --sort=-version:refname', {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const idx = tags.indexOf(current);
    if (idx === -1) return null;
    return idx < tags.length - 1 ? tags[idx + 1] : null;
  } catch {
    return null;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
