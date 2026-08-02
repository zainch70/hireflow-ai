import {
  UPLOAD_CONSTRAINTS,
  type AcceptedMimeType,
} from "./constants";

/**
 * Upload utilities (foundation only).
 * Actual storage upload / PDF parsing will be implemented later.
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

export function validatePdfFileMeta(input: {
  mimeType: string;
  sizeBytes: number;
  fileName: string;
}): { valid: true } | { valid: false; reason: string } {
  if (!input.fileName.toLowerCase().endsWith(".pdf")) {
    return { valid: false, reason: "Only PDF files are allowed" };
  }

  if (!isAcceptedMimeType(input.mimeType)) {
    return { valid: false, reason: "Invalid file type" };
  }

  if (!isWithinSizeLimit(input.sizeBytes)) {
    return {
      valid: false,
      reason: `File exceeds ${UPLOAD_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)} MB limit`,
    };
  }

  return { valid: true };
}

export { UPLOAD_CONSTRAINTS, type AcceptedMimeType };
