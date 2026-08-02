import { timestamp } from "drizzle-orm/pg-core";

import { timestampConfig } from "./enums";

/** Shared created_at / updated_at columns for all domain tables. */
export const timestamps = {
  createdAt: timestamp("created_at", timestampConfig).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", timestampConfig)
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};
