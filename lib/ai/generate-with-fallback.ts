import { generateObject, type FlexibleSchema } from "ai";

import {
  buildGeminiAttempts,
  createGeminiModel,
  isGeminiQuotaOrRateLimitError,
  type GeminiAttempt,
} from "@/lib/ai/client";

export type GenerateObjectWithFallbackParams<SCHEMA> = {
  schema: FlexibleSchema<SCHEMA>;
  schemaName?: string;
  schemaDescription?: string;
  system: string;
  prompt: string;
  modelIds?: readonly string[];
};

export type GenerateObjectWithFallbackResult<SCHEMA> = {
  object: SCHEMA;
  modelId: string;
  keyIndex: number;
  usage: {
    inputTokens: number | undefined;
    outputTokens: number | undefined;
  };
  attempts: number;
};

/**
 * Try Gemini models (and API keys) until one succeeds.
 * Skips to the next attempt on quota / rate-limit errors only.
 */
export async function generateObjectWithGeminiFallback<SCHEMA>(
  params: GenerateObjectWithFallbackParams<SCHEMA>,
): Promise<GenerateObjectWithFallbackResult<SCHEMA>> {
  const attempts = buildGeminiAttempts(params.modelIds);

  if (attempts.length === 0) {
    throw new Error("No Gemini API keys configured");
  }

  let lastError: unknown;

  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i] as GeminiAttempt;

    try {
      const result = await generateObject({
        model: createGeminiModel(attempt.modelId, attempt.apiKey),
        schema: params.schema,
        schemaName: params.schemaName,
        schemaDescription: params.schemaDescription,
        system: params.system,
        prompt: params.prompt,
        maxRetries: 0,
      });

      return {
        object: result.object as SCHEMA,
        modelId: attempt.modelId,
        keyIndex: attempt.keyIndex,
        usage: {
          inputTokens: result.usage?.inputTokens,
          outputTokens: result.usage?.outputTokens,
        },
        attempts: i + 1,
      };
    } catch (error) {
      lastError = error;
      console.warn(
        `[ai] attempt ${i + 1}/${attempts.length} failed model=${attempt.modelId} key#${attempt.keyIndex + 1}`,
        error instanceof Error ? error.message : error,
      );

      if (!isGeminiQuotaOrRateLimitError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini model/key attempts failed");
}
