import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import { ApplicationsTable } from "@/features/applications/components/applications-table";
import {
  listApplicationsForHr,
  toHrApplicationTableRows,
} from "@/services/applications";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review candidate applications",
};

export default async function HrApplicationsPage() {
  const applications = toHrApplicationTableRows(await listApplicationsForHr());

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        description="Candidate submissions for your published roles. Resumes open via short-lived signed links."
      />

      <ApplicationsTable applications={applications} />
    </div>
  );
}
