/**
 * Shared engine config + token resolution for the plugin's helper scripts.
 *
 * Token resolution order (matches what `/tandem-doctor` reports):
 *   1) TANDEM_API_TOKEN env var
 *   2) TANDEM_API_TOKEN_FILE env var → read trimmed contents
 *   3) (caller may pass token directly; not handled here)
 *
 * The `@frumu/tandem-client` `TandemClient` constructor takes a string
 * `token`; it does not itself read env vars. Scripts resolve the token
 * here and then pass the string to the SDK.
 */

import { readFileSync } from "node:fs";
import { TandemClient } from "@frumu/tandem-client";

export type TokenSource =
  | { kind: "env"; name: "TANDEM_API_TOKEN" }
  | { kind: "file"; path: string }
  | { kind: "unsafe"; reason: "TANDEM_UNSAFE_NO_API_TOKEN=1" }
  | { kind: "missing" };

export function resolveBaseUrl(): string {
  return process.env.TANDEM_BASE_URL || "http://127.0.0.1:39731";
}

export function resolveWorkspaceRoot(): string | undefined {
  const v = process.env.TANDEM_WORKSPACE_ROOT?.trim();
  return v ? v : undefined;
}

export function resolveToken(): { token: string; source: TokenSource } {
  if (process.env.TANDEM_UNSAFE_NO_API_TOKEN === "1") {
    return {
      token: "",
      source: { kind: "unsafe", reason: "TANDEM_UNSAFE_NO_API_TOKEN=1" },
    };
  }
  const direct = process.env.TANDEM_API_TOKEN;
  if (direct) {
    return { token: direct, source: { kind: "env", name: "TANDEM_API_TOKEN" } };
  }
  const filePath = process.env.TANDEM_API_TOKEN_FILE;
  if (filePath) {
    let raw: string;
    try {
      raw = readFileSync(filePath, "utf8").trim();
    } catch (err) {
      console.error(
        `[tandem-codex-plugin] Failed to read TANDEM_API_TOKEN_FILE (${filePath}):`,
      );
      console.error(err);
      process.exit(2);
    }
    if (!raw) {
      console.error(
        `[tandem-codex-plugin] TANDEM_API_TOKEN_FILE is empty: ${filePath}`,
      );
      process.exit(2);
    }
    return { token: raw, source: { kind: "file", path: filePath } };
  }
  return { token: "", source: { kind: "missing" } };
}

export function describeTokenSource(source: TokenSource): string {
  switch (source.kind) {
    case "env":
      return source.name;
    case "file":
      return `TANDEM_API_TOKEN_FILE (${source.path})`;
    case "unsafe":
      return source.reason;
    case "missing":
      return "unset";
  }
}

function dieIfTokenUnusable(source: TokenSource): void {
  if (source.kind === "missing") {
    console.error("[tandem-codex-plugin] No engine token found.");
    console.error("Set TANDEM_API_TOKEN or TANDEM_API_TOKEN_FILE.");
    console.error("See shared/tandem-auth.md or run /tandem-setup in Codex.");
    process.exit(2);
  }
  if (source.kind === "unsafe") {
    console.warn(
      "[tandem-codex-plugin] WARNING: TANDEM_UNSAFE_NO_API_TOKEN=1 — " +
        "engine token enforcement is disabled. Do not use on shared engines.",
    );
  }
}

export function createClient(): {
  client: TandemClient;
  baseUrl: string;
  tokenSource: TokenSource;
} {
  const baseUrl = resolveBaseUrl();
  const { token, source } = resolveToken();
  dieIfTokenUnusable(source);
  const client = new TandemClient({ baseUrl, token });
  return { client, baseUrl, tokenSource: source };
}
