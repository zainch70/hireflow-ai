import { applications } from "@/db/schema";
import type { ApplicationStatus } from "@/constants/application-status";
import type { HrApplicationsSearchParams } from "@/schemas/applications";

export type Application = typeof applications.$inferSelect;

export type HrApplicationListItem = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  status: Application["status"];
  resumePath: string | null;
  resumeFileName: string | null;
  yearsOfExperience: number | null;
  aiScore: number | null;
  createdAt: Date;
  jobTitle: string;
  jobSlug: string;
};

/** Plain serializable row for client DataTables. */
export type HrApplicationTableRow = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  status: Application["status"];
  resumePath: string | null;
  resumeFileName: string | null;
  yearsOfExperience: number | null;
  aiScore: number | null;
  createdAt: string;
  jobTitle: string;
  jobSlug: string;
};

export type HrApplicationListResult = {
  items: HrApplicationListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type HrApplicationFilterOptions = {
  jobs: Array<{ id: string; title: string }>;
};

export type HrApplicationsFilters = HrApplicationsSearchParams;

export type HrApplicationNote = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string | null;
};

export type HrApplicationStatusEvent = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  createdAt: Date;
  changedByName: string | null;
};

export type HrApplicationEducation = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  educationLevel: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  grade: string | null;
};

export type HrApplicationSkill = {
  id: string;
  name: string;
  proficiency: string | null;
};

export type HrApplicationDetail = {
  application: Application;
  jobTitle: string;
  jobSlug: string;
  education: HrApplicationEducation[];
  skills: HrApplicationSkill[];
  notes: HrApplicationNote[];
  statusHistory: HrApplicationStatusEvent[];
  allowedTransitions: ApplicationStatus[];
};
