import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { ButtonLink } from "@/components/layouts/button-link";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ROUTES } from "@/constants/routes";
import type { Job } from "@/services/jobs";
import { JobStatusBadge } from "@/features/jobs/components/job-status-badge";
import { JobRowActions } from "@/features/jobs/components/job-row-actions";
import {
  formatSalaryRange,
  getEmploymentTypeLabel,
} from "@/features/jobs/lib/job-labels";
import type { EmploymentType } from "@/constants/employment-type";

type JobsTableProps = {
  jobs: Job[];
};

export function JobsTable({ jobs }: JobsTableProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
        title="No job openings yet"
        description="Create your first role to start collecting applications later."
        action={
          <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
            Create job
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {jobs.map((job) => {
          const salary = formatSalaryRange(job);

          return (
            <li
              key={job.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`${ROUTES.dashboard.jobs}/${job.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {job.department ?? "No department"}
                    {" · "}
                    {getEmploymentTypeLabel(
                      job.employmentType as EmploymentType,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.location}
                    {job.experience ? ` · ${job.experience}` : ""}
                    {salary ? ` · ${salary}` : ""}
                  </p>
                </div>
                <JobRowActions jobId={job.id} status={job.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <JobStatusBadge status={job.status} />
                <span className="text-xs text-muted-foreground">
                  Updated {job.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <SurfaceCard
        contentClassName="p-0 pt-0"
        className="hidden overflow-hidden md:block"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const salary = formatSalaryRange(job);

                return (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <Link
                          href={`${ROUTES.dashboard.jobs}/${job.id}/edit`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {job.location}
                          {job.experience ? ` · ${job.experience}` : ""}
                          {salary ? ` · ${salary}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {job.department ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {getEmploymentTypeLabel(
                        job.employmentType as EmploymentType,
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {job.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <JobRowActions jobId={job.id} status={job.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </>
  );
}
