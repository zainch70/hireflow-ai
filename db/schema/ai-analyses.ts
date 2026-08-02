import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { aiAnalysisStatusEnum } from "./enums";
import { timestamps } from "./timestamps";
import { applications } from "./applications";

/**
 * AI screening results for an application.
 * Multiple rows allowed over time (re-runs); order by created_at desc for latest.
 */
export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    status: aiAnalysisStatusEnum("status").notNull().default("pending"),
    model: text("model"),
    promptVersion: text("prompt_version"),
    /** Overall fit score 0–100 (nullable until completed). */
    overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
    summary: text("summary"),
    strengths: jsonb("strengths").$type<string[]>().default([]),
    weaknesses: jsonb("weaknesses").$type<string[]>().default([]),
    /** Criterion-level match details for explainability. */
    criteriaMatches: jsonb("criteria_matches").$type<
      Array<{
        criterionId?: string;
        label: string;
        matched: boolean;
        score?: number;
        rationale?: string;
      }>
    >(),
    rawResponse: jsonb("raw_response"),
    errorMessage: text("error_message"),
    tokensUsed: integer("tokens_used"),
    ...timestamps,
  },
  (table) => [
    index("ai_analyses_application_idx").on(table.applicationId),
    index("ai_analyses_status_idx").on(table.status),
    /** Speeds latest-score lookup: ORDER BY created_at DESC per application. */
    index("ai_analyses_app_created_idx").on(
      table.applicationId,
      table.createdAt,
    ),
  ],
);
