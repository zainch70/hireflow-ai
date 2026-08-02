import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { JobForm } from "@/features/jobs/components/job-form";
import { JobStatusBadge } from "@/features/jobs/components/job-status-badge";
import { JobRowActions } from "@/features/jobs/components/job-row-actions";
import { getJobById } from "@/services/jobs";
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Edit job"
        description="Update details or change publishing status from the actions menu."
        actions={
          <div className="flex items-center gap-2">
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
    </div>
  );
}
