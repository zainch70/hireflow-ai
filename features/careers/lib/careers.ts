import type { EmploymentType } from "@/constants/employment-type";
import { EMPLOYMENT_TYPES } from "@/constants/employment-type";
import type { CareersFilterValues } from "@/features/careers/components/careers-filters";
import { toIsoString, type TimestampNull } from "@/lib/dates";
import type { PublishedJobFilters } from "@/services/jobs";

const employmentTypeSet = new Set<string>(Object.values(EMPLOYMENT_TYPES));

export function parseCareersSearchParams(input: {
  q?: string;
  type?: string;
  department?: string;
  location?: string;
}): {
  values: CareersFilterValues;
  filters: PublishedJobFilters;
} {
  const q = input.q?.trim() || undefined;
  const department = input.department?.trim() || undefined;
  const location = input.location?.trim() || undefined;
  const typeRaw = input.type?.trim() || undefined;
  const employmentType =
    typeRaw && employmentTypeSet.has(typeRaw)
      ? (typeRaw as EmploymentType)
      : undefined;

  return {
    values: {
      q,
      type: employmentType,
      department,
      location,
    },
    filters: {
      q,
      employmentType,
      department,
      location,
    },
  };
}

export function buildJobPostingJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  location: string | null;
  employmentType: string;
  datePosted: TimestampNull;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  appUrl: string;
}) {
  const url = `${input.appUrl}/careers/${input.slug}`;

  const employmentTypeMap: Record<string, string> = {
    full_time: "FULL_TIME",
    part_time: "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
  };

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: input.title,
    description: input.description,
    datePosted: toIsoString(input.datePosted ?? new Date()),
    employmentType: employmentTypeMap[input.employmentType] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "HireFlow AI",
      sameAs: input.appUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: input.location ?? "Remote",
    },
    url,
    ...(input.salaryMin != null || input.salaryMax != null
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: input.salaryCurrency ?? "USD",
            value: {
              "@type": "QuantitativeValue",
              ...(input.salaryMin != null ? { minValue: input.salaryMin } : {}),
              ...(input.salaryMax != null ? { maxValue: input.salaryMax } : {}),
              unitText: "YEAR",
            },
          },
        }
      : {}),
  };
}
