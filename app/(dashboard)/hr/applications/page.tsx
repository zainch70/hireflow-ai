import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import { ApplicationsFilters } from "@/features/applications/components/applications-filters";
import { ApplicationsPagination } from "@/features/applications/components/applications-pagination";
import { ApplicationsTable } from "@/features/applications/components/applications-table";
import {
  hasActiveApplicationFilters,
  parseApplicationsSearchParams,
} from "@/features/applications/lib/applications-filters";
import {
  getHrApplicationFilterOptions,
  listApplicationsForHr,
  toHrApplicationTableRows,
} from "@/services/applications";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review candidate applications",
};

type HrApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HrApplicationsPage({
  searchParams,
}: HrApplicationsPageProps) {
  const params = await searchParams;
  const { values, filters } = parseApplicationsSearchParams(params);
  const hasFilters = hasActiveApplicationFilters(values);

  const [result, filterOptions] = await Promise.all([
    listApplicationsForHr(filters),
    getHrApplicationFilterOptions(),
  ]);

  const applications = toHrApplicationTableRows(result.items);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        description="Candidate submissions for your published roles. Filter on the server by name, email, job, status, AI score, experience, and date."
      />

      <ApplicationsFilters values={values} jobs={filterOptions.jobs} />

      <div className="space-y-4">
        <ApplicationsTable
          applications={applications}
          emptyTitle={hasFilters ? "No matching applications" : "No applications yet"}
          emptyDescription={
            hasFilters
              ? "Try clearing filters or broadening the score, experience, or date range."
              : "When candidates apply from Careers, they’ll show up here."
          }
        />

        {result.total > 0 ? (
          <ApplicationsPagination
            values={values}
            total={result.total}
            pageCount={result.pageCount}
          />
        ) : null}
      </div>
    </div>
  );
}
