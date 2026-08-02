import { z } from "zod";

import { EMPLOYMENT_TYPES } from "@/constants/employment-type";

const employmentTypeValues = [
  EMPLOYMENT_TYPES.FULL_TIME,
  EMPLOYMENT_TYPES.PART_TIME,
  EMPLOYMENT_TYPES.CONTRACT,
  EMPLOYMENT_TYPES.INTERNSHIP,
] as const;

const optionalSalaryAmount = z
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
        message: "Salary must be a whole number",
      });
      return z.NEVER;
    }

    if (parsed < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Salary cannot be negative",
      });
      return z.NEVER;
    }

    return parsed;
  });

export const jobFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(120, "Title must be 120 characters or less"),
    department: z
      .string()
      .trim()
      .min(1, "Department is required")
      .max(80, "Department must be 80 characters or less"),
    employmentType: z.enum(employmentTypeValues, {
      message: "Select an employment type",
    }),
    experience: z
      .string()
      .trim()
      .min(1, "Experience is required")
      .max(80, "Experience must be 80 characters or less"),
    location: z
      .string()
      .trim()
      .min(1, "Location is required")
      .max(120, "Location must be 120 characters or less"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(10000, "Description is too long"),
    requirements: z
      .string()
      .trim()
      .min(1, "Requirements are required")
      .max(10000, "Requirements are too long"),
    salaryMin: optionalSalaryAmount,
    salaryMax: optionalSalaryAmount,
    salaryCurrency: z
      .string()
      .trim()
      .max(3, "Currency code must be 3 letters")
      .optional()
      .transform((value) => {
        if (!value) {
          return undefined;
        }
        return value.toUpperCase();
      })
      .refine((value) => value === undefined || value.length === 3, {
        message: "Currency code must be 3 letters",
      }),
  })
  .superRefine((data, ctx) => {
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMin > data.salaryMax
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Max salary must be greater than or equal to min salary",
      });
    }
  });

/** Form field values (pre-transform). */
export type JobFormValues = z.input<typeof jobFormSchema>;

/** Validated payload after Zod transforms. */
export type JobFormInput = z.output<typeof jobFormSchema>;

export const jobIdSchema = z.object({
  jobId: z.string().uuid("Invalid job id"),
});

const criterionTypeValues = [
  "skill",
  "experience_years",
  "education_level",
  "keyword",
  "custom",
] as const;

const educationLevelValues = [
  "high_school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
  "other",
] as const;

const optionalCriterionNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === "") {
      return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid non-negative number",
      });
      return z.NEVER;
    }
    return parsed;
  });

export const jobShortlistingCriterionSchema = z
  .object({
    type: z.enum(criterionTypeValues, { message: "Select a criterion type" }),
    label: z
      .string()
      .trim()
      .min(1, "Label is required")
      .max(120, "Label must be 120 characters or less"),
    description: z
      .string()
      .trim()
      .max(500, "Description is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
    valueText: z
      .string()
      .trim()
      .max(500, "Value is too long")
      .optional()
      .transform((value) => (value ? value : undefined)),
    valueNumber: optionalCriterionNumber,
    educationLevel: z
      .union([z.enum(educationLevelValues), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
    weight: z
      .union([z.string(), z.number()])
      .optional()
      .transform((value) => {
        if (value === undefined || value === "") {
          return 1;
        }
        const parsed = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) {
          return 1;
        }
        return Math.min(10, Math.round(parsed));
      }),
    isRequired: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === "experience_years" && data.valueNumber === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["valueNumber"],
        message: "Enter minimum years",
      });
    }
    if (data.type === "education_level" && !data.educationLevel) {
      ctx.addIssue({
        code: "custom",
        path: ["educationLevel"],
        message: "Select an education level",
      });
    }
    if (
      (data.type === "skill" || data.type === "keyword") &&
      !data.valueText &&
      !data.label
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["valueText"],
        message: "Add a value or keep a clear label",
      });
    }
  });

export const jobShortlistingCriteriaFormSchema = z.object({
  jobId: z.string().uuid("Invalid job id"),
  criteria: z
    .array(jobShortlistingCriterionSchema)
    .max(30, "You can add up to 30 criteria"),
});

export type JobShortlistingCriterionValues = z.input<
  typeof jobShortlistingCriterionSchema
>;
export type JobShortlistingCriterionInput = z.output<
  typeof jobShortlistingCriterionSchema
>;
export type JobShortlistingCriteriaFormValues = z.input<
  typeof jobShortlistingCriteriaFormSchema
>;
export type JobShortlistingCriteriaFormInput = z.output<
  typeof jobShortlistingCriteriaFormSchema
>;
