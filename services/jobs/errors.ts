import { AppError } from "@/lib/errors/app-error";
import type { ActionResult } from "@/lib/errors/action-result";
import type { JobStatus } from "@/constants/job-status";
import { JOB_STATUS } from "@/constants/job-status";

export type JobActionResult = ActionResult;

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
