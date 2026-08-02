import { AppError } from "@/lib/errors/app-error";
import type { ActionResult } from "@/lib/errors/action-result";

export type ApplicationActionResult = ActionResult & {
  applicationId?: string;
};

export function applicationNotAllowedError() {
  return new AppError("This role is not open for applications", {
    code: "APPLICATION_NOT_ALLOWED",
    statusCode: 400,
  });
}

export function duplicateApplicationError() {
  return new AppError("You have already applied to this role with this email", {
    code: "DUPLICATE_APPLICATION",
    statusCode: 409,
  });
}

export function applicationNotFoundError() {
  return new AppError("Application not found", {
    code: "APPLICATION_NOT_FOUND",
    statusCode: 404,
  });
}

export function invalidApplicationTransitionError(from: string, to: string) {
  return new AppError(`Cannot change status from ${from} to ${to}`, {
    code: "INVALID_APPLICATION_TRANSITION",
    statusCode: 400,
  });
}

export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code =
    "code" in error
      ? String((error as { code?: unknown }).code)
      : "cause" in error &&
          error.cause &&
          typeof error.cause === "object" &&
          "code" in error.cause
        ? String((error.cause as { code?: unknown }).code)
        : undefined;

  return code === "23505";
}
