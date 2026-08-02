import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { Badge } from "@/components/ui/badge";
import { type ApplicationStatus } from "@/constants/application-status";
import { ROUTES } from "@/constants/routes";
import { ApplicationNotesPanel } from "@/features/applications/components/application-notes-panel";
import { ApplicationStatusActions } from "@/features/applications/components/application-status-actions";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { ApplicationStatusHistory } from "@/features/applications/components/application-status-history";
import { ResumeDownloadButton } from "@/features/applications/components/resume-download-button";
import { getApplicationDetailForHr } from "@/services/applications";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { applicationId } = await params;
  const detail = await getApplicationDetailForHr(applicationId);

  if (!detail) {
    return { title: "Application" };
  }

  return {
    title: detail.application.fullName,
    description: `Review application for ${detail.jobTitle}`,
  };
}

export default async function HrApplicationDetailPage({ params }: PageProps) {
  const { applicationId } = await params;
  const detail = await getApplicationDetailForHr(applicationId);

  if (!detail) {
    notFound();
  }

  const { application } = detail;
  const status = application.status as ApplicationStatus;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href={ROUTES.dashboard.applications}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to applications
        </Link>

        <PageHeader
          title={application.fullName}
          description={`${detail.jobTitle} · ${application.email}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <ApplicationStatusBadge status={status} />
              {application.resumePath ? (
                <ResumeDownloadButton
                  applicationId={application.id}
                  fileName={application.resumeFileName}
                />
              ) : null}
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <SurfaceCard title="Candidate" description="Contact and profile snapshot.">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Email" value={application.email} />
              <DetailItem label="Phone" value={application.phone} />
              <DetailItem label="Current title" value={application.currentTitle} />
              <DetailItem
                label="Years of experience"
                value={
                  application.yearsOfExperience != null
                    ? String(application.yearsOfExperience)
                    : null
                }
              />
              <DetailItem
                label="LinkedIn"
                value={application.linkedinUrl}
                href={application.linkedinUrl}
              />
              <DetailItem
                label="Portfolio"
                value={application.portfolioUrl}
                href={application.portfolioUrl}
              />
            </dl>
          </SurfaceCard>

          <SurfaceCard title="Experience" description="Professional background.">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {application.workExperience || "—"}
            </p>
          </SurfaceCard>

          {application.coverLetter ? (
            <SurfaceCard title="Additional notes" description="Candidate response.">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {application.coverLetter}
              </p>
            </SurfaceCard>
          ) : null}

          <SurfaceCard title="Education">
            {detail.education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education listed.</p>
            ) : (
              <ul className="space-y-3">
                {detail.education.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="font-medium">{entry.institution}</p>
                    <p className="text-muted-foreground">
                      {[entry.degree, entry.fieldOfStudy]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                      {entry.grade ? ` · ${entry.grade}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>

          <SurfaceCard title="Skills">
            {detail.skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {detail.skills.map((skill) => (
                  <li key={skill.id}>
                    <Badge variant="secondary" className="font-normal">
                      {skill.name}
                      {skill.proficiency ? ` · ${skill.proficiency}` : ""}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard
            title="Pipeline"
            description="Update status and leave an optional note."
          >
            <ApplicationStatusActions
              applicationId={application.id}
              currentStatus={status}
              allowedTransitions={detail.allowedTransitions}
            />
          </SurfaceCard>

          <SurfaceCard title="Status history">
            <ApplicationStatusHistory events={detail.statusHistory} />
          </SurfaceCard>

          <SurfaceCard
            title="Internal notes"
            description="Visible to HR only."
          >
            <ApplicationNotesPanel
              applicationId={application.id}
              notes={detail.notes}
            />
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}
