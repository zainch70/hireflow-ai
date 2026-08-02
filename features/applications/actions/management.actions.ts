"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterApplicationChange } from "@/lib/cache/tags";
import { toErrorMessage } from "@/lib/errors";
import {
  addApplicationNoteSchema,
  updateApplicationStatusSchema,
} from "@/schemas/applications";
import {
  addApplicationNote,
  updateApplicationStatus,
} from "@/services/applications";
import type { ApplicationActionResult } from "@/services/applications/errors";

export async function updateApplicationStatusAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  const profile = await requireHrProfile();

  const parsed = updateApplicationStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateApplicationStatus({
      applicationId: parsed.data.applicationId,
      toStatus: parsed.data.status,
      note: parsed.data.note,
      actorId: profile.id,
    });
    revalidateAfterApplicationChange(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function addApplicationNoteAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  const profile = await requireHrProfile();

  const parsed = addApplicationNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await addApplicationNote({
      applicationId: parsed.data.applicationId,
      body: parsed.data.body,
      authorId: profile.id,
    });
    revalidateAfterApplicationChange(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}
