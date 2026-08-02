export const JOB_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
  ARCHIVED: "archived",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  archived: "Archived",
};

export function getJobStatusLabel(status: JobStatus | string): string {
  return (
    JOB_STATUS_LABELS[status as JobStatus] ?? status.replaceAll("_", " ")
  );
}
