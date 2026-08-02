import { asc, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { applications, jobs } from "@/db/schema";

export type ApplicationsByJobCount = {
  jobId: string;
  jobTitle: string;
  count: number;
};

/** Application counts grouped by job (for HR overview). */
export async function countApplicationsByJob(
  limit = 8,
): Promise<ApplicationsByJobCount[]> {
  const rows = await db
    .select({
      jobId: applications.jobId,
      jobTitle: jobs.title,
      count: count(),
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(isNull(applications.archivedAt))
    .groupBy(applications.jobId, jobs.title)
    .orderBy(desc(count()), asc(jobs.title))
    .limit(limit);

  return rows.map((row) => ({
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    count: Number(row.count),
  }));
}
