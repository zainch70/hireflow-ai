import {
  APPLICATION_STATUS,
  getApplicationStatusLabel,
} from "@/constants/application-status";
import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import {
  countApplicationsGroupedByStatus,
  countApplicationsOverTime,
  listRecentApplicationsForHr,
  type HrApplicationListItem,
} from "@/services/applications";
import {
  countAiRecommendations,
  type AiRecommendationCount,
} from "@/services/ai";
import {
  countJobsGroupedByStatus,
  countJobsPublishedOverTime,
  listRecentJobs,
  type Job,
} from "@/services/jobs";

export type StatusCount = {
  status: string;
  label: string;
  count: number;
};

export type HrDashboardStats = {
  jobsTotal: number;
  applicationsTotal: number;
  aiScreenedTotal: number;
  jobsByStatus: StatusCount[];
  applicationsByStatus: StatusCount[];
  applicationsOverTime: Array<{ date: string; count: number }>;
  jobsPublishedOverTime: Array<{ date: string; count: number }>;
  aiRecommendations: AiRecommendationCount[];
  recentJobs: Job[];
  recentApplications: HrApplicationListItem[];
  publishedJobs: number;
  draftJobs: number;
  closedJobs: number;
  submittedApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
};

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  archived: "Archived",
};

export async function getHrDashboardStats(): Promise<HrDashboardStats> {
  const [
    jobsByStatusRaw,
    applicationsByStatusRaw,
    applicationsOverTime,
    jobsPublishedOverTime,
    aiRecommendations,
    recentJobs,
    recentApplications,
  ] = await Promise.all([
    countJobsGroupedByStatus(),
    countApplicationsGroupedByStatus(),
    countApplicationsOverTime(30),
    countJobsPublishedOverTime(30),
    countAiRecommendations(),
    listRecentJobs(5),
    listRecentApplicationsForHr(5),
  ]);

  const jobsByStatusMap = new Map(
    jobsByStatusRaw.map((row) => [row.status, row.count]),
  );
  const applicationsByStatusMap = new Map(
    applicationsByStatusRaw.map((row) => [row.status, row.count]),
  );

  const jobsByStatus: StatusCount[] = (
    Object.values(JOB_STATUS) as JobStatus[]
  ).map((status) => ({
    status,
    label: JOB_STATUS_LABELS[status],
    count: jobsByStatusMap.get(status) ?? 0,
  }));

  const applicationsByStatus: StatusCount[] = Object.values(
    APPLICATION_STATUS,
  ).map((status) => ({
    status,
    label: getApplicationStatusLabel(status),
    count: applicationsByStatusMap.get(status) ?? 0,
  }));

  const jobsTotal = jobsByStatus.reduce((sum, row) => sum + row.count, 0);
  const applicationsTotal = applicationsByStatus.reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const aiScreenedTotal = aiRecommendations.reduce(
    (sum, row) => sum + row.count,
    0,
  );

  return {
    jobsTotal,
    applicationsTotal,
    aiScreenedTotal,
    jobsByStatus,
    applicationsByStatus,
    applicationsOverTime,
    jobsPublishedOverTime,
    aiRecommendations,
    recentJobs,
    recentApplications,
    publishedJobs: jobsByStatusMap.get(JOB_STATUS.PUBLISHED) ?? 0,
    draftJobs: jobsByStatusMap.get(JOB_STATUS.DRAFT) ?? 0,
    closedJobs: jobsByStatusMap.get(JOB_STATUS.CLOSED) ?? 0,
    submittedApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.SUBMITTED) ?? 0,
    shortlistedApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.SHORTLISTED) ?? 0,
    rejectedApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.REJECTED) ?? 0,
  };
}
