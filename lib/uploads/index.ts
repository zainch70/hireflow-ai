import { AppError } from "@/lib/errors/app-error";

import {
  UPLOAD_CONSTRAINTS,
  type AcceptedMimeType,
} from "./constants";

/**
 * Upload utilities — validation only.
 * Storage orchestration lives in services/storage.
 */

export function isAcceptedMimeType(
  mimeType: string,
): mimeType is AcceptedMimeType {
  return (UPLOAD_CONSTRAINTS.acceptedMimeTypes as readonly string[]).includes(
    mimeType,
  );
}

export function isWithinSizeLimit(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= UPLOAD_CONSTRAINTS.maxFileSizeBytes;
}

export function sanitizeResumeFileName(fileName: string): string {
  const trimmed = fileName.trim() || "resume.pdf";
  const withoutPath = trimmed.replace(/^.*[\\/]/, "");
  const safe = withoutPath.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120);
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
}

export function validatePdfFileMeta(input: {
  mimeType: string;
  sizeBytes: number;
  fileName: string;
}): { valid: true } | { valid: false; reason: string } {
  if (!input.fileName.toLowerCase().endsWith(".pdf")) {
    return { valid: false, reason: "Only PDF files are allowed" };
  }

  if (
    input.mimeType &&
    input.mimeType !== "application/octet-stream" &&
    !isAcceptedMimeType(input.mimeType)
  ) {
    return { valid: false, reason: "Only PDF files are allowed" };
  }

  if (!isWithinSizeLimit(input.sizeBytes)) {
    return {
      valid: false,
      reason: `File exceeds ${UPLOAD_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)} MB limit`,
    };
  }

  return { valid: true };
}

function assertPdfMagicBytes(bytes: Uint8Array) {
  const header = String.fromCharCode(...bytes.subarray(0, 5));
  if (!header.startsWith("%PDF")) {
    throw new AppError("File content is not a valid PDF", {
      code: "INVALID_RESUME",
      statusCode: 400,
    });
  }
}

/** Full server-side resume validation (meta + PDF magic bytes). */
export async function validateResumeFile(file: File): Promise<{
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}> {
  const meta = validatePdfFileMeta({
    mimeType: file.type,
    sizeBytes: file.size,
    fileName: file.name,
  });

  if (!meta.valid) {
    throw new AppError(meta.reason, {
      code: "INVALID_RESUME",
      statusCode: 400,
    });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  assertPdfMagicBytes(buffer);

  if (!isWithinSizeLimit(buffer.byteLength)) {
    throw new AppError(
      `File exceeds ${UPLOAD_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)} MB limit`,
      {
        code: "INVALID_RESUME",
        statusCode: 400,
      },
    );
  }

  return {
    bytes: buffer,
    fileName: sanitizeResumeFileName(file.name),
    mimeType: "application/pdf",
    sizeBytes: buffer.byteLength,
  };
}

export { UPLOAD_CONSTRAINTS, type AcceptedMimeType };
