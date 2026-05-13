#!/usr/bin/env tsx
/**
 * Healthcheck for the local Tandem engine.
 *
 * Reads TANDEM_BASE_URL and the engine token (TANDEM_API_TOKEN or
 * TANDEM_API_TOKEN_FILE) via scripts/lib/tandem-config.ts, calls
 * client.health() (which hits GET /global/health), then probes provider
 * readiness when the SDK exposes client.providers. Exits 0 when the
 * engine health call succeeds; provider readiness is reported in JSON so
 * /tandem-doctor can guide setup without turning every missing default
 * into a transport/auth failure.
 *
 * Usage:
 *   npm run healthcheck
 *
 * Raw-fetch alternative kept as a comment for transparency:
 *
 *   const res = await fetch(`${baseUrl}/global/health`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   const body = await res.json();
 *   process.exit(body.ok ? 0 : 1);
 */

import "dotenv/config";
import { createClient, describeTokenSource } from "./lib/tandem-config.ts";

type ProviderConfig = {
  default?: string | null;
  providers?: Record<string, { defaultModel?: string }>;
};

async function providerReadiness(client: ReturnType<typeof createClient>["client"]) {
  if (!("providers" in client) || !client.providers) {
    return { status: "skipped", reason: "providers API unavailable" };
  }

  try {
    const config = (await client.providers.config()) as ProviderConfig;
    const providerId = config.default ?? null;
    const modelId = providerId ? config.providers?.[providerId]?.defaultModel : undefined;

    if (providerId && modelId) {
      return { status: "ok", providerId, modelId, config };
    }

    let catalog: unknown;
    try {
      catalog = await client.providers.catalog();
    } catch (catalogErr) {
      catalog = {
        unavailable: true,
        error: catalogErr instanceof Error ? catalogErr.message : String(catalogErr),
      };
    }

    return {
      status: "missing-default",
      reason: "No default provider/model configured in Tandem.",
      config,
      catalog,
    };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const { client, baseUrl, tokenSource } = createClient();
  const sourceLabel = describeTokenSource(tokenSource);

  try {
    const health = await client.health();
    const providers = await providerReadiness(client);
    console.log(
      JSON.stringify(
        { ok: true, baseUrl, tokenSource: sourceLabel, health, providers },
        null,
        2,
      ),
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Healthcheck failed:");
    console.error(`  baseUrl=${baseUrl}`);
    console.error(`  tokenSource=${sourceLabel}`);
    console.error(err);
    process.exit(1);
  }
}

main();
