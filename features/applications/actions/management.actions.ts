"use server";

import { revalidatePath } from "next/cache";

import { ROUTES, hrApplicationPath } from "@/constants/routes";
import { requireHrProfile } from "@/lib/auth";
import { isAppError, toErrorMessage } from "@/lib/errors";
import {
  addApplicationNoteSchema,
  updateApplicationStatusSchema,
} from "@/schemas/applications";
import {
  addApplicationNote,
  updateApplicationStatus,
} from "@/services/applications";
import type { ApplicationActionResult } from "@/services/applications/errors";

function revalidateApplicationPaths(applicationId: string) {
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(hrApplicationPath(applicationId));
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
}

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
    revalidateApplicationPaths(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
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
    revalidateApplicationPaths(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
    };
  }
}
