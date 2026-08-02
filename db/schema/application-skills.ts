import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./timestamps";
import { applications } from "./applications";
import { skills } from "./skills";

/**
 * Junction: skills claimed on a specific application.
 */
export const applicationSkills = pgTable(
  "application_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "restrict" }),
    proficiency: text("proficiency"),
    yearsUsed: integer("years_used"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("application_skills_application_skill_uidx").on(
      table.applicationId,
      table.skillId,
    ),
    index("application_skills_skill_idx").on(table.skillId),
  ],
);
