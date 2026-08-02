import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/constants/job-status";
import { JOB_STATUS } from "@/constants/job-status";
import { getJobStatusLabel } from "@/features/jobs/lib/job-labels";
import { cn } from "@/lib/utils";

const statusStyles: Record<JobStatus, string> = {
  draft: "border-border bg-muted/60 text-muted-foreground",
  published: "border-primary/20 bg-primary/10 text-primary",
  closed: "border-border bg-secondary text-secondary-foreground",
  archived: "border-border bg-muted text-muted-foreground",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", statusStyles[status])}
    >
      {getJobStatusLabel(status)}
    </Badge>
  );
}

export function isPublishedStatus(status: JobStatus) {
  return status === JOB_STATUS.PUBLISHED;
}
