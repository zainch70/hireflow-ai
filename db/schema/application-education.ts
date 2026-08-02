import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { educationLevelEnum } from "./enums";
import { timestamps } from "./timestamps";
import { applications } from "./applications";

/**
 * Education history snapshotted on an application.
 */
export const applicationEducation = pgTable(
  "application_education",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    degree: text("degree"),
    fieldOfStudy: text("field_of_study"),
    educationLevel: educationLevelEnum("education_level"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    grade: text("grade"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("application_education_application_idx").on(table.applicationId),
  ],
);
