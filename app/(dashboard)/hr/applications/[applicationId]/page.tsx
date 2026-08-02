import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS,
  type ApplicationStatus,
} from "@/constants/application-status";
import { EMPLOYMENT_STATUS_LABELS } from "@/constants/employment-status";
import { getSkillCategoryLabel } from "@/constants/skill-category";
import { ROUTES } from "@/constants/routes";
import { ApplicationArchiveButton } from "@/features/applications/components/application-archive-button";
import { ApplicationAssignPanel } from "@/features/applications/components/application-assign-panel";
import { ApplicationDeleteButton } from "@/features/applications/components/application-delete-button";
import { ApplicationNotesPanel } from "@/features/applications/components/application-notes-panel";
import { ApplicationStatusActions } from "@/features/applications/components/application-status-actions";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { ApplicationStatusHistory } from "@/features/applications/components/application-status-history";
import { AiShortlistPanel } from "@/features/applications/components/ai-shortlist-panel";
import { ResumeDownloadButton } from "@/features/applications/components/resume-download-button";
import { getApplicationDetailForHr } from "@/services/applications";
import { getLatestAiAnalysis } from "@/services/ai";
import { listHrTeamMembers } from "@/services/hr-team";

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
  const [detail, analysis, team] = await Promise.all([
    getApplicationDetailForHr(applicationId),
    getLatestAiAnalysis(applicationId),
    listHrTeamMembers(),
  ]);

  if (!detail) {
    notFound();
  }

  const { application } = detail;
  const status = application.status as ApplicationStatus;
  const canAccept = detail.allowedTransitions.includes(
    APPLICATION_STATUS.SHORTLISTED,
  );
  const canReject = detail.allowedTransitions.includes(
    APPLICATION_STATUS.REJECTED,
  );

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
              {application.archivedAt ? (
                <Badge variant="outline" className="font-normal">
                  Archived
                </Badge>
              ) : null}
              {application.resumePath ? (
                <ResumeDownloadButton
                  applicationId={application.id}
                  fileName={application.resumeFileName}
                />
              ) : null}
              <ApplicationArchiveButton
                applicationId={application.id}
                archivedAt={application.archivedAt}
              />
              <ApplicationDeleteButton
                applicationId={application.id}
                candidateName={application.fullName}
              />
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
              <DetailItem
                label="Current location"
                value={application.currentLocation}
              />
              <DetailItem label="Current title" value={application.currentTitle} />
              <DetailItem
                label="Current company"
                value={application.currentCompany}
              />
              <DetailItem
                label="Years of experience"
                value={
                  application.yearsOfExperience != null
                    ? String(application.yearsOfExperience)
                    : null
                }
              />
              <DetailItem
                label="Expected salary"
                value={application.expectedSalary}
              />
              <DetailItem label="Notice period" value={application.noticePeriod} />
              <DetailItem
                label="Employment status"
                value={
                  application.employmentStatus
                    ? (EMPLOYMENT_STATUS_LABELS[
                        application.employmentStatus as keyof typeof EMPLOYMENT_STATUS_LABELS
                      ] ?? application.employmentStatus)
                    : null
                }
              />
              <DetailItem
                label="Willing on-site"
                value={
                  application.willingOnsite == null
                    ? null
                    : application.willingOnsite
                      ? "Yes"
                      : "No"
                }
              />
              <DetailItem
                label="Available join date"
                value={application.availableJoinDate}
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
              <DetailItem
                label="GitHub"
                value={application.githubUrl}
                href={application.githubUrl}
              />
            </dl>
          </SurfaceCard>

          <SurfaceCard title="Experience" description="Professional background.">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {application.workExperience || "—"}
            </p>
          </SurfaceCard>

          <SurfaceCard
            title="Motivation & fit"
            description="Answers from the application form."
          >
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  Why interested in this position
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
                  {application.interestReason || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Why we should consider you
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
                  {application.whyConsider || "—"}
                </p>
              </div>
            </div>
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
                      {entry.endDate
                        ? ` · Graduated ${entry.endDate.slice(0, 4)}`
                        : entry.isCurrent
                          ? " · In progress"
                          : ""}
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
              <div className="space-y-4">
                {Object.entries(
                  detail.skills.reduce<
                    Record<string, typeof detail.skills>
                  >((groups, skill) => {
                    const key = skill.category ?? "other";
                    if (!groups[key]) {
                      groups[key] = [];
                    }
                    groups[key].push(skill);
                    return groups;
                  }, {}),
                ).map(([category, skills]) => (
                  <div key={category}>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {getSkillCategoryLabel(category)}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <li key={skill.id}>
                          <Badge variant="secondary" className="font-normal">
                            {skill.name}
                            {skill.proficiency ? ` · ${skill.proficiency}` : ""}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard
            title="AI shortlisting"
            description="Structured Gemini match against this role."
          >
            <AiShortlistPanel
              applicationId={application.id}
              analysis={analysis}
              canAccept={canAccept}
              canReject={canReject}
            />
          </SurfaceCard>

          <SurfaceCard
            title="Assignment"
            description="Own this application on the HR team."
          >
            <ApplicationAssignPanel
              applicationId={application.id}
              assignedToId={application.assignedToId}
              assigneeName={detail.assigneeName}
              team={team}
            />
          </SurfaceCard>

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
