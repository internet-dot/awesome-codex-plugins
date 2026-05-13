#!/usr/bin/env tsx
/**
 * Preview a Tandem workflow-plan bundle import. Always runs
 * `importPreview` first; only calls `importPlan` when passed
 * `--import` and the engine reports `import_validation.compatible:
 * true`.
 *
 * This is the explicit-user-approval step. The plugin's skill should
 * not run this without a clear "yes, import" from the user.
 *
 * Usage:
 *   npm run import-plan -- ./path/to/bundle.json
 *   npm run import-plan -- ./path/to/bundle.json --import
 */

import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "./lib/tandem-config.ts";

async function main() {
  const args = process.argv.slice(2);
  const importApproved = args.includes("--import");
  const arg = args.find((value) => value !== "--import")?.trim();
  if (!arg) {
    console.error("Usage: npm run import-plan -- ./path/to/bundle.json [--import]");
    process.exit(64);
  }

  const path = resolve(arg);
  if (!existsSync(path)) {
    console.error(`[tandem-codex-plugin] File not found: ${path}`);
    process.exit(2);
  }

  const bundle = JSON.parse(readFileSync(path, "utf8"));
  const { client } = createClient();

  try {
    const previewed = await client.workflowPlans.importPreview({ bundle });
    console.log(JSON.stringify({ phase: "importPreview", previewed }, null, 2));

    const validation = (previewed as { import_validation?: { compatible?: boolean } })
      .import_validation;
    if (!validation?.compatible) {
      console.error(
        "[tandem-codex-plugin] importPreview reports incompatible — refusing to import.",
      );
      process.exit(1);
    }

    if (!importApproved) {
      console.error(
        "[tandem-codex-plugin] preview compatible. Re-run with --import only after explicit user approval.",
      );
      process.exit(0);
    }

    const finalBundle = (previewed as { bundle?: unknown }).bundle ?? bundle;
    const imported = await client.workflowPlans.importPlan({ bundle: finalBundle });
    console.log(JSON.stringify({ phase: "importPlan", imported }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] import failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
