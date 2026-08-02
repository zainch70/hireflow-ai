import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

/**
 * Schema workflow (required):
 *   1. Edit db/schema
 *   2. npm run db:generate
 *   3. npm run db:migrate
 *
 * Do NOT run drizzle-kit push — it is blocked via `npm run db:push`.
 */
export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
