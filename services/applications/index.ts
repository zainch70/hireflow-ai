import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  applicationEducation,
  applicationSkills,
  applications,
  jobs,
  skills,
} from "@/db/schema";
import { APPLICATION_STATUS } from "@/constants/application-status";
import type { ApplicationFormInput } from "@/schemas/applications";
import {
  getPublishedJobBySlug,
  type PublishedJobDetail,
} from "@/services/jobs";
import {
  applicationNotAllowedError,
  duplicateApplicationError,
  isUniqueViolation,
} from "@/services/applications/errors";
import { resumeNotFoundError } from "@/services/storage/errors";
import {
  buildResumeStoragePath,
  createResumeSignedUrl,
  deleteResumeObject,
  uploadResumeObject,
} from "@/services/storage";
import { validateResumeFile } from "@/lib/uploads";
import { slugify } from "@/utils/slug";

export type Application = typeof applications.$inferSelect;

export type HrApplicationListItem = {
  id: string;
  fullName: string;
  email: string;
  status: Application["status"];
  resumePath: string | null;
  resumeFileName: string | null;
  createdAt: Date;
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

export async function submitApplication(input: {
  jobSlug: string;
  data: ApplicationFormInput;
  resume: File;
}): Promise<{ application: Application; job: PublishedJobDetail }> {
  const validatedResume = await validateResumeFile(input.resume);
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
