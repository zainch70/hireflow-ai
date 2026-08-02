export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: "high_school",
  ASSOCIATE: "associate",
  BACHELOR: "bachelor",
  MASTER: "master",
  DOCTORATE: "doctorate",
  OTHER: "other",
} as const;

export type EducationLevel =
  (typeof EDUCATION_LEVELS)[keyof typeof EDUCATION_LEVELS];

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  high_school: "High school",
  associate: "Associate",
  bachelor: "Bachelor’s",
  master: "Master’s",
  doctorate: "Doctorate",
  other: "Other",
};
