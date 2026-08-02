import { AppError } from "@/lib/errors/app-error";

export function invalidResumeError(message: string) {
  return new AppError(message, {
    code: "INVALID_RESUME",
    statusCode: 400,
  });
}

export function resumeUploadError(message = "Failed to upload resume") {
  return new AppError(message, {
    code: "RESUME_UPLOAD_FAILED",
    statusCode: 500,
  });
}

export function resumeNotFoundError() {
  return new AppError("Resume not found", {
    code: "RESUME_NOT_FOUND",
    statusCode: 404,
  });
}

export function resumeSignedUrlError(
  message = "Failed to create resume download link",
) {
  return new AppError(message, {
    code: "RESUME_SIGNED_URL_FAILED",
    statusCode: 500,
  });
}
