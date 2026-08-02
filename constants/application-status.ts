export const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  ON_HOLD: "on_hold",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFERED: "offered",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

/** Display labels for HR UI (Select = shortlisted). */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  on_hold: "On hold",
  shortlisted: "Selected",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** HR action button labels for transitions into each status. */
export const APPLICATION_STATUS_ACTION_LABELS: Partial<
  Record<ApplicationStatus, string>
> = {
  under_review: "Review",
  on_hold: "Hold",
  shortlisted: "Select",
  interview: "Interview",
  offered: "Offer",
  hired: "Hire",
  rejected: "Reject",
};

export function getApplicationStatusLabel(status: ApplicationStatus | string) {
  return (
    APPLICATION_STATUS_LABELS[status as ApplicationStatus] ??
    status.replaceAll("_", " ")
  );
}

export function getApplicationStatusActionLabel(
  status: ApplicationStatus,
): string {
  return APPLICATION_STATUS_ACTION_LABELS[status] ?? getApplicationStatusLabel(status);
}
