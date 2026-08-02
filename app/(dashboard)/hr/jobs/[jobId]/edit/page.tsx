import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layouts/page-header";
import { ButtonLink } from "@/components/layouts/button-link";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { JobForm } from "@/features/jobs/components/job-form";
import { JobShortlistingCriteriaForm } from "@/features/jobs/components/job-shortlisting-criteria-form";
import { JobStatusBadge } from "@/features/jobs/components/job-status-badge";
import { JobRowActions } from "@/features/jobs/components/job-row-actions";
import { ROUTES } from "@/constants/routes";
import {
  getJobById,
  listJobShortlistingCriteria,
} from "@/services/jobs";
import type { EmploymentType } from "@/constants/employment-type";

type EditJobPageProps = {
  params: Promise<{ jobId: string }>;
};

export async function generateMetadata({
  params,
}: EditJobPageProps): Promise<Metadata> {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  return {
    title: job ? `Edit · ${job.title}` : "Edit job",
  };
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  if (!job) {
    notFound();
  }

  const criteria = await listJobShortlistingCriteria(job.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Edit job"
        description="Update details, publishing status, and AI shortlisting criteria."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink
              href={`${ROUTES.dashboard.applications}?jobId=${job.id}`}
              variant="outline"
              size="sm"
            >
              View applications
            </ButtonLink>
            <JobStatusBadge status={job.status} />
            <JobRowActions jobId={job.id} status={job.status} />
          </div>
        }
      />

      <SurfaceCard>
        <JobForm
          mode="edit"
          jobId={job.id}
          defaultValues={{
            title: job.title,
            department: job.department ?? "",
            employmentType: job.employmentType as EmploymentType,
            experience: job.experience ?? "",
            location: job.location ?? "",
            description: job.description,
            requirements: job.requirements ?? "",
            salaryMin: job.salaryMin ?? undefined,
            salaryMax: job.salaryMax ?? undefined,
            salaryCurrency: job.salaryCurrency ?? "USD",
          }}
        />
      </SurfaceCard>

      <SurfaceCard
        title="AI shortlisting criteria"
        description="Must-haves and preferences used when HR runs AI shortlisting on applicants for this role."
      >
        <JobShortlistingCriteriaForm
          jobId={job.id}
          initialCriteria={criteria}
        />
      </SurfaceCard>
    </div>
  );
}
