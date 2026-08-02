"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterAiShortlist } from "@/lib/cache/tags";
import { toErrorMessage } from "@/lib/errors";
import {
  enforceRateLimit,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { applicationIdSchema } from "@/schemas/applications";
import { runAiShortlisting } from "@/services/ai";

export type AiShortlistActionResult = {
  error?: string;
  analysisId?: string;
};

export async function runAiShortlistingAction(
  applicationId: string,
): Promise<AiShortlistActionResult> {
  const profile = await requireHrProfile();

  const parsed = applicationIdSchema.safeParse({ applicationId });
  if (!parsed.success) {
    return { error: "Invalid application" };
  }

  try {
    await enforceRateLimit({
      key: `ai:user:${profile.id}`,
      limit: RATE_LIMITS.aiShortlist.limit,
      windowMs: RATE_LIMITS.aiShortlist.windowMs,
    });

    const analysis = await runAiShortlisting(parsed.data.applicationId);
    revalidateAfterAiShortlist(parsed.data.applicationId);
    return { analysisId: analysis.id };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}
