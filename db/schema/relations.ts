import { relations } from "drizzle-orm";

import { profiles } from "./profiles";
import { skills } from "./skills";
import { jobs } from "./jobs";
import { jobShortlistingCriteria } from "./job-shortlisting-criteria";
import { applications } from "./applications";
import { applicationEducation } from "./application-education";
import { applicationSkills } from "./application-skills";
import { applicationNotes } from "./application-notes";
import { aiAnalyses } from "./ai-analyses";

export const profilesRelations = relations(profiles, ({ many }) => ({
  postedJobs: many(jobs),
  applications: many(applications),
  authoredNotes: many(applicationNotes),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  applicationSkills: many(applicationSkills),
  criteria: many(jobShortlistingCriteria),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  createdBy: one(profiles, {
    fields: [jobs.createdById],
    references: [profiles.id],
  }),
  applications: many(applications),
  shortlistingCriteria: many(jobShortlistingCriteria),
}));

export const jobShortlistingCriteriaRelations = relations(
  jobShortlistingCriteria,
  ({ one }) => ({
    job: one(jobs, {
      fields: [jobShortlistingCriteria.jobId],
      references: [jobs.id],
    }),
    skill: one(skills, {
      fields: [jobShortlistingCriteria.skillId],
      references: [skills.id],
    }),
  }),
);

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    job: one(jobs, {
      fields: [applications.jobId],
      references: [jobs.id],
    }),
    candidate: one(profiles, {
      fields: [applications.candidateId],
      references: [profiles.id],
    }),
    education: many(applicationEducation),
    skills: many(applicationSkills),
    notes: many(applicationNotes),
    aiAnalyses: many(aiAnalyses),
  }),
);

export const applicationEducationRelations = relations(
  applicationEducation,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationEducation.applicationId],
      references: [applications.id],
    }),
  }),
);

export const applicationSkillsRelations = relations(
  applicationSkills,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationSkills.applicationId],
      references: [applications.id],
    }),
    skill: one(skills, {
      fields: [applicationSkills.skillId],
      references: [skills.id],
    }),
  }),
);

export const applicationNotesRelations = relations(
  applicationNotes,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationNotes.applicationId],
      references: [applications.id],
    }),
    author: one(profiles, {
      fields: [applicationNotes.authorId],
      references: [profiles.id],
    }),
  }),
);

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  application: one(applications, {
    fields: [aiAnalyses.applicationId],
    references: [applications.id],
  }),
}));
