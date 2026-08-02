#!/usr/bin/env node

/**
 * Project wrapper for drizzle-kit.
 * Blocks `push` (and aliases) — schema changes must use generate + migrate.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BLOCKED = new Set(["push"]);

const args = process.argv.slice(2);
const command = args.find((arg) => !arg.startsWith("-"));

if (command && BLOCKED.has(command)) {
  console.error(`
✖ BLOCKED: \`drizzle-kit ${command}\` is disabled for this project.

  Push can break or drift the database schema.

  Use instead:
    npm run db:generate
    npm run db:migrate
`);
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realCli = path.join(root, "node_modules", "drizzle-kit", "bin.cjs");

if (!fs.existsSync(realCli)) {
  console.error("drizzle-kit is not installed. Run: npm install");
  process.exit(1);
}

const result = spawnSync(process.execPath, [realCli, ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
