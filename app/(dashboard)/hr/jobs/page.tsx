import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { ROUTES } from "@/constants/routes";
import { JobsTable } from "@/features/jobs/components/jobs-table";
import { listJobs } from "@/services/jobs";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage job openings",
};

export default async function JobsPage() {
  const jobs = await listJobs();

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
