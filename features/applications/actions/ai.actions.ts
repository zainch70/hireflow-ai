"use server";

import { revalidatePath } from "next/cache";

import { ROUTES, hrApplicationPath } from "@/constants/routes";
import { requireHrProfile } from "@/lib/auth";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { applicationIdSchema } from "@/schemas/applications";
import { runAiShortlisting } from "@/services/ai";

export type AiShortlistActionResult = {
  error?: string;
  analysisId?: string;
};

export async function runAiShortlistingAction(
  applicationId: string,
): Promise<AiShortlistActionResult> {
  await requireHrProfile();

  const parsed = applicationIdSchema.safeParse({ applicationId });
  if (!parsed.success) {
    return { error: "Invalid application" };
  }

  try {
    const analysis = await runAiShortlisting(parsed.data.applicationId);
    revalidatePath(hrApplicationPath(parsed.data.applicationId));
    revalidatePath(ROUTES.dashboard.applications);
    revalidatePath(ROUTES.dashboard.root);
    revalidatePath(ROUTES.dashboard.statistics);
    return { analysisId: analysis.id };
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
    };
  }
}
