#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2]?.trim().replace(/^v/, "");

if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error("Usage: npm run version:set -- <x.y.z>");
  process.exit(64);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const pkg = readJson("package.json");
pkg.version = version;
writeJson("package.json", pkg);

const lock = readJson("package-lock.json");
lock.version = version;
if (lock.packages?.[""]) {
  lock.packages[""].version = version;
}
writeJson("package-lock.json", lock);

const plugin = readJson(".codex-plugin/plugin.json");
plugin.version = version;
writeJson(".codex-plugin/plugin.json", plugin);

console.log(`Set release version to ${version}`);
