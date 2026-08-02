#!/usr/bin/env node

/**
 * Runs drizzle-kit migrate after verifying DATABASE_URL connectivity.
 * Surfaces connection errors that drizzle-kit often hides behind its spinner.
 */
import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("✖ DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const host = url.split("@")[1]?.split("/")[0] ?? "(unknown)";
console.log(`→ Connecting to ${host} ...`);

const sql = postgres(url, {
  prepare: false,
  ssl: "require",
  connect_timeout: 20,
  max: 1,
});

try {
  await sql`select 1`;
  console.log("→ Database reachable. Running migrations...");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`✖ Cannot connect to database: ${message}`);
  console.error(`
Tips:
  1. In Supabase → Project Settings → Database → Connection string
  2. Prefer "Session pooler" URI if direct db.*.supabase.co fails DNS
  3. Append ?sslmode=require to DATABASE_URL
  4. Confirm the project is not paused
`);
  process.exitCode = 1;
  await sql.end({ timeout: 2 }).catch(() => undefined);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 }).catch(() => undefined);
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
