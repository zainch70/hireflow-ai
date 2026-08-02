/**
 * AI domain service — shortlisting orchestration and analytics.
 * Prompts/schemas live in `lib/ai/`; this barrel keeps import paths stable.
 */

export type { AiAnalysis, AiShortlistView } from "@/services/ai/view";
export { getLatestAiAnalysis, toAiShortlistView } from "@/services/ai/view";
export { runAiShortlisting } from "@/services/ai/shortlist";
export type { AiRecommendationCount } from "@/services/ai/stats";
export { countAiRecommendations } from "@/services/ai/stats";
