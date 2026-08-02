"use server";

import { requireHrProfile } from "@/lib/auth";
import { revalidateAfterJobChange } from "@/lib/cache/tags";
import { toErrorMessage } from "@/lib/errors";
import { jobFormSchema, jobIdSchema } from "@/schemas/jobs";
import {
  closeJob,
  createJob,
  deleteJob,
  publishJob,
  unpublishJob,
  updateJob,
} from "@/services/jobs";
import type { JobActionResult } from "@/services/jobs/errors";

export async function createJobAction(
  input: unknown,
): Promise<JobActionResult & { jobId?: string }> {
  const profile = await requireHrProfile();

  const parsed = jobFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const job = await createJob({
      data: parsed.data,
      createdById: profile.id,
    });
    revalidateAfterJobChange(job.id);
    return { jobId: job.id };
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
}

export async function updateJobAction(
  jobId: string,
  input: unknown,
): Promise<JobActionResult> {
  await requireHrProfile();

  const idParsed = jobIdSchema.safeParse({ jobId });
  if (!idParsed.success) {
    return { error: "Invalid job id" };
  }

  const parsed = jobFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateJob({ jobId, data: parsed.data });
    revalidateAfterJobChange(jobId);
    return {};
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function deleteJobAction(jobId: string): Promise<JobActionResult> {
  await requireHrProfile();

  const idParsed = jobIdSchema.safeParse({ jobId });
  if (!idParsed.success) {
    return { error: "Invalid job id" };
  }

  try {
    await deleteJob(jobId);
    revalidateAfterJobChange();
    return {};
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function publishJobAction(
  jobId: string,
): Promise<JobActionResult> {
  await requireHrProfile();

  const idParsed = jobIdSchema.safeParse({ jobId });
  if (!idParsed.success) {
    return { error: "Invalid job id" };
  }

  try {
    await publishJob(jobId);
    revalidateAfterJobChange(jobId);
    return {};
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function unpublishJobAction(
  jobId: string,
): Promise<JobActionResult> {
  await requireHrProfile();

  const idParsed = jobIdSchema.safeParse({ jobId });
  if (!idParsed.success) {
    return { error: "Invalid job id" };
  }

  try {
    await unpublishJob(jobId);
    revalidateAfterJobChange(jobId);
    return {};
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}

export async function closeJobAction(jobId: string): Promise<JobActionResult> {
  await requireHrProfile();

  const idParsed = jobIdSchema.safeParse({ jobId });
  if (!idParsed.success) {
    return { error: "Invalid job id" };
  }

  try {
    await closeJob(jobId);
    revalidateAfterJobChange(jobId);
    return {};
  } catch (error) {
    return {
      error: toErrorMessage(error),
    };
  }
}
