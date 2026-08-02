import { eq } from "drizzle-orm";

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
  AI_SHORTLIST_PROMPT_VERSION,
  aiShortlistResultSchema,
} from "@/lib/ai/shortlist-schema";
import { applicationNotFoundError } from "@/services/applications/errors";
import {
  aiShortlistFailedError,
  aiShortlistUnavailableError,
} from "@/services/ai/errors";
import {
  toAiShortlistView,
  type AiShortlistView,
} from "@/services/ai/view";
import { listJobShortlistingCriteria } from "@/services/jobs/criteria";

function formatShortlistError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "AI shortlisting failed";

  if (/quota|rate.?limit|resource_exhausted/i.test(raw)) {
    return "All Gemini models/keys hit quota or rate limits. Add another key in GEMINI_API_KEYS, wait for reset, or enable billing — then rerun.";
  }

  const firstLine = raw.split("\n")[0]?.trim() ?? raw;
  return firstLine.length > 280 ? `${firstLine.slice(0, 280)}…` : firstLine;
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

  const [educationRows, skillRows, criteria] = await Promise.all([
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
        category: skills.category,
        proficiency: applicationSkills.proficiency,
      })
      .from(applicationSkills)
      .innerJoin(skills, eq(applicationSkills.skillId, skills.id))
      .where(eq(applicationSkills.applicationId, applicationId)),
    listJobShortlistingCriteria(context.application.jobId),
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
    const { object, usage, modelId, attempts } =
      await generateObjectWithGeminiFallback({
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
          criteria: criteria.map((item) => ({
            type: item.type,
            label: item.label,
            description: item.description,
            valueText: item.valueText,
            valueNumber: item.valueNumber,
            educationLevel: item.educationLevel,
            weight: item.weight,
            isRequired: item.isRequired,
          })),
          candidate: {
            fullName: context.application.fullName,
            email: context.application.email,
            currentTitle: context.application.currentTitle,
            currentCompany: context.application.currentCompany,
            currentLocation: context.application.currentLocation,
            yearsOfExperience: context.application.yearsOfExperience,
            expectedSalary: context.application.expectedSalary,
            noticePeriod: context.application.noticePeriod,
            employmentStatus: context.application.employmentStatus,
            interestReason: context.application.interestReason,
            whyConsider: context.application.whyConsider,
            willingOnsite: context.application.willingOnsite,
            availableJoinDate: context.application.availableJoinDate,
            workExperience: context.application.workExperience,
            coverLetter: context.application.coverLetter,
            linkedinUrl: context.application.linkedinUrl,
            portfolioUrl: context.application.portfolioUrl,
            githubUrl: context.application.githubUrl,
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
