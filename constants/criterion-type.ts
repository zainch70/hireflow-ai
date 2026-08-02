export const CRITERION_TYPES = {
  SKILL: "skill",
  EXPERIENCE_YEARS: "experience_years",
  EDUCATION_LEVEL: "education_level",
  KEYWORD: "keyword",
  CUSTOM: "custom",
} as const;

export type CriterionType =
  (typeof CRITERION_TYPES)[keyof typeof CRITERION_TYPES];

export const CRITERION_TYPE_LABELS: Record<CriterionType, string> = {
  skill: "Skill",
  experience_years: "Minimum experience (years)",
  education_level: "Education level",
  keyword: "Keyword / preference",
  custom: "Custom instruction",
};

/** Short hints for HR when picking a criterion type. */
export const CRITERION_TYPE_HINTS: Record<CriterionType, string> = {
  skill: "Required or preferred technical skill (e.g. Next.js, Python).",
  experience_years: "Minimum years of relevant experience.",
  education_level: "Minimum or preferred education level.",
  keyword: "Location preference, notice period, on-site, or other keyword.",
  custom: "Free-form instruction for AI shortlisting.",
};
