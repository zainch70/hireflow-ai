import { sql } from "drizzle-orm";

import { db } from "@/db";
import { aiAnalyses } from "@/db/schema";
import {
  AI_RECOMMENDATIONS,
  AI_RECOMMENDATION_LABELS,
  type AiRecommendation,
} from "@/lib/ai/shortlist-schema";

export type AiRecommendationCount = {
  recommendation: AiRecommendation;
  label: string;
  count: number;
};

/**
 * Counts latest completed AI shortlist recommendation per application.
 * Reads `raw_response->>'recommendation'` (no denormalized column yet).
 */
export async function countAiRecommendations(): Promise<
  AiRecommendationCount[]
> {
  const rows = await db.execute<{
    recommendation: string;
    count: string | number;
  }>(sql`
    WITH latest AS (
      SELECT DISTINCT ON (${aiAnalyses.applicationId})
        ${aiAnalyses.rawResponse} ->> 'recommendation' AS recommendation
      FROM ${aiAnalyses}
      WHERE ${aiAnalyses.status} = 'completed'
        AND ${aiAnalyses.rawResponse} ->> 'recommendation' IS NOT NULL
      ORDER BY ${aiAnalyses.applicationId}, ${aiAnalyses.createdAt} DESC
    )
    SELECT recommendation, COUNT(*)::int AS count
    FROM latest
    GROUP BY recommendation
  `);

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.recommendation, Number(row.count));
  }

  return AI_RECOMMENDATIONS.map((recommendation) => ({
    recommendation,
    label: AI_RECOMMENDATION_LABELS[recommendation],
    count: counts.get(recommendation) ?? 0,
  }));
}
