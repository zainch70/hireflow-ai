import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { applicationStatusEnum } from "./enums";
import { timestamps } from "./timestamps";
import { jobs } from "./jobs";
import { profiles } from "./profiles";

/**
 * Candidate application for a job.
 * Contact fields are snapshotted at submit time (even if profile changes later).
 */
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    /** Optional link when the candidate has an account. */
    candidateId: uuid("candidate_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    coverLetter: text("cover_letter"),
    resumePath: text("resume_path"),
    resumeFileName: text("resume_file_name"),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    currentTitle: text("current_title"),
    yearsOfExperience: integer("years_of_experience"),
    status: applicationStatusEnum("status").notNull().default("submitted"),
    source: text("source").default("careers_portal"),
    ...timestamps,
  },
  (table) => [
    index("applications_job_idx").on(table.jobId),
    index("applications_candidate_idx").on(table.candidateId),
    index("applications_status_idx").on(table.status),
    index("applications_email_idx").on(table.email),
    uniqueIndex("applications_job_email_uidx").on(table.jobId, table.email),
  ],
);
