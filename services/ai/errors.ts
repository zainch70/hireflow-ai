import { AppError } from "@/lib/errors/app-error";

export function aiShortlistUnavailableError() {
  return new AppError(
    "AI shortlisting is unavailable. Set GOOGLE_GENERATIVE_AI_API_KEY (and optional GEMINI_API_KEYS for rotation).",
    {
      code: "AI_SHORTLIST_UNAVAILABLE",
      statusCode: 503,
    },
  );
}

export function aiShortlistFailedError(error?: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "AI shortlisting failed. Try again.";

  return new AppError(message, {
    code: "AI_SHORTLIST_FAILED",
    statusCode: 502,
    cause: error,
  });
}
