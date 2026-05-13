#!/usr/bin/env tsx
/**
 * Apply a Tandem workflow plan, write the returned bundle to disk, and
 * run importPreview for a compatibility check.
 *
 * Calls `client.workflowPlans.apply({ planId, creatorId })`. If the
 * response contains `plan_package_bundle`, the bundle is written to
 * disk so the user does not have to copy JSON out of terminal output,
 * and `client.workflowPlans.importPreview({ bundle })` is called so
 * the user sees the engine's compatibility report.
 *
 * Stops there. Final import (`workflowPlans.importPlan`) is gated
 * behind explicit user approval and lives in `tandem-import-plan.ts`
 * (or `/import-preview-workflow` in Codex).
 *
 * Usage:
 *   npm run apply -- <plan_id>
 *   npm run apply -- <plan_id> <creator_id>
 *   npm run apply -- <plan_id> <creator_id> --out ./path/to/bundle.json
 *
 * Defaults:
 *   creator_id → "codex-plugin"
 *   --out      → ".tandem-codex/plan-bundles/<plan_id>.json"
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { JsonObject } from "@frumu/tandem-client";
import { createClient } from "./lib/tandem-config.ts";

interface ParsedArgs {
  planId: string;
  creatorId: string;
  outPath?: string;
}

function parseArgs(argv: string[]): ParsedArgs | null {
  let outPath: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") {
      const next = argv[i + 1];
      if (!next) return null;
      outPath = next;
      i++;
    } else if (a.startsWith("--out=")) {
      outPath = a.slice("--out=".length);
    } else {
      positional.push(a);
    }
  }
  const planId = positional[0]?.trim();
  if (!planId) return null;
  const creatorId = positional[1]?.trim() || "codex-plugin";
  return { planId, creatorId, outPath };
}

function writeBundle(bundle: unknown, path: string): string {
  const abs = resolve(path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(bundle, null, 2) + "\n");
  return abs;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed) {
    console.error("Usage:");
    console.error("  npm run apply -- <plan_id>");
    console.error("  npm run apply -- <plan_id> <creator_id>");
    console.error("  npm run apply -- <plan_id> <creator_id> --out ./path/to/bundle.json");
    process.exit(64);
  }
  const { planId, creatorId, outPath } = parsed;

  const { client } = createClient();

  try {
    const applied = await client.workflowPlans.apply({ planId, creatorId });
    console.log(JSON.stringify({ phase: "apply", applied }, null, 2));

    const bundle = (applied as { plan_package_bundle?: JsonObject })
      .plan_package_bundle;
    if (!bundle) {
      console.error(
        "[tandem-codex-plugin] apply succeeded but no plan_package_bundle was returned.",
      );
      console.error("Skipping bundle write and importPreview.");
      process.exit(0);
    }

    const bundlePath = writeBundle(
      bundle,
      outPath ?? `.tandem-codex/plan-bundles/${planId}.json`,
    );
    console.error(`[tandem-codex-plugin] Wrote bundle to ${bundlePath}`);

    const importPreview = await client.workflowPlans.importPreview({ bundle });
    console.log(JSON.stringify({ phase: "importPreview", importPreview }, null, 2));

    const validation = (importPreview as { import_validation?: { compatible?: boolean } })
      .import_validation;
    if (validation?.compatible) {
      console.error(
        `\nimportPreview reports compatible. Final import is gated behind\n` +
          `explicit user approval. To finalize, run:\n` +
          `  npm run import-plan -- ${bundlePath}\n` +
          `or use /import-preview-workflow ${bundlePath} in Codex.`,
      );
    } else {
      console.error(
        "\nimportPreview reports incompatible. Do NOT import.\n" +
          `Run /revise-workflow ${planId} "<fix>" or npm run revise -- ${planId} "<fix>" to address the conflicts.`,
      );
    }
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] apply failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
