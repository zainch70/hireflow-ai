import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { careersJobPath } from "@/constants/routes";
import type { EmploymentType } from "@/constants/employment-type";
import {
  formatSalaryRange,
  getEmploymentTypeLabel,
} from "@/features/jobs/lib/job-labels";
import type { PublishedJobCard } from "@/services/jobs";
import { cn } from "@/lib/utils";

type JobCardProps = {
  job: PublishedJobCard;
  className?: string;
};

export function JobCard({ job, className }: JobCardProps) {
  const salary = formatSalaryRange(job);
  const href = careersJobPath(job.slug);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors",
        "hover:border-primary/30 hover:bg-primary/[0.02]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {job.department ?? "General"}
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            <Link
              href={href}
              className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              {job.title}
            </Link>
          </h2>
        </div>
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {job.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1">
          <MapPin className="size-3.5" aria-hidden="true" />
          {job.location ?? "Location TBD"}
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
          {getEmploymentTypeLabel(job.employmentType as EmploymentType)}
        </span>
        {job.experience ? (
          <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
            {job.experience}
          </span>
        ) : null}
        {salary ? (
          <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
            {salary}
          </span>
        ) : null}
      </div>
    </article>
  );
}
