import { google } from "@ai-sdk/google";

/**
 * Gemini model factory.
 * Business prompts and generation flows belong in a later phase.
 */
export function createGeminiModel(
  modelId: string = "gemini-2.0-flash",
) {
  return google(modelId);
}

export const aiModels = {
  default: "gemini-2.0-flash",
  flash: "gemini-2.0-flash",
  pro: "gemini-2.0-pro",
} as const;

export type AiModelId = (typeof aiModels)[keyof typeof aiModels];
