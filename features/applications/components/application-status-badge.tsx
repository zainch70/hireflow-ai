import { Badge } from "@/components/ui/badge";
import {
  getApplicationStatusLabel,
  type ApplicationStatus,
} from "@/constants/application-status";
import { cn } from "@/lib/utils";

/** Distinct surface colors per pipeline status (badge + accents). */
export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  submitted:
    "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200",
  under_review:
    "border-sky-300/80 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-200",
  on_hold:
    "border-amber-300/80 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
  shortlisted:
    "border-teal-300/80 bg-teal-100 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200",
  interview:
    "border-indigo-300/80 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200",
  offered:
    "border-emerald-300/80 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200",
  hired:
    "border-green-400/80 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200",
  rejected:
    "border-red-300/80 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
  withdrawn:
    "border-zinc-300/80 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300",
};

/** Dot / timeline accent (solid-ish). */
export const APPLICATION_STATUS_DOT: Record<ApplicationStatus, string> = {
  submitted: "bg-slate-400",
  under_review: "bg-sky-500",
  on_hold: "bg-amber-500",
  shortlisted: "bg-teal-500",
  interview: "bg-indigo-500",
  offered: "bg-emerald-500",
  hired: "bg-green-600",
  rejected: "bg-red-500",
  withdrawn: "bg-zinc-400",
};

/** Soft button styles for moving *into* a status. */
export const APPLICATION_STATUS_ACTION_STYLES: Record<
  ApplicationStatus,
  string
> = {
  submitted:
    "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  under_review:
    "border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100 dark:hover:bg-sky-900",
  on_hold:
    "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900",
  shortlisted:
    "border-teal-300 bg-teal-50 text-teal-950 hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-100 dark:hover:bg-teal-900",
  interview:
    "border-indigo-300 bg-indigo-50 text-indigo-950 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-100 dark:hover:bg-indigo-900",
  offered:
    "border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900",
  hired:
    "border-green-400 bg-green-50 text-green-950 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-100 dark:hover:bg-green-900",
  rejected:
    "border-red-300 bg-red-50 text-red-900 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900",
  withdrawn:
    "border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
};

export function getApplicationStatusStyle(status: string) {
  return (
    APPLICATION_STATUS_STYLES[status as ApplicationStatus] ??
    APPLICATION_STATUS_STYLES.submitted
  );
}

export function getApplicationStatusDot(status: string) {
  return (
    APPLICATION_STATUS_DOT[status as ApplicationStatus] ??
    APPLICATION_STATUS_DOT.submitted
  );
}

export function getApplicationStatusActionStyle(status: string) {
  return (
    APPLICATION_STATUS_ACTION_STYLES[status as ApplicationStatus] ??
    APPLICATION_STATUS_ACTION_STYLES.submitted
  );
}

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus | string;
  className?: string;
};

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize",
        getApplicationStatusStyle(status),
        className,
      )}
    >
      {getApplicationStatusLabel(status)}
    </Badge>
  );
}
