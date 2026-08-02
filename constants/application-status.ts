export const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFERED: "offered",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
