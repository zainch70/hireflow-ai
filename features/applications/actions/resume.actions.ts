"use server";

import { requireHrProfile } from "@/lib/auth";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { getApplicationResumeDownloadUrl } from "@/services/applications";

export type ResumeUrlActionResult = {
  url?: string;
  fileName?: string;
  error?: string;
};

/** HR-only — never expose signed URLs to public callers. */
export async function getApplicationResumeUrlAction(
  applicationId: string,
): Promise<ResumeUrlActionResult> {
  await requireHrProfile();

  if (!applicationId) {
    return { error: "Invalid application" };
  }

  try {
    const result = await getApplicationResumeDownloadUrl(applicationId);
    return {
      url: result.url,
      fileName: result.fileName,
    };
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
    };
  }
}
