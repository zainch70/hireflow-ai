import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobShortlistingCriteria, jobs } from "@/db/schema";
import type { CriterionType } from "@/constants/criterion-type";
import type { EducationLevel } from "@/constants/education-level";
import type { JobShortlistingCriterionInput } from "@/schemas/jobs";
import { jobNotFoundError } from "@/services/jobs/errors";

export type JobShortlistingCriterion = {
  id: string;
  jobId: string;
  type: CriterionType;
  label: string;
  description: string | null;
  valueText: string | null;
  valueNumber: number | null;
  educationLevel: EducationLevel | null;
  weight: number;
  isRequired: boolean;
  sortOrder: number;
};

function parseNumeric(value: string | null): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function listJobShortlistingCriteria(
  jobId: string,
): Promise<JobShortlistingCriterion[]> {
  const rows = await db
    .select({
      id: jobShortlistingCriteria.id,
      jobId: jobShortlistingCriteria.jobId,
      type: jobShortlistingCriteria.type,
      label: jobShortlistingCriteria.label,
      description: jobShortlistingCriteria.description,
      valueText: jobShortlistingCriteria.valueText,
      valueNumber: jobShortlistingCriteria.valueNumber,
      educationLevel: jobShortlistingCriteria.educationLevel,
      weight: jobShortlistingCriteria.weight,
      isRequired: jobShortlistingCriteria.isRequired,
      sortOrder: jobShortlistingCriteria.sortOrder,
    })
    .from(jobShortlistingCriteria)
    .where(eq(jobShortlistingCriteria.jobId, jobId))
    .orderBy(
      asc(jobShortlistingCriteria.sortOrder),
      asc(jobShortlistingCriteria.createdAt),
    );

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    type: row.type as CriterionType,
    label: row.label,
    description: row.description,
    valueText: row.valueText,
    valueNumber: parseNumeric(row.valueNumber),
    educationLevel: (row.educationLevel as EducationLevel | null) ?? null,
    weight: row.weight,
    isRequired: row.isRequired,
    sortOrder: row.sortOrder,
  }));
}

/**
 * Replace all shortlisting criteria for a job (transactional).
 * Empty array clears criteria — AI then falls back to job description/requirements.
 */
export async function replaceJobShortlistingCriteria(input: {
  jobId: string;
  criteria: JobShortlistingCriterionInput[];
}): Promise<JobShortlistingCriterion[]> {
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(eq(jobs.id, input.jobId))
    .limit(1);

  if (!job) {
    throw jobNotFoundError();
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(jobShortlistingCriteria)
      .where(eq(jobShortlistingCriteria.jobId, input.jobId));

    if (input.criteria.length === 0) {
      return;
    }

    await tx.insert(jobShortlistingCriteria).values(
      input.criteria.map((criterion, index) => ({
        jobId: input.jobId,
        type: criterion.type,
        label: criterion.label,
        description: criterion.description ?? null,
        valueText: criterion.valueText ?? null,
        valueNumber:
          criterion.valueNumber !== undefined
            ? criterion.valueNumber.toFixed(2)
            : null,
        educationLevel: criterion.educationLevel ?? null,
        weight: criterion.weight ?? 1,
        isRequired: criterion.isRequired,
        sortOrder: index,
        skillId: null,
      })),
    );
  });

  return listJobShortlistingCriteria(input.jobId);
}
