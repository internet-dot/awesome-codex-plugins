#!/usr/bin/env tsx
/**
 * Send a revision message to a Tandem workflow-plan chat session.
 *
 * Calls `client.workflowPlans.chatMessage({ planId, message })` and
 * prints the engine's updated draft.
 *
 * Usage:
 *   npm run revise -- <plan_id> "<revision message>"
 *
 * Iterate by re-running with a new message until the draft is
 * satisfactory, then run `npm run apply -- <plan_id>` (or
 * `/apply-workflow <plan_id>`) to apply.
 */

import "dotenv/config";
import { createClient } from "./lib/tandem-config.ts";

async function main() {
  const args = process.argv.slice(2);
  const planId = args[0]?.trim();
  const message = args.slice(1).join(" ").trim();

  if (!planId || !message) {
    console.error('Usage: npm run revise -- <plan_id> "<revision message>"');
    process.exit(64);
  }

  const { client } = createClient();

  try {
    const updated = await client.workflowPlans.chatMessage({ planId, message });
    console.log(JSON.stringify({ phase: "chatMessage", updated }, null, 2));
    console.error(
      `\nNext: \`npm run apply -- ${planId}\` or /apply-workflow ${planId} when ready.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] chatMessage failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
