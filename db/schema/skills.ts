import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./timestamps";

/**
 * Canonical skill catalog (normalized).
 * Applications and job criteria reference these rows.
 */
export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("skills_name_uidx").on(table.name),
    uniqueIndex("skills_slug_uidx").on(table.slug),
  ],
);
