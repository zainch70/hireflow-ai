import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { ROUTES } from "@/constants/routes";
import { JobsTable, type JobTableRow } from "@/features/jobs/components/jobs-table";
import { listJobs } from "@/services/jobs";
import type { JobStatus } from "@/constants/job-status";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage job openings",
};

function toJobTableRows(
  jobs: Awaited<ReturnType<typeof listJobs>>,
): JobTableRow[] {
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    experience: job.experience,
    employmentType: job.employmentType,
    status: job.status as JobStatus,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    updatedAt: job.updatedAt.toISOString(),
  }));
}

export default async function JobsPage() {
  const jobs = toJobTableRows(await listJobs());

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jobs"
        description="Create and manage openings across the hiring pipeline."
        actions={
          <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
            Create job
          </ButtonLink>
        }
      />

      <JobsTable jobs={jobs} />
    </div>
  );
}
