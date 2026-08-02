import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import {
  aiAnalyses,
  applicationEducation,
  applicationSkills,
  applications,
  jobs,
  skills,
} from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { toIsoString } from "@/lib/dates";
import {
  fillDailyCounts,
  parseNumericString,
  sanitizeLikeTerm,
  startOfLocalDayWindow,
} from "@/lib/db/query-helpers";
import type { HrApplicationsSortField } from "@/schemas/applications";
import type {
  HrApplicationFilterOptions,
  HrApplicationListItem,
  HrApplicationListResult,
  HrApplicationsFilters,
  HrApplicationTableRow,
} from "@/services/applications/types";

/** Latest completed AI overall_score for an application (correlated subquery). */
function latestAiScoreSql() {
  return sql<string | null>`(
    SELECT ${aiAnalyses.overallScore}
    FROM ${aiAnalyses}
    WHERE ${aiAnalyses.applicationId} = ${applications.id}
      AND ${aiAnalyses.status} = 'completed'
      AND ${aiAnalyses.overallScore} IS NOT NULL
    ORDER BY ${aiAnalyses.createdAt} DESC
    LIMIT 1
  )`;
}

function buildHrApplicationConditions(filters: Partial<HrApplicationsFilters>) {
  const conditions = [];

  if (!filters.includeArchived) {
    conditions.push(isNull(applications.archivedAt));
  }

  const name = sanitizeLikeTerm(filters.name);
  if (name) {
    conditions.push(ilike(applications.fullName, `%${name}%`));
  }

  const email = sanitizeLikeTerm(filters.email);
  if (email) {
    conditions.push(ilike(applications.email, `%${email}%`));
  }

  const location = sanitizeLikeTerm(filters.location);
  if (location) {
    conditions.push(ilike(applications.currentLocation, `%${location}%`));
  }

  if (filters.jobId) {
    conditions.push(eq(applications.jobId, filters.jobId));
  }

  if (filters.status) {
    conditions.push(eq(applications.status, filters.status));
  }

  if (filters.experienceMin != null) {
    conditions.push(gte(applications.yearsOfExperience, filters.experienceMin));
  }

  if (filters.experienceMax != null) {
    conditions.push(lte(applications.yearsOfExperience, filters.experienceMax));
  }

  if (filters.dateFrom) {
    conditions.push(
      gte(applications.createdAt, new Date(`${filters.dateFrom}T00:00:00.000Z`)),
    );
  }

  if (filters.dateTo) {
    conditions.push(
      lte(applications.createdAt, new Date(`${filters.dateTo}T23:59:59.999Z`)),
    );
  }

  const skill = sanitizeLikeTerm(filters.skill);
  if (skill) {
    conditions.push(
      exists(
        db
          .select({ id: applicationSkills.id })
          .from(applicationSkills)
          .innerJoin(skills, eq(applicationSkills.skillId, skills.id))
          .where(
            and(
              eq(applicationSkills.applicationId, applications.id),
              ilike(skills.name, `%${skill}%`),
            ),
          ),
      ),
    );
  }

  const qualification = sanitizeLikeTerm(filters.qualification);
  if (qualification) {
    conditions.push(
      exists(
        db
          .select({ id: applicationEducation.id })
          .from(applicationEducation)
          .where(
            and(
              eq(applicationEducation.applicationId, applications.id),
              sql`(
                ${applicationEducation.degree} ILIKE ${`%${qualification}%`}
                OR ${applicationEducation.fieldOfStudy} ILIKE ${`%${qualification}%`}
                OR CAST(${applicationEducation.educationLevel} AS text) ILIKE ${`%${qualification}%`}
              )`,
            ),
          ),
      ),
    );
  }

  if (filters.graduationYear != null) {
    const year = filters.graduationYear;
    conditions.push(
      exists(
        db
          .select({ id: applicationEducation.id })
          .from(applicationEducation)
          .where(
            and(
              eq(applicationEducation.applicationId, applications.id),
              sql`EXTRACT(YEAR FROM ${applicationEducation.endDate}) = ${year}`,
            ),
          ),
      ),
    );
  }

  const scoreExpr = latestAiScoreSql();

  if (filters.scoreMin != null) {
    conditions.push(sql`(${scoreExpr})::numeric >= ${filters.scoreMin}`);
  }

  if (filters.scoreMax != null) {
    conditions.push(sql`(${scoreExpr})::numeric <= ${filters.scoreMax}`);
  }

  return conditions;
}

function resolveHrApplicationOrderBy(
  sort: HrApplicationsSortField,
  order: "asc" | "desc",
) {
  const direction = order === "asc" ? asc : desc;

  switch (sort) {
    case "name":
      return direction(applications.fullName);
    case "experience":
      return direction(applications.yearsOfExperience);
    case "aiScore":
      return direction(sql`(${latestAiScoreSql()})::numeric`);
    case "createdAt":
    default:
      return direction(applications.createdAt);
  }
}

/**
 * Paginated HR applications list with server-side filters.
 * Cached per filter key; invalidated via CACHE_TAGS.applications.
 */
export async function listApplicationsForHr(
  filters: Partial<HrApplicationsFilters> = {},
): Promise<HrApplicationListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const sort = filters.sort ?? "createdAt";
  const order = filters.order ?? "desc";

  return unstable_cache(
    async () => loadApplicationsForHr(filters),
    [
      "hr-applications-list",
      filters.name ?? "",
      filters.email ?? "",
      filters.jobId ?? "",
      filters.status ?? "",
      String(filters.scoreMin ?? ""),
      String(filters.scoreMax ?? ""),
      String(filters.experienceMin ?? ""),
      String(filters.experienceMax ?? ""),
      filters.dateFrom ?? "",
      filters.dateTo ?? "",
      filters.location ?? "",
      filters.skill ?? "",
      filters.qualification ?? "",
      String(filters.graduationYear ?? ""),
      filters.includeArchived ? "1" : "0",
      String(page),
      String(pageSize),
      sort,
      order,
    ],
    {
      revalidate: 30,
      tags: [
        CACHE_TAGS.applications,
        CACHE_TAGS.jobs,
        CACHE_TAGS.dashboard,
        CACHE_TAGS.ai,
      ],
    },
  )();
}

async function loadApplicationsForHr(
  filters: Partial<HrApplicationsFilters>,
): Promise<HrApplicationListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const sort = filters.sort ?? "createdAt";
  const order = filters.order ?? "desc";
  const offset = (page - 1) * pageSize;

  const conditions = buildHrApplicationConditions(filters);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy = resolveHrApplicationOrderBy(sort, order);
  const scoreSql = latestAiScoreSql();

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        fullName: applications.fullName,
        email: applications.email,
        status: applications.status,
        resumePath: applications.resumePath,
        resumeFileName: applications.resumeFileName,
        yearsOfExperience: applications.yearsOfExperience,
        aiScore: scoreSql,
        createdAt: applications.createdAt,
        jobTitle: jobs.title,
        jobSlug: jobs.slug,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(whereClause)
      .orderBy(orderBy, desc(applications.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(whereClause)
      .then((result) => result[0]),
  ]);

  const total = Number(totalRow?.value ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: rows.map((row) => ({
      id: row.id,
      jobId: row.jobId,
      fullName: row.fullName,
      email: row.email,
      status: row.status,
      resumePath: row.resumePath,
      resumeFileName: row.resumeFileName,
      yearsOfExperience: row.yearsOfExperience,
      aiScore: parseNumericString(row.aiScore),
      createdAt: toIsoString(row.createdAt),
      jobTitle: row.jobTitle,
      jobSlug: row.jobSlug,
    })),
    total,
    page,
    pageSize,
    pageCount,
  };
}

/** Jobs that already have applications — for filter dropdowns. */
export async function getHrApplicationFilterOptions(): Promise<HrApplicationFilterOptions> {
  return unstable_cache(
    async () => {
      const rows = await db
        .selectDistinct({
          id: jobs.id,
          title: jobs.title,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .orderBy(asc(jobs.title));

      return { jobs: rows };
    },
    ["hr-application-filter-options"],
    {
      revalidate: 60,
      tags: [CACHE_TAGS.applications, CACHE_TAGS.jobs],
    },
  )();
}

export function toHrApplicationTableRows(
  rows: HrApplicationListItem[],
): HrApplicationTableRow[] {
  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    fullName: row.fullName,
    email: row.email,
    status: row.status,
    resumePath: row.resumePath,
    resumeFileName: row.resumeFileName,
    yearsOfExperience: row.yearsOfExperience,
    aiScore: row.aiScore,
    createdAt: row.createdAt,
    jobTitle: row.jobTitle,
    jobSlug: row.jobSlug,
  }));
}

export async function listRecentApplicationsForHr(
  limit = 5,
): Promise<HrApplicationListItem[]> {
  const scoreSql = latestAiScoreSql();

  const rows = await db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      fullName: applications.fullName,
      email: applications.email,
      status: applications.status,
      resumePath: applications.resumePath,
      resumeFileName: applications.resumeFileName,
      yearsOfExperience: applications.yearsOfExperience,
      aiScore: scoreSql,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(isNull(applications.archivedAt))
    .orderBy(desc(applications.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    fullName: row.fullName,
    email: row.email,
    status: row.status,
    resumePath: row.resumePath,
    resumeFileName: row.resumeFileName,
    yearsOfExperience: row.yearsOfExperience,
    aiScore: parseNumericString(row.aiScore),
    createdAt: toIsoString(row.createdAt),
    jobTitle: row.jobTitle,
    jobSlug: row.jobSlug,
  }));
}

export async function countApplicationsGroupedByStatus(): Promise<
  Array<{ status: HrApplicationListItem["status"]; count: number }>
> {
  const rows = await db
    .select({
      status: applications.status,
      count: count(),
    })
    .from(applications)
    .where(isNull(applications.archivedAt))
    .groupBy(applications.status);

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count),
  }));
}

/** Daily application counts for the last `days` days (inclusive of today). */
export async function countApplicationsOverTime(
  days = 30,
): Promise<Array<{ date: string; count: number }>> {
  const since = startOfLocalDayWindow(days);

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${applications.createdAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(applications)
    .where(
      and(gte(applications.createdAt, since), isNull(applications.archivedAt)),
    )
    .groupBy(sql`date_trunc('day', ${applications.createdAt})`)
    .orderBy(sql`date_trunc('day', ${applications.createdAt})`);

  const byDate = new Map(rows.map((row) => [row.date, Number(row.count)]));
  return fillDailyCounts(since, days, byDate);
}
