import Link from "next/link";
import { BriefcaseBusiness, LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ROUTES } from "@/constants/routes";
import { JOB_STATUS } from "@/constants/job-status";
import { listJobs } from "@/services/jobs";
import { getJobStatusLabel } from "@/features/jobs/lib/job-labels";

export default async function HrHomePage() {
  const jobs = await listJobs();
  const published = jobs.filter((job) => job.status === JOB_STATUS.PUBLISHED);
  const drafts = jobs.filter((job) => job.status === JOB_STATUS.DRAFT);
  const closed = jobs.filter((job) => job.status === JOB_STATUS.CLOSED);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Track openings at a glance. Manage full details from Jobs."
        actions={
          <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
            Create job
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={published.length} />
        <StatCard label="Drafts" value={drafts.length} />
        <StatCard label="Closed" value={closed.length} />
      </div>

      {jobs.length === 0 ? (
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
          <ul className="divide-y divide-border">
            {jobs.slice(0, 5).map((job) => (
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
                    {getJobStatusLabel(job.status)}
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
        </SurfaceCard>
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
