import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import type { EmploymentType } from "@/constants/employment-type";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { toIsoString, toIsoStringOrNull } from "@/lib/dates";
import {
  fillDailyCounts,
  sanitizeLikeTerm,
  startOfLocalDayWindow,
} from "@/lib/db/query-helpers";
import type { JobFormInput } from "@/schemas/jobs";
import { createUniqueJobSlug } from "@/utils/slug";
import {
  assertCanClose,
  assertCanPublish,
  assertCanUnpublish,
  jobNotFoundError,
} from "@/services/jobs/errors";

export type Job = typeof jobs.$inferSelect;

/** Columns needed for public careers cards / list. */
const publishedJobCardColumns = {
  id: jobs.id,
  slug: jobs.slug,
  title: jobs.title,
  department: jobs.department,
  location: jobs.location,
  employmentType: jobs.employmentType,
  experience: jobs.experience,
  description: jobs.description,
  salaryMin: jobs.salaryMin,
  salaryMax: jobs.salaryMax,
  salaryCurrency: jobs.salaryCurrency,
  publishedAt: jobs.publishedAt,
} as const;

/** Columns needed for public job detail + SEO. */
const publishedJobDetailColumns = {
  ...publishedJobCardColumns,
  requirements: jobs.requirements,
} as const;

export type PublishedJobCard = {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  location: string | null;
  employmentType: Job["employmentType"];
  experience: string | null;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  /** ISO string — Data Cache safe (never a live Date after cache hit). */
  publishedAt: string | null;
};

export type PublishedJobDetail = PublishedJobCard & {
  requirements: string | null;
};

/** HR jobs table row from cached `listJobs` — timestamps are ISO strings. */
export type JobListRow = Omit<Job, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

function toJobListRow(job: Job): JobListRow {
  return {
    ...job,
    createdAt: toIsoString(job.createdAt),
    updatedAt: toIsoString(job.updatedAt),
    publishedAt: toIsoStringOrNull(job.publishedAt),
  };
}

function toPublishedJobCard(
  job: {
    id: string;
    slug: string;
    title: string;
    department: string | null;
    location: string | null;
    employmentType: Job["employmentType"];
    experience: string | null;
    description: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    publishedAt: Date | null;
  },
): PublishedJobCard {
  return {
    ...job,
    publishedAt: toIsoStringOrNull(job.publishedAt),
  };
}

export type PublishedJobFilters = {
  q?: string;
  employmentType?: EmploymentType;
  department?: string;
  location?: string;
};

function normalizeOptionalSalary(input: JobFormInput) {
  const salaryMin = input.salaryMin;
  const salaryMax = input.salaryMax;
  const hasSalary = salaryMin !== undefined || salaryMax !== undefined;

  return {
    salaryMin: salaryMin ?? null,
    salaryMax: salaryMax ?? null,
    salaryCurrency: hasSalary
      ? input.salaryCurrency && input.salaryCurrency.length > 0
        ? input.salaryCurrency.toUpperCase()
        : "USD"
      : null,
  };
}

function toJobValues(input: JobFormInput) {
  const salary = normalizeOptionalSalary(input);

  return {
    title: input.title,
    department: input.department,
    employmentType: input.employmentType,
    experience: input.experience,
    location: input.location,
    description: input.description,
    requirements: input.requirements,
    ...salary,
  };
}

function sanitizeSearchTerm(value: string | undefined): string | undefined {
  return sanitizeLikeTerm(value);
}

export async function listJobs(): Promise<JobListRow[]> {
  return listJobsCached();
}

const listJobsCached = unstable_cache(
  async () => {
    const rows = await db.select().from(jobs).orderBy(desc(jobs.updatedAt));
    return rows.map(toJobListRow);
  },
  ["hr-jobs-list"],
  { revalidate: 30, tags: [CACHE_TAGS.jobs, CACHE_TAGS.dashboard] },
);

export async function getJobById(jobId: string): Promise<Job | null> {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  return job ?? null;
}

export async function requireJob(jobId: string): Promise<Job> {
  const job = await getJobById(jobId);
  if (!job) {
    throw jobNotFoundError();
  }
  return job;
}

export async function createJob(input: {
  data: JobFormInput;
  createdById: string;
}): Promise<Job> {
  const values = toJobValues(input.data);

  const [created] = await db
    .insert(jobs)
    .values({
      ...values,
      slug: createUniqueJobSlug(input.data.title),
      createdById: input.createdById,
      status: JOB_STATUS.DRAFT,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create job");
  }

  return created;
}

export async function updateJob(input: {
  jobId: string;
  data: JobFormInput;
}): Promise<Job> {
  await requireJob(input.jobId);
  const values = toJobValues(input.data);

  const [updated] = await db
    .update(jobs)
    .set(values)
    .where(eq(jobs.id, input.jobId))
    .returning();

  if (!updated) {
    throw jobNotFoundError();
  }

  return updated;
}

export async function deleteJob(jobId: string): Promise<void> {
  const deleted = await db
    .delete(jobs)
    .where(eq(jobs.id, jobId))
    .returning({ id: jobs.id });

  if (deleted.length === 0) {
    throw jobNotFoundError();
  }
}

async function setJobStatus(input: {
  jobId: string;
  status: JobStatus;
  publishedAt?: Date | null;
}): Promise<Job> {
  const [updated] = await db
    .update(jobs)
    .set({
      status: input.status,
      ...(input.publishedAt !== undefined
        ? { publishedAt: input.publishedAt }
        : {}),
    })
    .where(eq(jobs.id, input.jobId))
    .returning();

  if (!updated) {
    throw jobNotFoundError();
  }

  return updated;
}

export async function publishJob(jobId: string): Promise<Job> {
  const job = await requireJob(jobId);
  assertCanPublish(job.status);

  return setJobStatus({
    jobId,
    status: JOB_STATUS.PUBLISHED,
    publishedAt: new Date(),
  });
}

export async function unpublishJob(jobId: string): Promise<Job> {
  const job = await requireJob(jobId);
  assertCanUnpublish(job.status);

  return setJobStatus({
    jobId,
    status: JOB_STATUS.DRAFT,
    publishedAt: null,
  });
}

export async function closeJob(jobId: string): Promise<Job> {
  const job = await requireJob(jobId);
  assertCanClose(job.status);

  return setJobStatus({
    jobId,
    status: JOB_STATUS.CLOSED,
  });
}

export async function countJobsGroupedByStatus(): Promise<
  Array<{ status: JobStatus; count: number }>
> {
  const rows = await db
    .select({
      status: jobs.status,
      count: count(),
    })
    .from(jobs)
    .groupBy(jobs.status);

  return rows.map((row) => ({
    status: row.status as JobStatus,
    count: Number(row.count),
  }));
}

/**
 * Daily publish events for the last `days` days (jobs with published_at set).
 * Unpublish clears published_at, so only currently dated publishes appear.
 */
export async function countJobsPublishedOverTime(
  days = 30,
): Promise<Array<{ date: string; count: number }>> {
  const since = startOfLocalDayWindow(days);

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${jobs.publishedAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(jobs)
    .where(and(isNotNull(jobs.publishedAt), gte(jobs.publishedAt, since)))
    .groupBy(sql`date_trunc('day', ${jobs.publishedAt})`)
    .orderBy(sql`date_trunc('day', ${jobs.publishedAt})`);

  const byDate = new Map(rows.map((row) => [row.date, Number(row.count)]));
  return fillDailyCounts(since, days, byDate);
}

export async function listRecentJobs(limit = 5): Promise<Job[]> {
  return db.select().from(jobs).orderBy(desc(jobs.updatedAt)).limit(limit);
}

/** Public careers listing — published jobs only, card columns only. */
export async function listPublishedJobs(
  filters: PublishedJobFilters = {},
): Promise<PublishedJobCard[]> {
  const q = sanitizeSearchTerm(filters.q) ?? "";
  const department = filters.department?.trim() ?? "";
  const location = filters.location?.trim() ?? "";
  const employmentType = filters.employmentType ?? "";

  return unstable_cache(
    async () => loadPublishedJobs(filters),
    ["published-jobs", q, department, location, employmentType],
    {
      revalidate: 60,
      tags: [CACHE_TAGS.careers, CACHE_TAGS.jobs],
    },
  )();
}

async function loadPublishedJobs(
  filters: PublishedJobFilters,
): Promise<PublishedJobCard[]> {
  const q = sanitizeSearchTerm(filters.q);
  const department = filters.department?.trim();
  const location = filters.location?.trim();

  const conditions = [eq(jobs.status, JOB_STATUS.PUBLISHED)];

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      or(
        ilike(jobs.title, pattern),
        ilike(jobs.department, pattern),
        ilike(jobs.location, pattern),
        ilike(jobs.description, pattern),
        ilike(jobs.requirements, pattern),
      )!,
    );
  }

  if (filters.employmentType) {
    conditions.push(eq(jobs.employmentType, filters.employmentType));
  }

  if (department) {
    conditions.push(eq(jobs.department, department));
  }

  if (location) {
    conditions.push(eq(jobs.location, location));
  }

  const rows = await db
    .select(publishedJobCardColumns)
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.publishedAt), desc(jobs.updatedAt));

  return rows.map(toPublishedJobCard);
}

/** Deduped per request (metadata + page share one query). */
export const getPublishedJobBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async (): Promise<PublishedJobDetail | null> => {
      const [job] = await db
        .select(publishedJobDetailColumns)
        .from(jobs)
        .where(and(eq(jobs.slug, slug), eq(jobs.status, JOB_STATUS.PUBLISHED)))
        .limit(1);

      if (!job) return null;

      return {
        ...toPublishedJobCard(job),
        requirements: job.requirements,
      };
    },
    ["published-job", slug],
    { revalidate: 60, tags: [CACHE_TAGS.careers, CACHE_TAGS.jobs] },
  )();
});

/** Any-status lookup (e.g. apply success after a role closes). */
export const getJobBySlug = cache(
  async (
    slug: string,
  ): Promise<Pick<PublishedJobDetail, "id" | "slug" | "title"> | null> => {
    const [job] = await db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
      })
      .from(jobs)
      .where(eq(jobs.slug, slug))
      .limit(1);

    return job ?? null;
  },
);

export async function getPublishedJobFilterOptions(): Promise<{
  departments: string[];
  locations: string[];
}> {
  return unstable_cache(
    async () => {
      const [departmentRows, locationRows] = await Promise.all([
        db
          .selectDistinct({ department: jobs.department })
          .from(jobs)
          .where(
            and(
              eq(jobs.status, JOB_STATUS.PUBLISHED),
              isNotNull(jobs.department),
            ),
          )
          .orderBy(asc(jobs.department)),
        db
          .selectDistinct({ location: jobs.location })
          .from(jobs)
          .where(
            and(eq(jobs.status, JOB_STATUS.PUBLISHED), isNotNull(jobs.location)),
          )
          .orderBy(asc(jobs.location)),
      ]);

      return {
        departments: departmentRows
          .map((row) => row.department?.trim())
          .filter((value): value is string => Boolean(value)),
        locations: locationRows
          .map((row) => row.location?.trim())
          .filter((value): value is string => Boolean(value)),
      };
    },
    ["published-job-filter-options"],
    { revalidate: 60, tags: [CACHE_TAGS.careers, CACHE_TAGS.jobs] },
  )();
}

export type { JobShortlistingCriterion } from "@/services/jobs/criteria";
export {
  listJobShortlistingCriteria,
  replaceJobShortlistingCriteria,
} from "@/services/jobs/criteria";

