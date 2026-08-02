import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { Container } from "@/components/layouts/container";
import { ApplyButton } from "@/features/careers/components/apply-button";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { buildJobPostingJsonLd } from "@/features/careers/lib/careers";
import type { EmploymentType } from "@/constants/employment-type";
import { ROUTES } from "@/constants/routes";
import {
  formatSalaryRange,
  getEmploymentTypeLabel,
} from "@/features/jobs/lib/job-labels";
import { env } from "@/lib/env";
import { getPublishedJobBySlug } from "@/services/jobs";

type JobDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    return {
      title: "Role not found",
    };
  }

  const description =
    job.description.length > 160
      ? `${job.description.slice(0, 157)}…`
      : job.description;
  const url = `${env.appUrl}/careers/${job.slug}`;

  return {
    title: job.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${job.title} | HireFlow AI`,
      description,
      url,
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const salary = formatSalaryRange(job);
  const jsonLd = buildJobPostingJsonLd({
    title: job.title,
    description: job.description,
    slug: job.slug,
    location: job.location,
    employmentType: job.employmentType,
    datePosted: job.publishedAt,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    appUrl: env.appUrl,
  });

  return (
    <PublicSiteShell active="careers">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-10">
            <div className="space-y-6">
              <Link
                href={ROUTES.careers}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                All open roles
              </Link>

              <header className="space-y-4">
                <p className="text-sm font-medium text-primary">
                  {job.department ?? "General"}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {job.title}
                </h1>
                <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <li className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {job.location ?? "Location TBD"}
                  </li>
                  <li className="rounded-md border border-border bg-card px-2.5 py-1">
                    {getEmploymentTypeLabel(
                      job.employmentType as EmploymentType,
                    )}
                  </li>
                  {job.experience ? (
                    <li className="rounded-md border border-border bg-card px-2.5 py-1">
                      {job.experience}
                    </li>
                  ) : null}
                  {salary ? (
                    <li className="rounded-md border border-border bg-card px-2.5 py-1">
                      {salary}
                    </li>
                  ) : null}
                </ul>
              </header>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ApplyButton jobSlug={job.slug} />
                <p className="text-sm text-muted-foreground">
                  Takes a few minutes — CV upload comes later.
                </p>
              </div>
            </div>

            <section className="space-y-3" aria-labelledby="job-description">
              <h2
                id="job-description"
                className="text-lg font-semibold tracking-tight"
              >
                About the role
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                {job.description}
              </p>
            </section>

            {job.requirements ? (
              <section
                className="space-y-3"
                aria-labelledby="job-requirements"
              >
                <h2
                  id="job-requirements"
                  className="text-lg font-semibold tracking-tight"
                >
                  Requirements
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  {job.requirements}
                </p>
              </section>
            ) : null}

            <section
              id="apply"
              className="rounded-xl border border-border bg-card p-5 sm:p-6"
              aria-labelledby="apply-heading"
            >
              <h2
                id="apply-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Ready to apply?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Share your background, education, and skills. CV upload will be
                available in a later update.
              </p>
              <div className="mt-5">
                <ApplyButton jobSlug={job.slug} />
              </div>
            </section>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
