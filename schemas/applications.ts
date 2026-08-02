import { z } from "zod";

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
