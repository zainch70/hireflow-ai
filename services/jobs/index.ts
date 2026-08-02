import { cache } from "react";
import { and, asc, desc, eq, ilike, isNotNull, or } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import type { EmploymentType } from "@/constants/employment-type";
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
  publishedAt: Date | null;
};

export type PublishedJobDetail = PublishedJobCard & {
  requirements: string | null;
};

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
  if (!value) {
    return undefined;
  }

  const cleaned = value.trim().slice(0, 100).replace(/[%_]/g, " ");
  return cleaned.length > 0 ? cleaned : undefined;
}

export async function listJobs(): Promise<Job[]> {
  return db.select().from(jobs).orderBy(desc(jobs.updatedAt));
}

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

export async function countJobsByStatus(status: JobStatus): Promise<number> {
  const rows = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(eq(jobs.status, status));

  return rows.length;
}

export async function listJobsByStatus(status: JobStatus): Promise<Job[]> {
  return db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, status)))
    .orderBy(desc(jobs.updatedAt));
}

/** Public careers listing — published jobs only, card columns only. */
export async function listPublishedJobs(
  filters: PublishedJobFilters = {},
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

  return db
    .select(publishedJobCardColumns)
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.publishedAt), desc(jobs.updatedAt));
}

/** Deduped per request (metadata + page share one query). */
export const getPublishedJobBySlug = cache(
  async (slug: string): Promise<PublishedJobDetail | null> => {
    const [job] = await db
      .select(publishedJobDetailColumns)
      .from(jobs)
      .where(and(eq(jobs.slug, slug), eq(jobs.status, JOB_STATUS.PUBLISHED)))
      .limit(1);

    return job ?? null;
  },
);

export async function getPublishedJobFilterOptions(): Promise<{
  departments: string[];
  locations: string[];
}> {
  const [departmentRows, locationRows] = await Promise.all([
    db
      .selectDistinct({ department: jobs.department })
      .from(jobs)
      .where(
        and(eq(jobs.status, JOB_STATUS.PUBLISHED), isNotNull(jobs.department)),
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
}
