#!/usr/bin/env node
import { readFileSync } from "node:fs";

const plugin = JSON.parse(readFileSync(".codex-plugin/plugin.json", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const tag = process.argv[2] || process.env.GITHUB_REF_NAME || "";
const expectedTag = `v${plugin.version}`;

if (!plugin.version) {
  console.error("Missing .codex-plugin/plugin.json version.");
  process.exit(1);
}

if (pkg.version !== plugin.version) {
  console.error(
    `Version mismatch: package.json=${pkg.version}, plugin.json=${plugin.version}`,
  );
  process.exit(1);
}

if (!/^v\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(tag)) {
  console.error(`Release tag must be semver-like, got: ${tag || "(empty)"}`);
  process.exit(1);
}

if (tag !== expectedTag) {
  console.error(`Release tag ${tag} does not match plugin version ${expectedTag}.`);
  process.exit(1);
}

console.log(`Release version OK: ${tag}`);
