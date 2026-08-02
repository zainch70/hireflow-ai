"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterAiShortlist } from "@/lib/cache/tags";
import { toErrorMessage } from "@/lib/errors";
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
    revalidateAfterAiShortlist(parsed.data.applicationId);
    return { analysisId: analysis.id };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}
