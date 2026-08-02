import { z } from "zod";

import { APPLICATION_STATUS } from "@/constants/application-status";
import { SKILL_CATEGORIES } from "@/constants/skill-category";
import { EDUCATION_LEVELS } from "@/constants/education-level";
import { EMPLOYMENT_STATUSES } from "@/constants/employment-status";

const educationLevelValues = [
  EDUCATION_LEVELS.HIGH_SCHOOL,
  EDUCATION_LEVELS.ASSOCIATE,
  EDUCATION_LEVELS.BACHELOR,
  EDUCATION_LEVELS.MASTER,
  EDUCATION_LEVELS.DOCTORATE,
  EDUCATION_LEVELS.OTHER,
] as const;

const employmentStatusValues = [
  EMPLOYMENT_STATUSES.EMPLOYED,
  EMPLOYMENT_STATUSES.UNEMPLOYED,
  EMPLOYMENT_STATUSES.FREELANCE,
  EMPLOYMENT_STATUSES.STUDENT,
  EMPLOYMENT_STATUSES.OTHER,
] as const;

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url("Enter a valid URL").optional());

const requiredPhone = z
  .string()
  .trim()
  .min(7, "Phone number looks too short")
  .max(30, "Phone number is too long");

const requiredYears = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === undefined || value === "") {
      ctx.addIssue({
        code: "custom",
        message: "Years of experience is required",
      });
      return z.NEVER;
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
    graduationYear: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      const n = typeof value === "number" ? value : Number(String(value).trim());
      return Number.isFinite(n) ? n : value;
    }, z.number().int().min(1950).max(2100).optional()),
    isCurrent: z.boolean().default(false),
    grade: z
      .string()
      .trim()
      .max(40, "Grade is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((entry, ctx) => {
    if (!entry.isCurrent && entry.graduationYear == null && !entry.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["graduationYear"],
        message: "Graduation year is required (or mark as currently studying)",
      });
    }

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

const skillCategoryValues = [
  SKILL_CATEGORIES.TECHNICAL,
  SKILL_CATEGORIES.SOFTWARE,
  SKILL_CATEGORIES.LANGUAGES,
  SKILL_CATEGORIES.AI_TOOLS,
  SKILL_CATEGORIES.SOFT_SKILLS,
  SKILL_CATEGORIES.OTHER,
] as const;

export const skillEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(60, "Skill name is too long"),
  category: z.enum(skillCategoryValues, {
    message: "Select a skill category",
  }),
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
  phone: requiredPhone,
  currentLocation: z
    .string()
    .trim()
    .min(1, "Current location is required")
    .max(120, "Location is too long"),
  currentTitle: z
    .string()
    .trim()
    .min(1, "Current job title is required")
    .max(120, "Title is too long"),
  currentCompany: z
    .string()
    .trim()
    .max(120, "Company name is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  githubUrl: optionalUrl,
  yearsOfExperience: requiredYears,
  expectedSalary: z
    .string()
    .trim()
    .max(80, "Expected salary is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
  noticePeriod: z
    .string()
    .trim()
    .min(1, "Notice period is required")
    .max(80, "Notice period is too long"),
  employmentStatus: z.enum(employmentStatusValues, {
    message: "Select your employment status",
  }),
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
  interestReason: z
    .string()
    .trim()
    .min(1, "Tell us why you are interested")
    .max(4000, "Response is too long"),
  whyConsider: z
    .string()
    .trim()
    .min(1, "Tell us why we should consider you")
    .max(4000, "Response is too long"),
  willingOnsite: z.boolean(),
  availableJoinDate: z
    .string()
    .trim()
    .min(1, "Available joining date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
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

export const assignApplicationSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
  assigneeId: z
    .string()
    .uuid("Invalid assignee")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export const setApplicationArchivedSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
  archived: z.boolean(),
});

export const deleteApplicationSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
});

export const decideAiShortlistSchema = z.object({
  applicationId: z.string().uuid("Invalid application id"),
  decision: z.enum(["accept", "reject"]),
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
  location: z.string().trim().max(100).optional().transform(emptyToUndefined),
  skill: z.string().trim().max(60).optional().transform(emptyToUndefined),
  qualification: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform(emptyToUndefined),
  graduationYear: optionalIntParam(1950, 2100),
  includeArchived: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }
    if (typeof value === "boolean") {
      return value;
    }
    const normalized = String(value).trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "on";
  }, z.boolean().default(false)),
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
