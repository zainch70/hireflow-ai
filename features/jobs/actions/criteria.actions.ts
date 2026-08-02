"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterJobChange } from "@/lib/cache/tags";
import { toErrorMessage, zodIssuesToFieldErrors } from "@/lib/errors";
import { jobShortlistingCriteriaFormSchema } from "@/schemas/jobs";
import { replaceJobShortlistingCriteria } from "@/services/jobs";
import type { JobActionResult } from "@/services/jobs/errors";

export async function saveJobShortlistingCriteriaAction(
  input: unknown,
): Promise<JobActionResult> {
  await requireHrProfile();

  const parsed = jobShortlistingCriteriaFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: zodIssuesToFieldErrors(parsed.error.issues),
    };
  }

  try {
    await replaceJobShortlistingCriteria({
      jobId: parsed.data.jobId,
      criteria: parsed.data.criteria,
    });
    revalidateAfterJobChange(parsed.data.jobId);
    return {};
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
}
