#!/usr/bin/env tsx
/**
 * One-shot Tandem workflow preview.
 *
 * The `@frumu/tandem-client` SDK exposes `workflowPlans.preview` as a
 * prompt-based one-shot, NOT a "preview-by-plan-id" overload. The
 * canonical README example is:
 *
 *   client.workflowPlans.preview({
 *     prompt: "Create a release checklist automation",
 *     planSource: "planner_page",
 *   })
 *
 * For drafts that came from `chatStart` (a `plan_id`), the documented
 * flow is `apply → importPreview` on the returned bundle. Use
 * `npm run apply -- <plan_id>` (or `/apply-workflow <plan_id>`) for that.
 *
 * Usage:
 *   npm run preview -- "<one-line workflow goal>"     # one-shot prompt preview
 *   npm run preview -- ./path/to/bundle.json          # imported-bundle preview
 *
 * Honours TANDEM_WORKSPACE_ROOT for the prompt path. Bundle path calls
 * `workflowPlans.importPreview({ bundle })`.
 */

import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, resolveWorkspaceRoot } from "./lib/tandem-config.ts";

function looksLikePath(arg: string): boolean {
  return (
    arg.endsWith(".json") ||
    arg.startsWith("./") ||
    arg.startsWith("/") ||
    arg.includes("/")
  );
}

async function main() {
  const arg = process.argv.slice(2).join(" ").trim();
  if (!arg) {
    console.error("Usage:");
    console.error('  npm run preview -- "<one-line workflow goal>"  # prompt preview');
    console.error("  npm run preview -- ./path/to/bundle.json       # bundle preview");
    process.exit(64);
  }

  const { client } = createClient();
  const workspaceRoot = resolveWorkspaceRoot();

  try {
    if (looksLikePath(arg)) {
      const path = resolve(arg);
      if (!existsSync(path)) {
        console.error(`[tandem-codex-plugin] File not found: ${path}`);
        process.exit(2);
      }
      const bundle = JSON.parse(readFileSync(path, "utf8"));
      const out = await client.workflowPlans.importPreview({ bundle });
      console.log(JSON.stringify({ phase: "importPreview", out }, null, 2));
    } else {
      const out = await client.workflowPlans.preview({
        prompt: arg,
        planSource: "intent_planner_page",
        ...(workspaceRoot ? { workspaceRoot } : {}),
      });
      console.log(JSON.stringify({ phase: "preview", out }, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Preview failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
