import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { JobForm } from "@/features/jobs/components/job-form";

export const metadata: Metadata = {
  title: "Create job",
  description: "Create a new job opening",
};

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Create job"
        description="New openings start as drafts. Publish when you’re ready to hire."
      />

      <SurfaceCard>
        <JobForm mode="create" />
      </SurfaceCard>
    </div>
  );
}
