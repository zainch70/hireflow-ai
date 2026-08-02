import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layouts/container";
import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { careersJobPath, ROUTES } from "@/constants/routes";
import { env } from "@/lib/env";
import { getPublishedJobBySlug } from "@/services/jobs";

type ApplyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    return { title: "Apply" };
  }

  return {
    title: `Apply · ${job.title}`,
    description: `Submit your application for ${job.title} at HireFlow AI.`,
    alternates: {
      canonical: `${env.appUrl}${careersJobPath(job.slug)}/apply`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="py-8 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <Link
                href={careersJobPath(job.slug)}
                className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back to {job.title}
              </Link>
              <PageHeader
                title={`Apply for ${job.title}`}
                description="Complete the form below. CV upload will be available in a later step — you can still submit now."
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Applying via{" "}
                <Link
                  href={ROUTES.careers}
                  className="font-medium text-primary hover:underline"
                >
                  Careers
                </Link>
                {job.department ? ` · ${job.department}` : null}
                {job.location ? ` · ${job.location}` : null}
              </p>
            </div>

            <SurfaceCard contentClassName="p-4 pt-4 sm:p-6 sm:pt-6">
              <ApplicationForm jobSlug={job.slug} jobTitle={job.title} />
            </SurfaceCard>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
