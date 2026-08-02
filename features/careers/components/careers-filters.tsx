import { Search } from "lucide-react";

import { ButtonLink } from "@/components/layouts/button-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  type EmploymentType,
} from "@/constants/employment-type";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const employmentOptions = Object.values(EMPLOYMENT_TYPES);

export type CareersFilterValues = {
  q?: string;
  type?: string;
  department?: string;
  location?: string;
};

type CareersFiltersProps = {
  values: CareersFilterValues;
  departments: string[];
  locations: string[];
};

export function CareersFilters({
  values,
  departments,
  locations,
}: CareersFiltersProps) {
  const hasActiveFilters = Boolean(
    values.q || values.type || values.department || values.location,
  );

  return (
    <form
      method="get"
      action={ROUTES.careers}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
      role="search"
      aria-label="Filter open roles"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="careers-q">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="careers-q"
              name="q"
              type="search"
              placeholder="Role, team, keyword…"
              defaultValue={values.q ?? ""}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="careers-type">Employment type</Label>
          <select
            id="careers-type"
            name="type"
            defaultValue={values.type ?? ""}
            className={selectClassName}
          >
            <option value="">All types</option>
            {employmentOptions.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_TYPE_LABELS[value as EmploymentType]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="careers-department">Department</Label>
          <select
            id="careers-department"
            name="department"
            defaultValue={values.department ?? ""}
            className={selectClassName}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="careers-location">Location</Label>
          <select
            id="careers-location"
            name="location"
            defaultValue={values.location ?? ""}
            className={selectClassName}
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
          {hasActiveFilters ? (
            <ButtonLink href={ROUTES.careers} variant="outline">
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
