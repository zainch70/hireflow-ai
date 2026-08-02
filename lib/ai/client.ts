import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Preferred shortlisting / general Gemini models (tried in order on quota errors).
 * Different model IDs often have separate free-tier quotas.
 */
export const GEMINI_MODEL_FALLBACKS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
] as const;

export const aiModels = {
  default: GEMINI_MODEL_FALLBACKS[0],
  flash: "gemini-2.5-flash",
  flashLite: "gemini-2.5-flash-lite",
  legacyFlash: "gemini-2.0-flash",
  pro: "gemini-2.5-pro",
} as const;

export type AiModelId = (typeof aiModels)[keyof typeof aiModels] | string;

/** Unique API keys from env (primary + optional pool). */
export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const primary = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (primary) {
    keys.push(primary);
  }

  const pool = process.env.GEMINI_API_KEYS?.split(",") ?? [];
  for (const raw of pool) {
    const key = raw.trim();
    if (key && !keys.includes(key)) {
      keys.push(key);
    }
  }

  return keys;
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKeys().length > 0;
}

/**
 * Create a Gemini language model, optionally with an explicit API key
 * (needed for key rotation — default `google()` only reads the primary env var).
 */
export function createGeminiModel(
  modelId: string = aiModels.default,
  apiKey?: string,
) {
  if (apiKey) {
    const provider = createGoogleGenerativeAI({ apiKey });
    return provider(modelId);
  }

  return createGoogleGenerativeAI()(modelId);
}

export function isGeminiQuotaOrRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : "status" in error && typeof error.status === "number"
        ? error.status
        : undefined;

  if (statusCode === 429) {
    return true;
  }

  return (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests") ||
    message.includes("exceeded your current quota")
  );
}

export type GeminiAttempt = {
  apiKey: string;
  modelId: string;
  keyIndex: number;
};

/** Build key × model attempts (keys outer, models inner). */
export function buildGeminiAttempts(
  modelIds: readonly string[] = GEMINI_MODEL_FALLBACKS,
): GeminiAttempt[] {
  const keys = getGeminiApiKeys();
  const attempts: GeminiAttempt[] = [];

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const apiKey = keys[keyIndex]!;
    for (const modelId of modelIds) {
      attempts.push({ apiKey, modelId, keyIndex });
    }
  }

  return attempts;
}
