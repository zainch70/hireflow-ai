import { asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  applicationEducation,
  applicationNotes,
  applicationSkills,
  applicationStatusHistory,
  applications,
  jobs,
  profiles,
  skills,
} from "@/db/schema";
import {
  APPLICATION_STATUS,
  type ApplicationStatus,
} from "@/constants/application-status";
import type { ApplicationFormInput } from "@/schemas/applications";
import {
  getPublishedJobBySlug,
  type PublishedJobDetail,
} from "@/services/jobs";
import {
  applicationNotAllowedError,
  applicationNotFoundError,
  duplicateApplicationError,
  invalidApplicationTransitionError,
  isUniqueViolation,
} from "@/services/applications/errors";
import {
  canTransitionApplicationStatus,
  getAllowedStatusTransitions,
} from "@/services/applications/transitions";
import { resumeNotFoundError } from "@/services/storage/errors";
import {
  buildResumeStoragePath,
  createResumeSignedUrl,
  deleteResumeObject,
  uploadResumeObject,
} from "@/services/storage";
import { validateResumeFile } from "@/lib/uploads";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { slugify } from "@/utils/slug";

export type Application = typeof applications.$inferSelect;

export type HrApplicationListItem = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  status: Application["status"];
  resumePath: string | null;
  resumeFileName: string | null;
  createdAt: Date;
  jobTitle: string;
  jobSlug: string;
};

/** Plain serializable row for client DataTables. */
export type HrApplicationTableRow = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  status: Application["status"];
  resumePath: string | null;
  resumeFileName: string | null;
  createdAt: string;
  jobTitle: string;
  jobSlug: string;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type SkillInput = ApplicationFormInput["skills"][number];

type ResolvedApplicationSkill = {
  skillId: string;
  proficiency: string | null;
};

/** Lookup existing skills in one query, create missing in bulk, then return IDs. */
async function resolveApplicationSkills(
  tx: Tx,
  skillInputs: SkillInput[],
): Promise<ResolvedApplicationSkill[]> {
  const uniqueBySlug = new Map<
    string,
    { name: string; proficiency: string | null }
  >();

  for (const skill of skillInputs) {
    const name = skill.name.trim();
    const slug = slugify(name);

    if (!uniqueBySlug.has(slug)) {
      uniqueBySlug.set(slug, {
        name,
        proficiency: skill.proficiency ?? null,
      });
    }
  }

  const slugs = [...uniqueBySlug.keys()];

  if (slugs.length === 0) {
    return [];
  }

  const existing = await tx
    .select({ id: skills.id, slug: skills.slug })
    .from(skills)
    .where(inArray(skills.slug, slugs));

  const idBySlug = new Map(existing.map((row) => [row.slug, row.id]));

  const missing = [...uniqueBySlug.entries()]
    .filter(([slug]) => !idBySlug.has(slug))
    .map(([slug, value]) => ({ name: value.name, slug }));

  if (missing.length > 0) {
    try {
      const created = await tx
        .insert(skills)
        .values(missing)
        .returning({ id: skills.id, slug: skills.slug });

      for (const row of created) {
        idBySlug.set(row.slug, row.id);
      }
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const refetched = await tx
        .select({ id: skills.id, slug: skills.slug })
        .from(skills)
        .where(inArray(skills.slug, slugs));

      for (const row of refetched) {
        idBySlug.set(row.slug, row.id);
      }
    }
  }

  return [...uniqueBySlug.entries()].map(([slug, value]) => {
    const skillId = idBySlug.get(slug);

    if (!skillId) {
      throw new Error(`Failed to resolve skill: ${value.name}`);
    }

    return {
      skillId,
      proficiency: value.proficiency,
    };
  });
}

export async function getApplicationById(
  applicationId: string,
): Promise<Application | null> {
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  return row ?? null;
}

export async function listApplicationsForHr(): Promise<HrApplicationListItem[]> {
  return db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      fullName: applications.fullName,
      email: applications.email,
      status: applications.status,
      resumePath: applications.resumePath,
      resumeFileName: applications.resumeFileName,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt));
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
    createdAt: row.createdAt.toISOString(),
    jobTitle: row.jobTitle,
    jobSlug: row.jobSlug,
  }));
}

export async function listRecentApplicationsForHr(
  limit = 5,
): Promise<HrApplicationListItem[]> {
  return db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      fullName: applications.fullName,
      email: applications.email,
      status: applications.status,
      resumePath: applications.resumePath,
      resumeFileName: applications.resumeFileName,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt))
    .limit(limit);
}

export async function countApplicationsGroupedByStatus(): Promise<
  Array<{ status: Application["status"]; count: number }>
> {
  const rows = await db
    .select({
      status: applications.status,
      count: count(),
    })
    .from(applications)
    .groupBy(applications.status);

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count),
  }));
}

export async function countApplicationsByJob(
  limit = 8,
): Promise<Array<{ jobId: string; jobTitle: string; count: number }>> {
  const rows = await db
    .select({
      jobId: applications.jobId,
      jobTitle: jobs.title,
      count: count(),
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .groupBy(applications.jobId, jobs.title)
    .orderBy(desc(count()))
    .limit(limit);

  return rows.map((row) => ({
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    count: Number(row.count),
  }));
}

/** Daily application counts for the last `days` days (inclusive of today). */
export async function countApplicationsOverTime(
  days = 30,
): Promise<Array<{ date: string; count: number }>> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${applications.createdAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(applications)
    .where(gte(applications.createdAt, since))
    .groupBy(sql`date_trunc('day', ${applications.createdAt})`)
    .orderBy(sql`date_trunc('day', ${applications.createdAt})`);

  const byDate = new Map(rows.map((row) => [row.date, Number(row.count)]));
  const series: Array<{ date: string; count: number }> = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    series.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  return series;
}

/** HR-only: short-lived signed URL for a private resume. */
export async function getApplicationResumeDownloadUrl(
  applicationId: string,
): Promise<{ url: string; fileName: string }> {
  const application = await getApplicationById(applicationId);

  if (!application?.resumePath) {
    throw resumeNotFoundError();
  }

  const url = await createResumeSignedUrl(application.resumePath, 60);

  return {
    url,
    fileName: application.resumeFileName ?? "resume.pdf",
  };
}

export type HrApplicationNote = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string | null;
};

export type HrApplicationStatusEvent = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  createdAt: Date;
  changedByName: string | null;
};

export type HrApplicationEducation = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  educationLevel: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  grade: string | null;
};

export type HrApplicationSkill = {
  id: string;
  name: string;
  proficiency: string | null;
};

export type HrApplicationDetail = {
  application: Application;
  jobTitle: string;
  jobSlug: string;
  education: HrApplicationEducation[];
  skills: HrApplicationSkill[];
  notes: HrApplicationNote[];
  statusHistory: HrApplicationStatusEvent[];
  allowedTransitions: ApplicationStatus[];
};

export async function getApplicationDetailForHr(
  applicationId: string,
): Promise<HrApplicationDetail | null> {
  const [row] = await db
    .select({
      application: applications,
      jobTitle: jobs.title,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!row) {
    return null;
  }

  const [educationRows, skillRows, noteRows, historyRows] = await Promise.all([
    db
      .select({
        id: applicationEducation.id,
        institution: applicationEducation.institution,
        degree: applicationEducation.degree,
        fieldOfStudy: applicationEducation.fieldOfStudy,
        educationLevel: applicationEducation.educationLevel,
        startDate: applicationEducation.startDate,
        endDate: applicationEducation.endDate,
        isCurrent: applicationEducation.isCurrent,
        grade: applicationEducation.grade,
      })
      .from(applicationEducation)
      .where(eq(applicationEducation.applicationId, applicationId))
      .orderBy(asc(applicationEducation.sortOrder)),
    db
      .select({
        id: applicationSkills.id,
        name: skills.name,
        proficiency: applicationSkills.proficiency,
      })
      .from(applicationSkills)
      .innerJoin(skills, eq(applicationSkills.skillId, skills.id))
      .where(eq(applicationSkills.applicationId, applicationId))
      .orderBy(asc(skills.name)),
    db
      .select({
        id: applicationNotes.id,
        body: applicationNotes.body,
        createdAt: applicationNotes.createdAt,
        authorName: profiles.fullName,
      })
      .from(applicationNotes)
      .leftJoin(profiles, eq(applicationNotes.authorId, profiles.id))
      .where(eq(applicationNotes.applicationId, applicationId))
      .orderBy(desc(applicationNotes.createdAt)),
    db
      .select({
        id: applicationStatusHistory.id,
        fromStatus: applicationStatusHistory.fromStatus,
        toStatus: applicationStatusHistory.toStatus,
        note: applicationStatusHistory.note,
        createdAt: applicationStatusHistory.createdAt,
        changedByName: profiles.fullName,
      })
      .from(applicationStatusHistory)
      .leftJoin(
        profiles,
        eq(applicationStatusHistory.changedById, profiles.id),
      )
      .where(eq(applicationStatusHistory.applicationId, applicationId))
      .orderBy(desc(applicationStatusHistory.createdAt)),
  ]);

  const status = row.application.status as ApplicationStatus;

  return {
    application: row.application,
    jobTitle: row.jobTitle,
    jobSlug: row.jobSlug,
    education: educationRows,
    skills: skillRows,
    notes: noteRows,
    statusHistory: historyRows.map((event) => ({
      id: event.id,
      fromStatus: event.fromStatus as ApplicationStatus | null,
      toStatus: event.toStatus as ApplicationStatus,
      note: event.note,
      createdAt: event.createdAt,
      changedByName: event.changedByName,
    })),
    allowedTransitions: getAllowedStatusTransitions(status),
  };
}

export async function updateApplicationStatus(input: {
  applicationId: string;
  toStatus: ApplicationStatus;
  note?: string;
  actorId: string;
}): Promise<Application> {
  const application = await getApplicationById(input.applicationId);

  if (!application) {
    throw applicationNotFoundError();
  }

  const fromStatus = application.status as ApplicationStatus;
  const toStatus = input.toStatus;

  if (!canTransitionApplicationStatus(fromStatus, toStatus)) {
    throw invalidApplicationTransitionError(fromStatus, toStatus);
  }

  const trimmedNote = input.note?.trim() || null;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(applications)
      .set({ status: toStatus })
      .where(eq(applications.id, input.applicationId))
      .returning();

    if (!updated) {
      throw applicationNotFoundError();
    }

    await tx.insert(applicationStatusHistory).values({
      applicationId: input.applicationId,
      fromStatus,
      toStatus,
      changedById: input.actorId,
      note: trimmedNote,
    });

    if (trimmedNote) {
      await tx.insert(applicationNotes).values({
        applicationId: input.applicationId,
        authorId: input.actorId,
        body: trimmedNote,
      });
    }

    return updated;
  });
}

export async function addApplicationNote(input: {
  applicationId: string;
  body: string;
  authorId: string;
}): Promise<HrApplicationNote> {
  const application = await getApplicationById(input.applicationId);

  if (!application) {
    throw applicationNotFoundError();
  }

  const body = input.body.trim();

  const [created] = await db
    .insert(applicationNotes)
    .values({
      applicationId: input.applicationId,
      authorId: input.authorId,
      body,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create note");
  }

  const [author] = await db
    .select({ fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, input.authorId))
    .limit(1);

  return {
    id: created.id,
    body: created.body,
    createdAt: created.createdAt,
    authorName: author?.fullName ?? null,
  };
}

export async function submitApplication(input: {
  jobSlug: string;
  data: ApplicationFormInput;
  resume: File;
}): Promise<{ application: Application; job: PublishedJobDetail }> {
  const validatedResume = await validateResumeFile(input.resume);
  const extracted = await extractPdfText(validatedResume.bytes);
  const job = await getPublishedJobBySlug(input.jobSlug);

  if (!job) {
    throw applicationNotAllowedError();
  }

  let application: Application;

  try {
    application = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(applications)
        .values({
          jobId: job.id,
          fullName: input.data.fullName,
          email: input.data.email.toLowerCase(),
          phone: input.data.phone ?? null,
          coverLetter: input.data.coverLetter ?? null,
          linkedinUrl: input.data.linkedinUrl ?? null,
          portfolioUrl: input.data.portfolioUrl ?? null,
          currentTitle: input.data.currentTitle ?? null,
          yearsOfExperience: input.data.yearsOfExperience ?? null,
          workExperience: input.data.workExperience,
          status: APPLICATION_STATUS.SUBMITTED,
          source: "careers_portal",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create application");
      }

      await tx.insert(applicationStatusHistory).values({
        applicationId: created.id,
        fromStatus: null,
        toStatus: APPLICATION_STATUS.SUBMITTED,
        changedById: null,
        note: "Application submitted via careers portal",
      });

      await tx.insert(applicationEducation).values(
        input.data.education.map((entry, index) => ({
          applicationId: created.id,
          institution: entry.institution,
          degree: entry.degree ?? null,
          fieldOfStudy: entry.fieldOfStudy ?? null,
          educationLevel: entry.educationLevel ?? null,
          startDate: entry.startDate ?? null,
          endDate: entry.isCurrent ? null : (entry.endDate ?? null),
          isCurrent: entry.isCurrent,
          grade: entry.grade ?? null,
          sortOrder: index,
        })),
      );

      const resolvedSkills = await resolveApplicationSkills(
        tx,
        input.data.skills,
      );

      if (resolvedSkills.length > 0) {
        await tx.insert(applicationSkills).values(
          resolvedSkills.map((skill) => ({
            applicationId: created.id,
            skillId: skill.skillId,
            proficiency: skill.proficiency,
          })),
        );
      }

      return created;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw duplicateApplicationError();
    }

    throw error;
  }

  const storagePath = buildResumeStoragePath({
    jobId: job.id,
    applicationId: application.id,
  });

  try {
    await uploadResumeObject({
      path: storagePath,
      bytes: validatedResume.bytes,
      contentType: validatedResume.mimeType,
    });

    const [updated] = await db
      .update(applications)
      .set({
        resumePath: storagePath,
        resumeFileName: validatedResume.fileName,
        resumeText: extracted.text.length > 0 ? extracted.text : null,
      })
      .where(eq(applications.id, application.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to save resume path");
    }

    return { application: updated, job };
  } catch (error) {
    await deleteResumeObject(storagePath).catch(() => undefined);
    await db
      .delete(applications)
      .where(eq(applications.id, application.id))
      .catch(() => undefined);
    throw error;
  }
}
