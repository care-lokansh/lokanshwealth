/**
 * Durable production environment override that survives template script upgrades.
 *
 * When NODE_ENV or ENVIRONMENT is "production", this module reads
 * backend/.env.production and sets critical env vars (DATABASE_URL,
 * BACKEND_URL, BETTER_AUTH_SECRET, DIRECT_URL) from that file when present.
 *
 * Imported FIRST in src/index.ts (before "./env", auth, prisma usage) so
 * staff login works on deployed instances even when scripts/env.sh is
 * overwritten by template upgrades that force DATABASE_URL=file:/data/....
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction =
  process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";

if (isProduction) {
  try {
    const envProdPath = join(__dirname, "../.env.production");
    const content = readFileSync(envProdPath, "utf-8");

    // Parse each line: KEY="value" or KEY=value
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
      if (!match) continue;

      const [, key, rawVal] = match;
      // Strip surrounding quotes if present
      const value = rawVal.replace(/^["']|["']$/g, "");

      // Only override critical keys; leave others alone
      if (
        key === "DATABASE_URL" ||
        key === "DIRECT_URL" ||
        key === "BACKEND_URL" ||
        key === "BETTER_AUTH_SECRET"
      ) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    // .env.production missing or unreadable — not fatal, fall back to env.sh / scripts
    console.warn("load-prod-env: could not read .env.production:", (err as Error).message);
  }
}
