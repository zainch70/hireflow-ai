export const EMPLOYMENT_STATUSES = {
  EMPLOYED: "employed",
  UNEMPLOYED: "unemployed",
  FREELANCE: "freelance",
  STUDENT: "student",
  OTHER: "other",
} as const;

export type EmploymentStatus =
  (typeof EMPLOYMENT_STATUSES)[keyof typeof EMPLOYMENT_STATUSES];

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: "Currently employed",
  unemployed: "Not currently employed",
  freelance: "Freelance / contract",
  student: "Student",
  other: "Other",
};
