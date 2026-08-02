import { and, asc, desc, eq, inArray } from "drizzle-orm";

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
import type { ApplicationStatus } from "@/constants/application-status";
import { ROLES } from "@/constants/roles";
import {
  applicationNotFoundError,
  assigneeNotFoundError,
  invalidApplicationTransitionError,
} from "@/services/applications/errors";
import { getApplicationById } from "@/services/applications/get-by-id";
import {
  canTransitionApplicationStatus,
  getAllowedStatusTransitions,
} from "@/services/applications/transitions";
import type {
  Application,
  HrApplicationDetail,
  HrApplicationNote,
} from "@/services/applications/types";
import { resumeNotFoundError } from "@/services/storage/errors";
import { createResumeSignedUrl, deleteResumeObject } from "@/services/storage";

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

  const [educationRows, skillRows, noteRows, historyRows, assigneeRow] =
    await Promise.all([
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
        category: skills.category,
        proficiency: applicationSkills.proficiency,
      })
      .from(applicationSkills)
      .innerJoin(skills, eq(applicationSkills.skillId, skills.id))
      .where(eq(applicationSkills.applicationId, applicationId))
      .orderBy(asc(skills.category), asc(skills.name)),
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
    row.application.assignedToId
      ? db
          .select({
            fullName: profiles.fullName,
            email: profiles.email,
          })
          .from(profiles)
          .where(eq(profiles.id, row.application.assignedToId))
          .limit(1)
      : Promise.resolve([] as Array<{ fullName: string; email: string }>),
  ]);

  const status = row.application.status as ApplicationStatus;
  const assignee = assigneeRow[0] ?? null;

  return {
    application: row.application,
    jobTitle: row.jobTitle,
    jobSlug: row.jobSlug,
    assigneeName: assignee?.fullName ?? null,
    assigneeEmail: assignee?.email ?? null,
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

export async function assignApplication(input: {
  applicationId: string;
  assigneeId: string | null;
}): Promise<Application> {
  const application = await getApplicationById(input.applicationId);
  if (!application) {
    throw applicationNotFoundError();
  }

  if (input.assigneeId) {
    const [member] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.id, input.assigneeId),
          inArray(profiles.role, [ROLES.HR, ROLES.ADMIN]),
          eq(profiles.isActive, true),
        ),
      )
      .limit(1);
    if (!member) {
      throw assigneeNotFoundError();
    }
  }

  const [updated] = await db
    .update(applications)
    .set({ assignedToId: input.assigneeId })
    .where(eq(applications.id, input.applicationId))
    .returning();

  if (!updated) {
    throw applicationNotFoundError();
  }

  return updated;
}

export async function setApplicationArchived(input: {
  applicationId: string;
  archived: boolean;
}): Promise<Application> {
  const application = await getApplicationById(input.applicationId);
  if (!application) {
    throw applicationNotFoundError();
  }

  const [updated] = await db
    .update(applications)
    .set({ archivedAt: input.archived ? new Date() : null })
    .where(eq(applications.id, input.applicationId))
    .returning();

  if (!updated) {
    throw applicationNotFoundError();
  }

  return updated;
}

/** Permanently delete an application and its cascaded rows; remove resume object. */
export async function deleteApplication(input: {
  applicationId: string;
}): Promise<void> {
  const application = await getApplicationById(input.applicationId);
  if (!application) {
    throw applicationNotFoundError();
  }

  const resumePath = application.resumePath;

  const deleted = await db
    .delete(applications)
    .where(eq(applications.id, input.applicationId))
    .returning({ id: applications.id });

  if (deleted.length === 0) {
    throw applicationNotFoundError();
  }

  if (resumePath) {
    try {
      await deleteResumeObject(resumePath);
    } catch {
      // Application row is already gone — don't fail the HR action on storage cleanup.
    }
  }
}
