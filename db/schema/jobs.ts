import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  employmentTypeEnum,
  jobStatusEnum,
  timestampConfig,
  workplaceTypeEnum,
} from "./enums";
import { timestamps } from "./timestamps";
import { profiles } from "./profiles";

/**
 * Job postings created by HR/admin users.
 */
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdById: uuid("created_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    department: text("department"),
    location: text("location"),
    employmentType: employmentTypeEnum("employment_type")
      .notNull()
      .default("full_time"),
    workplaceType: workplaceTypeEnum("workplace_type")
      .notNull()
      .default("onsite"),
    description: text("description").notNull(),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").default("USD"),
    status: jobStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    openings: integer("openings").notNull().default(1),
    publishedAt: timestamp("published_at", timestampConfig),
    closesAt: timestamp("closes_at", timestampConfig),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("jobs_slug_uidx").on(table.slug),
    index("jobs_status_idx").on(table.status),
    index("jobs_created_by_idx").on(table.createdById),
  ],
);
