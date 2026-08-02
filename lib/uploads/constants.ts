export const UPLOAD_CONSTRAINTS = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  acceptedMimeTypes: ["application/pdf"] as const,
  acceptedExtensions: [".pdf"] as const,
  storageBucket: "resumes",
} as const;

export type AcceptedMimeType =
  (typeof UPLOAD_CONSTRAINTS.acceptedMimeTypes)[number];
