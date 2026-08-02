import { z } from "zod";

import { APPLICATION_STATUS } from "@/constants/application-status";
import { EDUCATION_LEVELS } from "@/constants/education-level";

const educationLevelValues = [
  EDUCATION_LEVELS.HIGH_SCHOOL,
  EDUCATION_LEVELS.ASSOCIATE,
  EDUCATION_LEVELS.BACHELOR,
  EDUCATION_LEVELS.MASTER,
  EDUCATION_LEVELS.DOCTORATE,
  EDUCATION_LEVELS.OTHER,
] as const;

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url("Enter a valid URL").optional());

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .min(7, "Phone number looks too short")
      .max(30, "Phone number is too long")
      .optional(),
  );

const optionalYears = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    const parsed = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Years of experience must be a whole number",
      });
      return z.NEVER;
    }

    if (parsed < 0 || parsed > 60) {
      ctx.addIssue({
        code: "custom",
        message: "Enter years between 0 and 60",
      });
      return z.NEVER;
    }

    return parsed;
  });

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
      .optional(),
  );

export const educationEntrySchema = z
  .object({
    institution: z
      .string()
      .trim()
      .min(1, "Institution is required")
      .max(120, "Institution name is too long"),
    degree: z
      .string()
      .trim()
      .max(120, "Degree is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
    fieldOfStudy: z
      .string()
      .trim()
      .max(120, "Field of study is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
    educationLevel: z
      .enum(educationLevelValues)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    startDate: optionalDate,
    endDate: optionalDate,
    isCurrent: z.boolean().default(false),
    grade: z
      .string()
      .trim()
      .max(40, "Grade is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((entry, ctx) => {
    if (
      !entry.isCurrent &&
      entry.startDate &&
      entry.endDate &&
      entry.endDate < entry.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

export const skillEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(60, "Skill name is too long"),
  proficiency: z
    .string()
    .trim()
    .max(40, "Proficiency is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const applicationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(254, "Email is too long"),
  phone: optionalPhone,
  currentTitle: z
    .string()
    .trim()
    .max(120, "Title is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  yearsOfExperience: optionalYears,
  education: z
    .array(educationEntrySchema)
    .min(1, "Add at least one education entry")
    .max(10, "You can add up to 10 education entries"),
  skills: z
    .array(skillEntrySchema)
    .min(1, "Add at least one skill")
    .max(30, "You can add up to 30 skills"),
  workExperience: z
    .string()
    .trim()
    .min(1, "Experience is required")
    .max(8000, "Experience is too long"),
  coverLetter: z
    .string()
    .trim()
    .max(8000, "Response is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type ApplicationFormValues = z.input<typeof applicationFormSchema>;
export type ApplicationFormInput = z.output<typeof applicationFormSchema>;

const applicationStatusValues = [
  APPLICATION_STATUS.SUBMITTED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.ON_HOLD,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.WITHDRAWN,
] as const;

export const applicationIdSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
  status: z.enum(applicationStatusValues, {
    message: "Select a valid status",
  }),
  note: z
    .string()
    .trim()
    .max(4000, "Note is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const addApplicationNoteSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
  body: z
    .string()
    .trim()
    .min(1, "Note is required")
    .max(4000, "Note is too long"),
});

export type UpdateApplicationStatusInput = z.output<
  typeof updateApplicationStatusSchema
>;
export type AddApplicationNoteInput = z.output<typeof addApplicationNoteSchema>;

const emptyToUndefined = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const optionalIntParam = (min: number, max: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    const n = typeof value === "number" ? value : Number(String(value).trim());
    return Number.isFinite(n) ? n : value;
  }, z.number().int().min(min).max(max).optional());

const optionalScoreParam = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : value;
}, z.number().min(0).max(100).optional());

export const HR_APPLICATIONS_SORT_FIELDS = [
  "createdAt",
  "aiScore",
  "experience",
  "name",
] as const;

export type HrApplicationsSortField =
  (typeof HR_APPLICATIONS_SORT_FIELDS)[number];

/** URL search params for HR applications list (server-side filters). */
export const hrApplicationsSearchParamsSchema = z.object({
  name: z.string().trim().max(100).optional().transform(emptyToUndefined),
  email: z.string().trim().max(100).optional().transform(emptyToUndefined),
  jobId: z
    .string()
    .trim()
    .optional()
    .transform(emptyToUndefined)
    .pipe(z.string().uuid().optional()),
  status: z
    .string()
    .trim()
    .optional()
    .transform(emptyToUndefined)
    .pipe(z.enum(applicationStatusValues).optional()),
  scoreMin: optionalScoreParam,
  scoreMax: optionalScoreParam,
  experienceMin: optionalIntParam(0, 60),
  experienceMax: optionalIntParam(0, 60),
  dateFrom: optionalDate,
  dateTo: optionalDate,
  page: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return 1;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : 1;
  }, z.number().int().min(1).default(1)),
  pageSize: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return 20;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : 20;
  }, z.number().int().min(5).max(50).default(20)),
  sort: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return "createdAt";
    }
    return value;
  }, z.enum(HR_APPLICATIONS_SORT_FIELDS).default("createdAt")),
  order: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return "desc";
    }
    return value;
  }, z.enum(["asc", "desc"]).default("desc")),
});

export type HrApplicationsSearchParams = z.output<
  typeof hrApplicationsSearchParamsSchema
>;
