import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { criterionTypeEnum, educationLevelEnum } from "./enums";
import { timestamps } from "./timestamps";
import { jobs } from "./jobs";
import { skills } from "./skills";

/**
 * Per-job shortlisting / screening rules used by HR and AI.
 * One job can have many criteria rows (skills, experience, education, etc.).
 */
export const jobShortlistingCriteria = pgTable(
  "job_shortlisting_criteria",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id").references(() => skills.id, {
      onDelete: "set null",
    }),
    type: criterionTypeEnum("type").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    /** Free-form match value (e.g. keyword, custom rule text). */
    valueText: text("value_text"),
    /** Numeric threshold (e.g. min years of experience). */
    valueNumber: numeric("value_number", { precision: 8, scale: 2 }),
    /** When type = education_level. */
    educationLevel: educationLevelEnum("education_level"),
    weight: integer("weight").notNull().default(1),
    isRequired: boolean("is_required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("job_shortlisting_criteria_job_idx").on(table.jobId),
    index("job_shortlisting_criteria_skill_idx").on(table.skillId),
  ],
);
