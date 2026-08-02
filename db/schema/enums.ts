import {
  pgEnum,
  type PgTimestampConfig,
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL enums — keep values aligned with /constants.
 */

export const userRoleEnum = pgEnum("user_role", [
  "candidate",
  "hr",
  "admin",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "published",
  "closed",
  "archived",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
]);

export const workplaceTypeEnum = pgEnum("workplace_type", [
  "onsite",
  "remote",
  "hybrid",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
]);

export const educationLevelEnum = pgEnum("education_level", [
  "high_school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
  "other",
]);

export const criterionTypeEnum = pgEnum("criterion_type", [
  "skill",
  "experience_years",
  "education_level",
  "keyword",
  "custom",
]);

export const aiAnalysisStatusEnum = pgEnum("ai_analysis_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const timestampConfig = {
  withTimezone: true,
  mode: "date",
} satisfies PgTimestampConfig;
