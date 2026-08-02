export const EMPLOYMENT_TYPES = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
} as const;

export type EmploymentType =
  (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};
