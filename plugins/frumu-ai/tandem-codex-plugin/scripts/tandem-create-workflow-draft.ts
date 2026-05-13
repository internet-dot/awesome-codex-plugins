#!/usr/bin/env tsx
/**
 * Start a Tandem workflow-plan chat from a goal in plain English.
 *
 * Calls `client.workflowPlans.chatStart({ prompt, planSource, workspaceRoot? })`
 * with `planSource: "intent_planner_page"` (the planner-page surface
 * documented in @frumu/tandem-client's README) and optionally a
 * `workspaceRoot` from TANDEM_WORKSPACE_ROOT when the workflow is
 * scoped to a checkout.
 *
 * Usage:
 *   npm run create-draft -- "Daily Reddit research to Notion"
 *   TANDEM_WORKSPACE_ROOT=/work/repos/foo npm run create-draft -- "..."
 *
 * Prints the resulting plan_id and the engine's full draft response.
 * Iterate with `npm run revise -- <plan_id> "<change>"` (or
 * `/revise-workflow` in Codex).
 *
 * Raw-fetch alternative kept here for transparency:
 *
 *   const res = await fetch(`${baseUrl}/workflow-plans/chat/start`, {
 *     method: "POST",
 *     headers: {
 *       "content-type": "application/json",
 *       Authorization: `Bearer ${token}`,
 *     },
 *     body: JSON.stringify({
 *       prompt,
 *       plan_source: "intent_planner_page",
 *       workspace_root: workspaceRoot,
 *     })
 *   });
 *   const data = await res.json();
 *   console.log(data.plan?.plan_id, data.plan?.summary);
 */

import "dotenv/config";
import { createClient, resolveWorkspaceRoot } from "./lib/tandem-config.ts";

async function main() {
  const goal = process.argv.slice(2).join(" ").trim();
  if (!goal) {
    console.error('Usage: npm run create-draft -- "<one-line workflow goal>"');
    process.exit(64);
  }

  const { client } = createClient();
  const workspaceRoot = resolveWorkspaceRoot();

  try {
    const draft = await client.workflowPlans.chatStart({
      prompt: goal,
      planSource: "intent_planner_page",
      ...(workspaceRoot ? { workspaceRoot } : {}),
    });
    const planId =
      (draft as { plan?: { plan_id?: string } }).plan?.plan_id ??
      (draft as { plan_id?: string }).plan_id;
    console.log(JSON.stringify({ plan_id: planId, draft }, null, 2));
    if (!planId) {
      console.error(
        "[tandem-codex-plugin] No plan_id returned. Engine response above.",
      );
      process.exit(1);
    }
    console.error(
      `\nNext: \`npm run revise -- ${planId} "<change>"\` or /revise-workflow ${planId}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] chatStart failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
