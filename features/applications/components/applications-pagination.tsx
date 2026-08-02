import { ChevronLeft, ChevronRight } from "lucide-react";

import { ButtonLink } from "@/components/layouts/button-link";
import {
  buildApplicationsQueryString,
  type ApplicationsFilterValues,
} from "@/features/applications/lib/applications-filters";
import { ROUTES } from "@/constants/routes";

type ApplicationsPaginationProps = {
  values: ApplicationsFilterValues;
  total: number;
  pageCount: number;
};

export function ApplicationsPagination({
  values,
  total,
  pageCount,
}: ApplicationsPaginationProps) {
  const page = values.page;
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const hrefFor = (nextPage: number) =>
    `${ROUTES.dashboard.applications}${buildApplicationsQueryString(values, {
      page: nextPage,
    })}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
        <span className="mx-1.5 text-border">·</span>
        {total} application{total === 1 ? "" : "s"}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {hasPrev ? (
          <ButtonLink href={hrefFor(page - 1)} variant="outline" size="sm">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Prev
          </ButtonLink>
        ) : (
          <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground opacity-50">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Prev
          </span>
        )}

        {hasNext ? (
          <ButtonLink href={hrefFor(page + 1)} variant="outline" size="sm">
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        ) : (
          <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground opacity-50">
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
