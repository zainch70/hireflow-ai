"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireHrProfile } from "@/lib/auth";
import { isAppError, toErrorMessage } from "@/lib/errors";
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

function revalidateJobPaths(jobId?: string) {
  revalidatePath(ROUTES.dashboard.jobs);
  revalidatePath(ROUTES.dashboard.root);
  if (jobId) {
    revalidatePath(`${ROUTES.dashboard.jobs}/${jobId}/edit`);
  }
}

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
    revalidateJobPaths(job.id);
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
    revalidateJobPaths(jobId);
    return {};
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
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
    revalidateJobPaths();
    return {};
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
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
    revalidateJobPaths(jobId);
    return {};
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
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
    revalidateJobPaths(jobId);
    return {};
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
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
    revalidateJobPaths(jobId);
    return {};
  } catch (error) {
    return {
      error: isAppError(error) ? error.message : toErrorMessage(error),
    };
  }
}
