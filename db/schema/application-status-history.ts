import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { applicationStatusEnum, timestampConfig } from "./enums";
import { applications } from "./applications";
import { profiles } from "./profiles";

/**
 * Audit log of application status changes (HR pipeline).
 */
export const applicationStatusHistory = pgTable(
  "application_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    /** Null when recording the initial submitted state (optional). */
    fromStatus: applicationStatusEnum("from_status"),
    toStatus: applicationStatusEnum("to_status").notNull(),
    changedById: uuid("changed_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", timestampConfig).defaultNow().notNull(),
  },
  (table) => [
    index("application_status_history_application_idx").on(table.applicationId),
    index("application_status_history_created_idx").on(table.createdAt),
  ],
);
