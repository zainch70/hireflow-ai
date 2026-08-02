import Link from "next/link";
import { BriefcaseBusiness, Inbox, LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ROUTES, hrApplicationPath } from "@/constants/routes";
import { getJobStatusLabel } from "@/features/jobs/lib/job-labels";
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Published jobs" value={stats.publishedJobs} />
        <StatCard label="Drafts" value={stats.draftJobs} />
        <StatCard label="Closed" value={stats.closedJobs} />
        <StatCard label="Applications" value={stats.applicationsTotal} />
        <StatCard label="Submitted" value={stats.submittedApplications} />
        <StatCard label="Shortlisted" value={stats.shortlistedApplications} />
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
              <ul className="divide-y divide-border">
                {stats.recentApplications.map((application) => (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
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
                        {application.createdAt.toLocaleDateString()}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
