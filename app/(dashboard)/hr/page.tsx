import Link from "next/link";
import { BriefcaseBusiness, Inbox, LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { MetricCard } from "@/components/layouts/metric-card";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ROUTES, hrApplicationPath } from "@/constants/routes";
import { getJobStatusLabel } from "@/features/jobs/lib/job-labels";
import { formatDate } from "@/lib/dates";
import { getHrDashboardStats } from "@/services/dashboard";
import type { JobStatus } from "@/constants/job-status";

export default async function HrHomePage() {
  const stats = await getHrDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Hiring pipeline at a glance. Dig into Jobs, Applications, or Statistics for detail."
        actions={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={ROUTES.dashboard.statistics} variant="outline">
              Statistics
            </ButtonLink>
            <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
              Create job
            </ButtonLink>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <MetricCard label="Published jobs" value={stats.publishedJobs} />
        <MetricCard label="Applications" value={stats.applicationsTotal} />
        <MetricCard label="AI shortlisted" value={stats.aiScreenedTotal} />
        <MetricCard label="Drafts" value={stats.draftJobs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="New" value={stats.submittedApplications} />
        <MetricCard label="Under review" value={stats.underReviewApplications} />
        <MetricCard label="Selected" value={stats.shortlistedApplications} />
        <MetricCard label="Interview" value={stats.interviewApplications} />
        <MetricCard label="Rejected" value={stats.rejectedApplications} />
        <MetricCard label="Hired" value={stats.hiredApplications} />
      </div>

      {stats.jobsTotal === 0 && stats.applicationsTotal === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="size-5" aria-hidden="true" />}
          title="No openings yet"
          description="Create a job to start building your hiring pipeline."
          action={
            <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
              Create job
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <SurfaceCard
            title="Applications by job"
            description="Open pipeline volume per opening."
            footer={
              <Link
                href={ROUTES.dashboard.applications}
                className="text-sm font-medium text-primary hover:underline"
              >
                View applications
              </Link>
            }
          >
            {stats.applicationsByJob.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.applicationsByJob.map((row) => (
                  <li
                    key={row.jobId}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`${ROUTES.dashboard.applications}?jobId=${row.jobId}`}
                      className="min-w-0 truncate font-medium hover:underline"
                    >
                      {row.jobTitle}
                    </Link>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="Recent jobs"
            description="Latest updates across your openings."
            footer={
              <Link
                href={ROUTES.dashboard.jobs}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all jobs
              </Link>
            }
          >
            {stats.recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`${ROUTES.dashboard.jobs}/${job.id}/edit`}
                        className="truncate font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {getJobStatusLabel(job.status as JobStatus)}
                        {job.department ? ` · ${job.department}` : ""}
                      </p>
                    </div>
                    <BriefcaseBusiness
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="Recent applications"
            description="Newest candidate submissions."
            className="lg:col-span-2"
            footer={
              <Link
                href={ROUTES.dashboard.applications}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all applications
              </Link>
            }
          >
            {stats.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <ul className="divide-y divide-border sm:columns-2 sm:gap-x-8">
                {stats.recentApplications.map((application) => (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 break-inside-avoid"
                  >
                    <div className="min-w-0">
                      <Link
                        href={hrApplicationPath(application.id)}
                        className="truncate font-medium hover:underline"
                      >
                        {application.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {application.jobTitle}
                        {" · "}
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <Inbox
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}
