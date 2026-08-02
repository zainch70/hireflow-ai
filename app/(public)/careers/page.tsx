import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { Container } from "@/components/layouts/container";
import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { CareersFilters } from "@/features/careers/components/careers-filters";
import { JobCard } from "@/features/careers/components/job-card";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { parseCareersSearchParams } from "@/features/careers/lib/careers";
import { env } from "@/lib/env";
import {
  getPublishedJobFilterOptions,
  listPublishedJobs,
} from "@/services/jobs";

/** Careers listing hits the DB; avoid prerender at build time. */
export const dynamic = "force-dynamic";

type CareersPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    department?: string;
    location?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore open roles at HireFlow AI. Browse published positions by team, location, and employment type.",
  alternates: {
    canonical: `${env.appUrl}/careers`,
  },
  openGraph: {
    title: "Careers | HireFlow AI",
    description:
      "Explore open roles at HireFlow AI across engineering, people, and more.",
    url: `${env.appUrl}/careers`,
    type: "website",
  },
};

export default async function CareersPage({ searchParams }: CareersPageProps) {
  const params = await searchParams;
  const { values, filters } = parseCareersSearchParams(params);

  const [jobs, filterOptions] = await Promise.all([
    listPublishedJobs(filters),
    getPublishedJobFilterOptions(),
  ]);

  const hasFilters = Boolean(
    values.q || values.type || values.department || values.location,
  );

  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="space-y-8 py-10 sm:py-14">
          <PageHeader
            title="Careers"
            description="Find a role that fits. Only published openings appear here."
          />

          <CareersFilters
            values={values}
            departments={filterOptions.departments}
            locations={filterOptions.locations}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {jobs.length === 0
                ? "No roles match"
                : `${jobs.length} open role${jobs.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
              title={hasFilters ? "No matching roles" : "No open roles yet"}
              description={
                hasFilters
                  ? "Try a different search or clear your filters."
                  : "Check back soon — new openings will show up here when published."
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
    </PublicSiteShell>
  );
}
