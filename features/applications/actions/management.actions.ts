"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterApplicationChange } from "@/lib/cache/tags";
import { toErrorMessage } from "@/lib/errors";
import { APPLICATION_STATUS } from "@/constants/application-status";
import {
  addApplicationNoteSchema,
  assignApplicationSchema,
  decideAiShortlistSchema,
  deleteApplicationSchema,
  setApplicationArchivedSchema,
  updateApplicationStatusSchema,
} from "@/schemas/applications";
import {
  addApplicationNote,
  assignApplication,
  deleteApplication,
  setApplicationArchived,
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

export async function assignApplicationAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  await requireHrProfile();

  const parsed = assignApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await assignApplication({
      applicationId: parsed.data.applicationId,
      assigneeId: parsed.data.assigneeId,
    });
    revalidateAfterApplicationChange(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function setApplicationArchivedAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  await requireHrProfile();

  const parsed = setApplicationArchivedSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await setApplicationArchived({
      applicationId: parsed.data.applicationId,
      archived: parsed.data.archived,
    });
    revalidateAfterApplicationChange(parsed.data.applicationId);
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function deleteApplicationAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  await requireHrProfile();

  const parsed = deleteApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await deleteApplication({
      applicationId: parsed.data.applicationId,
    });
    revalidateAfterApplicationChange();
    return { applicationId: parsed.data.applicationId };
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

/** Accept AI shortlist → Selected; reject → Rejected (with audit note). */
export async function decideAiShortlistAction(
  input: unknown,
): Promise<ApplicationActionResult> {
  const profile = await requireHrProfile();

  const parsed = decideAiShortlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const toStatus =
    parsed.data.decision === "accept"
      ? APPLICATION_STATUS.SHORTLISTED
      : APPLICATION_STATUS.REJECTED;
  const note =
    parsed.data.decision === "accept"
      ? "Accepted AI shortlist recommendation"
      : "Rejected after AI shortlist review";

  try {
    await updateApplicationStatus({
      applicationId: parsed.data.applicationId,
      toStatus,
      note,
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
