"use server";

import { revalidatePath } from "next/cache";

import { careersApplyPath, careersJobPath } from "@/constants/routes";
import { revalidateAfterApplicationChange } from "@/lib/cache/tags";
import { toErrorMessage, zodIssuesToFieldErrors } from "@/lib/errors";
import { applicationFormSchema } from "@/schemas/applications";
import { submitApplication } from "@/services/applications";
import type { ApplicationActionResult } from "@/services/applications/errors";

export async function submitApplicationAction(
  jobSlug: string,
  input: unknown,
  resume: File | null,
): Promise<ApplicationActionResult> {
  const parsed = applicationFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      fieldErrors: zodIssuesToFieldErrors(parsed.error.issues),
    };
  }

  if (!resume) {
    return {
      fieldErrors: {
        resume: ["Resume PDF is required"],
      },
    };
  }

  try {
    const { application } = await submitApplication({
      jobSlug,
      data: parsed.data,
      resume,
    });

    revalidateAfterApplicationChange(application.id);
    revalidatePath(careersJobPath(jobSlug));
    revalidatePath(careersApplyPath(jobSlug));

    return { applicationId: application.id };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}
