import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { aiAnalyses } from "@/db/schema";
import { parseNumericString } from "@/lib/db/query-helpers";
import type {
  AiRecommendation,
  AiShortlistResult,
} from "@/lib/ai/shortlist-schema";

export type AiAnalysis = typeof aiAnalyses.$inferSelect;

export type AiShortlistView = {
  id: string;
  status: AiAnalysis["status"];
  model: string | null;
  promptVersion: string | null;
  matchScore: number | null;
  recommendation: AiRecommendation | null;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  summary: string | null;
  errorMessage: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function toAiShortlistView(row: AiAnalysis): AiShortlistView {
  const raw = (row.rawResponse ?? {}) as Partial<AiShortlistResult> & {
    recommendation?: AiRecommendation;
  };

  const matchingFromCriteria =
    row.criteriaMatches
      ?.filter((item) => item.matched)
      .map((item) => item.label) ?? [];
  const missingFromCriteria =
    row.criteriaMatches
      ?.filter((item) => !item.matched)
      .map((item) => item.label) ?? [];

  const matchingSkills = asStringArray(raw.matchingSkills);
  const missingSkills = asStringArray(raw.missingSkills);
  const strengths = asStringArray(row.strengths);
  const rawStrengths = asStringArray(raw.strengths);
  const weaknesses = asStringArray(row.weaknesses);
  const rawConcerns = asStringArray(raw.concerns);

  return {
    id: row.id,
    status: row.status,
    model: row.model,
    promptVersion: row.promptVersion,
    matchScore: raw.matchScore ?? parseNumericString(row.overallScore),
    recommendation: raw.recommendation ?? null,
    matchingSkills:
      matchingSkills.length > 0 ? matchingSkills : matchingFromCriteria,
    missingSkills:
      missingSkills.length > 0 ? missingSkills : missingFromCriteria,
    strengths: strengths.length ? strengths : rawStrengths,
    concerns: weaknesses.length ? weaknesses : rawConcerns,
    summary: row.summary ?? raw.summary ?? null,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getLatestAiAnalysis(
  applicationId: string,
): Promise<AiShortlistView | null> {
  const [row] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.applicationId, applicationId))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return row ? toAiShortlistView(row) : null;
}
