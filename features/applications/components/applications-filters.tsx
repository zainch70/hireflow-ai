import { Search } from "lucide-react";

import { ButtonLink } from "@/components/layouts/button-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPLICATION_STATUS,
  getApplicationStatusLabel,
} from "@/constants/application-status";
import { ROUTES } from "@/constants/routes";
import {
  buildApplicationsQueryString,
  hasActiveApplicationFilters,
  type ApplicationsFilterValues,
} from "@/features/applications/lib/applications-filters";
import { cn } from "@/lib/utils";

type JobOption = { id: string; title: string };

type ApplicationsFiltersProps = {
  values: ApplicationsFilterValues;
  jobs: JobOption[];
};

export function ApplicationsFilters({
  values,
  jobs,
}: ApplicationsFiltersProps) {
  const hasFilters = hasActiveApplicationFilters(values);

  return (
    <form
      method="get"
      action={ROUTES.dashboard.applications}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
      role="search"
      aria-label="Filter applications"
    >
      <input type="hidden" name="sort" value={values.sort} />
      <input type="hidden" name="order" value={values.order} />
      <input type="hidden" name="pageSize" value={values.pageSize} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="apps-name">Name</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="apps-name"
              name="name"
              type="search"
              placeholder="Candidate name…"
              defaultValue={values.name ?? ""}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-email">Email</Label>
          <Input
            id="apps-email"
            name="email"
            type="search"
            placeholder="email@example.com"
            defaultValue={values.email ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-job">Job</Label>
          <select
            id="apps-job"
            name="jobId"
            defaultValue={values.jobId ?? ""}
            className={selectClassName}
          >
            <option value="">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-status">Status</Label>
          <select
            id="apps-status"
            name="status"
            defaultValue={values.status ?? ""}
            className={selectClassName}
          >
            <option value="">All statuses</option>
            {Object.values(APPLICATION_STATUS).map((status) => (
              <option key={status} value={status}>
                {getApplicationStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-score-min">AI score min</Label>
          <Input
            id="apps-score-min"
            name="scoreMin"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="0"
            defaultValue={values.scoreMin ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-score-max">AI score max</Label>
          <Input
            id="apps-score-max"
            name="scoreMax"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="100"
            defaultValue={values.scoreMax ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-exp-min">Experience min (yrs)</Label>
          <Input
            id="apps-exp-min"
            name="experienceMin"
            type="number"
            min={0}
            max={60}
            step={1}
            placeholder="0"
            defaultValue={values.experienceMin ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-exp-max">Experience max (yrs)</Label>
          <Input
            id="apps-exp-max"
            name="experienceMax"
            type="number"
            min={0}
            max={60}
            step={1}
            placeholder="60"
            defaultValue={values.experienceMax ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-date-from">Submitted from</Label>
          <Input
            id="apps-date-from"
            name="dateFrom"
            type="date"
            defaultValue={values.dateFrom ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apps-date-to">Submitted to</Label>
          <Input
            id="apps-date-to"
            name="dateTo"
            type="date"
            defaultValue={values.dateTo ?? ""}
          />
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
          {hasFilters ? (
            <ButtonLink
              href={`${ROUTES.dashboard.applications}${buildApplicationsQueryString(
                {
                  page: 1,
                  pageSize: values.pageSize,
                  sort: values.sort,
                  order: values.order,
                },
              )}`}
              variant="outline"
            >
              Clear
            </ButtonLink>
          ) : null}
          <Button type="submit" className="min-w-28">
            Apply filters
          </Button>
        </div>
      </div>
    </form>
  );
}

const selectClassName = cn(
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
);
