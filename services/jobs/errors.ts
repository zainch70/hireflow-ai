import { AppError } from "@/lib/errors/app-error";
import type { JobStatus } from "@/constants/job-status";
import { JOB_STATUS } from "@/constants/job-status";

export type JobActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function toFieldErrors(
  error: unknown,
): Record<string, string[] | undefined> | undefined {
  if (
    error &&
    typeof error === "object" &&
    "flatten" in error &&
    typeof (error as { flatten: () => unknown }).flatten === "function"
  ) {
    return (
      error as {
        flatten: () => { fieldErrors: Record<string, string[] | undefined> };
      }
    ).flatten().fieldErrors;
  }

  return undefined;
}

export function jobNotFoundError() {
  return new AppError("Job not found", {
    code: "JOB_NOT_FOUND",
    statusCode: 404,
  });
}

export function invalidJobTransitionError(from: JobStatus, action: string) {
  return new AppError(`Cannot ${action} a ${from.replaceAll("_", " ")} job`, {
    code: "INVALID_JOB_TRANSITION",
    statusCode: 400,
  });
}

export function assertCanPublish(status: JobStatus) {
  if (status !== JOB_STATUS.DRAFT && status !== JOB_STATUS.CLOSED) {
    throw invalidJobTransitionError(status, "publish");
  }
}

export function assertCanUnpublish(status: JobStatus) {
  if (status !== JOB_STATUS.PUBLISHED) {
    throw invalidJobTransitionError(status, "unpublish");
  }
}

export function assertCanClose(status: JobStatus) {
  if (status !== JOB_STATUS.PUBLISHED && status !== JOB_STATUS.DRAFT) {
    throw invalidJobTransitionError(status, "close");
  }
}
