export const SKILL_CATEGORIES = {
  TECHNICAL: "technical",
  SOFTWARE: "software",
  LANGUAGES: "languages",
  AI_TOOLS: "ai_tools",
  SOFT_SKILLS: "soft_skills",
  OTHER: "other",
} as const;

export type SkillCategory =
  (typeof SKILL_CATEGORIES)[keyof typeof SKILL_CATEGORIES];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: "Technical skills",
  software: "Software & platforms",
  languages: "Programming languages",
  ai_tools: "AI-related skills",
  soft_skills: "Soft skills",
  other: "Other relevant skills",
};

export function getSkillCategoryLabel(category: string | null | undefined) {
  if (!category) {
    return "Uncategorized";
  }
  return (
    SKILL_CATEGORY_LABELS[category as SkillCategory] ??
    category.replaceAll("_", " ")
  );
}
