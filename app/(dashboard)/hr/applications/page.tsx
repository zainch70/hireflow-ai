import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ResumeDownloadButton } from "@/features/applications/components/resume-download-button";
import { listApplicationsForHr } from "@/services/applications";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review candidate applications",
};

export default async function HrApplicationsPage() {
  const applications = await listApplicationsForHr();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        description="Candidate submissions for your published roles. Resumes open via short-lived signed links."
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title="No applications yet"
          description="When candidates apply from Careers, they’ll show up here."
        />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {applications.map((application) => (
              <li
                key={application.id}
                className="space-y-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{application.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {application.jobTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {application.email}
                  </p>
                </div>
                {application.resumePath ? (
                  <ResumeDownloadButton
                    applicationId={application.id}
                    fileName={application.resumeFileName}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">No resume</p>
                )}
              </li>
            ))}
          </ul>

          <SurfaceCard
            contentClassName="p-0 pt-0"
            className="hidden overflow-hidden md:block"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Resume</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-0.5">
                          <p className="font-medium">{application.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {application.jobTitle}
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-muted-foreground">
                        {application.status.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {application.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        {application.resumePath ? (
                          <ResumeDownloadButton
                            applicationId={application.id}
                            fileName={application.resumeFileName}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
