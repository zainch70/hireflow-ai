import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import {
  EMPLOYMENT_TYPE_LABELS,
  type EmploymentType,
} from "@/constants/employment-type";

export {
  JOB_STATUS_LABELS,
  getJobStatusLabel,
} from "@/constants/job-status";

export function getEmploymentTypeLabel(type: EmploymentType): string {
  return EMPLOYMENT_TYPE_LABELS[type];
}

export function formatSalaryRange(input: {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
}): string | null {
  const currency = input.salaryCurrency ?? "USD";
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  if (input.salaryMin != null && input.salaryMax != null) {
    return `${format(input.salaryMin)} – ${format(input.salaryMax)}`;
  }

  if (input.salaryMin != null) {
    return `From ${format(input.salaryMin)}`;
  }

  if (input.salaryMax != null) {
    return `Up to ${format(input.salaryMax)}`;
  }

  return null;
}

export function canPublish(status: JobStatus): boolean {
  return status === JOB_STATUS.DRAFT || status === JOB_STATUS.CLOSED;
}

export function canUnpublish(status: JobStatus): boolean {
  return status === JOB_STATUS.PUBLISHED;
}

export function canClose(status: JobStatus): boolean {
  return status === JOB_STATUS.PUBLISHED || status === JOB_STATUS.DRAFT;
}
