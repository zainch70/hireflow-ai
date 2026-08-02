#!/usr/bin/env node

/**
 * Installs a local bin wrapper so `npx drizzle-kit push` is blocked.
 * Runs on postinstall (and can be run manually).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binDir = path.join(root, "node_modules", ".bin");
const wrapper = path.join(root, "scripts", "drizzle-kit.mjs");

if (!fs.existsSync(path.join(root, "node_modules", "drizzle-kit"))) {
  console.warn(
    "[drizzle-kit wrapper] drizzle-kit not installed — skip wrapping",
  );
  process.exit(0);
}

fs.mkdirSync(binDir, { recursive: true });

const unixShim = `#!/bin/sh
basedir=$(dirname "$0")
exec node "$basedir/../../scripts/drizzle-kit.mjs" "$@"
`;

const cmdShim = `@ECHO off\r
node "%~dp0\\..\\..\\scripts\\drizzle-kit.mjs" %*\r
`;

const ps1Shim = `#!/usr/bin/env pwsh
$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
& node (Join-Path $basedir "../../scripts/drizzle-kit.mjs") @args
exit $LASTEXITCODE
`;

fs.writeFileSync(path.join(binDir, "drizzle-kit"), unixShim, { mode: 0o755 });
fs.writeFileSync(path.join(binDir, "drizzle-kit.cmd"), cmdShim);
fs.writeFileSync(path.join(binDir, "drizzle-kit.ps1"), ps1Shim);

console.log("[drizzle-kit wrapper] Installed — \`push\` is blocked");
