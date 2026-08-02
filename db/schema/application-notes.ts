import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./timestamps";
import { applications } from "./applications";
import { profiles } from "./profiles";

/**
 * Internal HR notes on an application (not visible to candidates).
 */
export const applicationNotes = pgTable(
  "application_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (table) => [
    index("application_notes_application_idx").on(table.applicationId),
    index("application_notes_author_idx").on(table.authorId),
  ],
);
