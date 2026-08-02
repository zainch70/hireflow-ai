import {
  hrApplicationsSearchParamsSchema,
  type HrApplicationsSearchParams,
} from "@/schemas/applications";
import type { HrApplicationsFilters } from "@/services/applications";

export type ApplicationsFilterValues = HrApplicationsSearchParams;

export function parseApplicationsSearchParams(
  input: Record<string, string | string[] | undefined>,
): {
  values: ApplicationsFilterValues;
  filters: HrApplicationsFilters;
} {
  const flattened: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(input)) {
    flattened[key] = Array.isArray(value) ? value[0] : value;
  }

  const parsed = hrApplicationsSearchParamsSchema.safeParse(flattened);
  const values: ApplicationsFilterValues = parsed.success
    ? parsed.data
    : hrApplicationsSearchParamsSchema.parse({});

  // Keep score / experience ranges coherent when both ends are set.
  if (
    values.scoreMin != null &&
    values.scoreMax != null &&
    values.scoreMin > values.scoreMax
  ) {
    const swap = values.scoreMin;
    values.scoreMin = values.scoreMax;
    values.scoreMax = swap;
  }

  if (
    values.experienceMin != null &&
    values.experienceMax != null &&
    values.experienceMin > values.experienceMax
  ) {
    const swap = values.experienceMin;
    values.experienceMin = values.experienceMax;
    values.experienceMax = swap;
  }

  if (
    values.dateFrom &&
    values.dateTo &&
    values.dateFrom > values.dateTo
  ) {
    const swap = values.dateFrom;
    values.dateFrom = values.dateTo;
    values.dateTo = swap;
  }

  return { values, filters: values };
}

/** Build query string for pagination / clear while preserving filters. */
export function buildApplicationsQueryString(
  values: Partial<ApplicationsFilterValues>,
  overrides: Partial<ApplicationsFilterValues> = {},
): string {
  const defaults = hrApplicationsSearchParamsSchema.parse({});
  const merged: ApplicationsFilterValues = {
    ...defaults,
    ...values,
    ...overrides,
  };

  const params = new URLSearchParams();

  const setIf = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === "") {
      return;
    }
    params.set(key, String(value));
  };

  setIf("name", merged.name);
  setIf("email", merged.email);
  setIf("jobId", merged.jobId);
  setIf("status", merged.status);
  setIf("scoreMin", merged.scoreMin);
  setIf("scoreMax", merged.scoreMax);
  setIf("experienceMin", merged.experienceMin);
  setIf("experienceMax", merged.experienceMax);
  setIf("dateFrom", merged.dateFrom);
  setIf("dateTo", merged.dateTo);

  if (merged.sort !== "createdAt") {
    params.set("sort", merged.sort);
  }
  if (merged.order !== "desc") {
    params.set("order", merged.order);
  }
  if (merged.pageSize !== 20) {
    params.set("pageSize", String(merged.pageSize));
  }
  if (merged.page > 1) {
    params.set("page", String(merged.page));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveApplicationFilters(
  values: ApplicationsFilterValues,
): boolean {
  return Boolean(
    values.name ||
      values.email ||
      values.jobId ||
      values.status ||
      values.scoreMin != null ||
      values.scoreMax != null ||
      values.experienceMin != null ||
      values.experienceMax != null ||
      values.dateFrom ||
      values.dateTo,
  );
}
