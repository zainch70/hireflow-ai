import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import type { JobFormInput } from "@/schemas/jobs";
import { createUniqueJobSlug } from "@/utils/slug";
import {
  assertCanClose,
  assertCanPublish,
  assertCanUnpublish,
  jobNotFoundError,
} from "@/services/jobs/errors";

export type Job = typeof jobs.$inferSelect;

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
