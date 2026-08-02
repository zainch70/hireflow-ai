import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { timestampConfig } from "./enums";

/**
 * Fixed-window rate limit counters (apply / AI actions).
 * Key examples: `apply:ip:1.2.3.4`, `ai:user:<uuid>`.
 */
export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    windowStartsAt: timestamp("window_starts_at", timestampConfig).notNull(),
  },
  (table) => [index("rate_limit_buckets_window_idx").on(table.windowStartsAt)],
);
