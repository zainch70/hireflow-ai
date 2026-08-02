import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  applicationEducation,
  applicationSkills,
  applications,
  aiAnalyses,
  jobs,
  skills,
} from "@/db/schema";
import { hasGeminiApiKey } from "@/lib/ai/client";
import { generateObjectWithGeminiFallback } from "@/lib/ai/generate-with-fallback";
import {
  buildShortlistSystemPrompt,
  buildShortlistUserPrompt,
} from "@/lib/ai/shortlist-prompt";
import {
  AI_RECOMMENDATIONS,
  AI_RECOMMENDATION_LABELS,
  AI_SHORTLIST_PROMPT_VERSION,
  aiShortlistResultSchema,
  type AiRecommendation,
  type AiShortlistResult,
} from "@/lib/ai/shortlist-schema";
import { applicationNotFoundError } from "@/services/applications/errors";
import {
  aiShortlistFailedError,
  aiShortlistUnavailableError,
} from "@/services/ai/errors";

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
  createdAt: Date;
  updatedAt: Date;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function parseScore(value: string | null): number | null {
  if (value == null || value === "") {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

  return {
    id: row.id,
    status: row.status,
    model: row.model,
    promptVersion: row.promptVersion,
    matchScore: raw.matchScore ?? parseScore(row.overallScore),
    recommendation: raw.recommendation ?? null,
    matchingSkills:
      asStringArray(raw.matchingSkills).length > 0
        ? asStringArray(raw.matchingSkills)
        : matchingFromCriteria,
    missingSkills:
      asStringArray(raw.missingSkills).length > 0
        ? asStringArray(raw.missingSkills)
        : missingFromCriteria,
    strengths: asStringArray(row.strengths).length
      ? asStringArray(row.strengths)
      : asStringArray(raw.strengths),
    concerns: asStringArray(row.weaknesses).length
      ? asStringArray(row.weaknesses)
      : asStringArray(raw.concerns),
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

export async function runAiShortlisting(
  applicationId: string,
): Promise<AiShortlistView> {
  if (!hasGeminiApiKey()) {
    throw aiShortlistUnavailableError();
  }

  const [context] = await db
    .select({
      application: applications,
      jobTitle: jobs.title,
      jobDepartment: jobs.department,
      jobLocation: jobs.location,
      jobEmploymentType: jobs.employmentType,
      jobExperience: jobs.experience,
      jobDescription: jobs.description,
      jobRequirements: jobs.requirements,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!context) {
    throw applicationNotFoundError();
  }

  const [educationRows, skillRows] = await Promise.all([
    db
      .select({
        institution: applicationEducation.institution,
        degree: applicationEducation.degree,
        fieldOfStudy: applicationEducation.fieldOfStudy,
        educationLevel: applicationEducation.educationLevel,
        grade: applicationEducation.grade,
      })
      .from(applicationEducation)
      .where(eq(applicationEducation.applicationId, applicationId)),
    db
      .select({
        name: skills.name,
        proficiency: applicationSkills.proficiency,
      })
      .from(applicationSkills)
      .innerJoin(skills, eq(applicationSkills.skillId, skills.id))
      .where(eq(applicationSkills.applicationId, applicationId)),
  ]);

  const [pending] = await db
    .insert(aiAnalyses)
    .values({
      applicationId,
      status: "processing",
      model: null,
      promptVersion: AI_SHORTLIST_PROMPT_VERSION,
    })
    .returning();

  if (!pending) {
    throw new Error("Failed to create AI analysis row");
  }

  try {
    const {
      object,
      usage,
      modelId,
      attempts,
    } = await generateObjectWithGeminiFallback({
      schema: aiShortlistResultSchema,
      schemaName: "AiShortlistResult",
      schemaDescription:
        "Structured shortlisting result for an HR recruitment portal",
      system: buildShortlistSystemPrompt(),
      prompt: buildShortlistUserPrompt({
        job: {
          title: context.jobTitle,
          department: context.jobDepartment,
          location: context.jobLocation,
          employmentType: context.jobEmploymentType,
          experience: context.jobExperience,
          description: context.jobDescription,
          requirements: context.jobRequirements,
        },
        candidate: {
          fullName: context.application.fullName,
          email: context.application.email,
          currentTitle: context.application.currentTitle,
          yearsOfExperience: context.application.yearsOfExperience,
          workExperience: context.application.workExperience,
          coverLetter: context.application.coverLetter,
          linkedinUrl: context.application.linkedinUrl,
          portfolioUrl: context.application.portfolioUrl,
          education: educationRows,
          skills: skillRows,
        },
        resumeText: context.application.resumeText,
      }),
    });

    const result = aiShortlistResultSchema.parse(object);
    const inputTokens = usage.inputTokens ?? 0;
    const outputTokens = usage.outputTokens ?? 0;
    const tokensUsed = inputTokens + outputTokens;

    console.info(
      `[ai] shortlist ok model=${modelId} attempts=${attempts} tokens=${tokensUsed}`,
    );

    const [completed] = await db
      .update(aiAnalyses)
      .set({
        status: "completed",
        model: modelId,
        overallScore: result.matchScore.toFixed(2),
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.concerns,
        criteriaMatches: [
          ...result.matchingSkills.map((label) => ({
            label,
            matched: true,
          })),
          ...result.missingSkills.map((label) => ({
            label,
            matched: false,
          })),
        ],
        rawResponse: result,
        tokensUsed: tokensUsed > 0 ? tokensUsed : null,
        errorMessage: null,
      })
      .where(eq(aiAnalyses.id, pending.id))
      .returning();

    if (!completed) {
      throw new Error("Failed to save AI analysis");
    }

    return toAiShortlistView(completed);
  } catch (error) {
    const message = formatShortlistError(error);

    await db
      .update(aiAnalyses)
      .set({
        status: "failed",
        errorMessage: message.slice(0, 500),
      })
      .where(eq(aiAnalyses.id, pending.id));

    throw aiShortlistFailedError(
      error instanceof Error ? new Error(message, { cause: error }) : error,
    );
  }
}

function formatShortlistError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "AI shortlisting failed";

  if (/quota|rate.?limit|resource_exhausted/i.test(raw)) {
    return "All Gemini models/keys hit quota or rate limits. Add another key in GEMINI_API_KEYS, wait for reset, or enable billing — then rerun.";
  }

  // Strip noisy provider dumps for the UI
  const firstLine = raw.split("\n")[0]?.trim() ?? raw;
  return firstLine.length > 280 ? `${firstLine.slice(0, 280)}…` : firstLine;
}

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
