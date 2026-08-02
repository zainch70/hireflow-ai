import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { careersJobPath, ROUTES } from "@/constants/routes";
import { getJobBySlug } from "@/services/jobs";

type ApplySuccessPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Application submitted",
  robots: { index: false, follow: false },
};

export default async function ApplySuccessPage({
  params,
}: ApplySuccessPageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Application submitted
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Thanks for applying to <span className="font-medium text-foreground">{job.title}</span>.
            Our team will review your application and follow up by email.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={careersJobPath(job.slug)} variant="outline">
              Back to role
            </ButtonLink>
            <ButtonLink href={ROUTES.careers}>Browse more roles</ButtonLink>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
