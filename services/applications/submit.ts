import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  applicationEducation,
  applicationSkills,
  applicationStatusHistory,
  applications,
} from "@/db/schema";
import { APPLICATION_STATUS } from "@/constants/application-status";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { validateResumeFile } from "@/lib/uploads";
import type { ApplicationFormInput } from "@/schemas/applications";
import {
  applicationNotAllowedError,
  duplicateApplicationError,
  isUniqueViolation,
} from "@/services/applications/errors";
import { resolveApplicationSkills } from "@/services/applications/skills";
import type { Application } from "@/services/applications/types";
import {
  getPublishedJobBySlug,
  type PublishedJobDetail,
} from "@/services/jobs";
import {
  buildResumeStoragePath,
  deleteResumeObject,
  uploadResumeObject,
} from "@/services/storage";

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
