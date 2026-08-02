import { z } from "zod";

export const AI_SHORTLIST_PROMPT_VERSION = "shortlist-v3";

export const AI_RECOMMENDATIONS = [
  "strong_match",
  "good_match",
  "partial_match",
  "poor_match",
] as const;

export type AiRecommendation = (typeof AI_RECOMMENDATIONS)[number];

export const aiShortlistResultSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Overall recruiter fit 0–100 from evidenced must-haves, not keyword overlap",
    ),
  recommendation: z
    .enum(AI_RECOMMENDATIONS)
    .describe(
      "Band matching score: strong_match 85–100, good_match 70–84, partial_match 45–69, poor_match 0–44",
    ),
  matchingSkills: z
    .array(z.string().min(1).max(80))
    .max(20)
    .describe(
      "Job-relevant capabilities clearly supported by application/CV evidence",
    ),
  missingSkills: z
    .array(z.string().min(1).max(80))
    .max(20)
    .describe(
      "Important job must-haves or requirements not evidenced in the materials",
    ),
  strengths: z
    .array(z.string().min(1).max(240))
    .min(1)
    .max(8)
    .describe("Evidence-tied strengths a recruiter would cite for this role"),
  concerns: z
    .array(z.string().min(1).max(240))
    .max(8)
    .describe(
      "Evidence gaps, conflicts, seniority mismatch, or risks — include thin CV if applicable",
    ),
  summary: z
    .string()
    .min(40)
    .max(1200)
    .describe(
      "3–6 sentence HR summary: fit, key evidence, main gaps, interview stance",
    ),
});

export type AiShortlistResult = z.infer<typeof aiShortlistResultSchema>;

export const AI_RECOMMENDATION_LABELS: Record<AiRecommendation, string> = {
  strong_match: "Strong match",
  good_match: "Good match",
  partial_match: "Partial match",
  poor_match: "Poor match",
};
