import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { toIsoString } from "@/lib/dates";
import {
  APPLICATION_STATUS,
  getApplicationStatusLabel,
} from "@/constants/application-status";
import {
  JOB_STATUS,
  JOB_STATUS_LABELS,
  type JobStatus,
} from "@/constants/job-status";
import {
  countApplicationsByJob,
  countApplicationsGroupedByStatus,
  countApplicationsOverTime,
  listRecentApplicationsForHr,
  type ApplicationsByJobCount,
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
  applicationsByJob: ApplicationsByJobCount[];
  applicationsOverTime: Array<{ date: string; count: number }>;
  jobsPublishedOverTime: Array<{ date: string; count: number }>;
  aiRecommendations: AiRecommendationCount[];
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    department: string | null;
    updatedAt: string;
  }>;
  recentApplications: HrApplicationListItem[];
  publishedJobs: number;
  draftJobs: number;
  closedJobs: number;
  submittedApplications: number;
  underReviewApplications: number;
  shortlistedApplications: number;
  interviewApplications: number;
  rejectedApplications: number;
  hiredApplications: number;
};

async function loadHrDashboardStats(): Promise<HrDashboardStats> {
  const [
    jobsByStatusRaw,
    applicationsByStatusRaw,
    applicationsByJob,
    applicationsOverTime,
    jobsPublishedOverTime,
    aiRecommendations,
    recentJobsRaw,
    recentApplications,
  ] = await Promise.all([
    countJobsGroupedByStatus(),
    countApplicationsGroupedByStatus(),
    countApplicationsByJob(8),
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

  const recentJobs = recentJobsRaw.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    department: job.department,
    updatedAt: toIsoString(job.updatedAt),
  }));

  return {
    jobsTotal,
    applicationsTotal,
    aiScreenedTotal,
    jobsByStatus,
    applicationsByStatus,
    applicationsByJob,
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
    underReviewApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.UNDER_REVIEW) ?? 0,
    shortlistedApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.SHORTLISTED) ?? 0,
    interviewApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.INTERVIEW) ?? 0,
    rejectedApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.REJECTED) ?? 0,
    hiredApplications:
      applicationsByStatusMap.get(APPLICATION_STATUS.HIRED) ?? 0,
  };
}

/** Cached dashboard payload — invalidated via CACHE_TAGS on mutations. */
export const getHrDashboardStats = unstable_cache(
  loadHrDashboardStats,
  ["hr-dashboard-stats"],
  {
    revalidate: 30,
    tags: [
      CACHE_TAGS.dashboard,
      CACHE_TAGS.jobs,
      CACHE_TAGS.applications,
      CACHE_TAGS.ai,
    ],
  },
);
