"use client";

import {
  cloneElement,
  useState,
  useTransition,
  type ReactElement,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { InlineAlert } from "@/components/layouts/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EDUCATION_LEVEL_LABELS,
  EDUCATION_LEVELS,
  type EducationLevel,
} from "@/constants/education-level";
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUSES,
} from "@/constants/employment-status";
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  type SkillCategory,
} from "@/constants/skill-category";
import { careersApplySuccessPath } from "@/constants/routes";
import { submitApplicationAction } from "@/features/applications/actions/application.actions";
import {
  applicationFormSchema,
  type ApplicationFormInput,
  type ApplicationFormValues,
} from "@/schemas/applications";
import { UPLOAD_CONSTRAINTS, validatePdfFileMeta } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const educationLevelOptions = Object.values(EDUCATION_LEVELS);
const employmentStatusOptions = Object.values(EMPLOYMENT_STATUSES);
const skillCategoryOptions = Object.values(SKILL_CATEGORIES);

const emptyEducation = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  educationLevel: "" as const,
  startDate: "",
  endDate: "",
  graduationYear: undefined as number | undefined,
  isCurrent: false,
  grade: "",
};

const emptySkill = {
  name: "",
  category: SKILL_CATEGORIES.TECHNICAL as SkillCategory,
  proficiency: "",
};

type ApplicationFormProps = {
  jobSlug: string;
  jobTitle: string;
};

export function ApplicationForm({ jobSlug, jobTitle }: ApplicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | undefined>();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ApplicationFormValues, unknown, ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      currentLocation: "",
      currentTitle: "",
      currentCompany: "",
      linkedinUrl: "",
      portfolioUrl: "",
      githubUrl: "",
      yearsOfExperience: undefined,
      expectedSalary: "",
      noticePeriod: "",
      employmentStatus: EMPLOYMENT_STATUSES.EMPLOYED,
      education: [{ ...emptyEducation }],
      skills: [{ ...emptySkill }],
      workExperience: "",
      interestReason: "",
      whyConsider: "",
      willingOnsite: false,
      availableJoinDate: "",
      coverLetter: "",
    },
  });

  const educationFields = useFieldArray({ control, name: "education" });
  const skillFields = useFieldArray({ control, name: "skills" });

  function onResumeChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    setResumeError(undefined);

    if (!file) {
      setResumeFile(null);
      return;
    }

    const meta = validatePdfFileMeta({
      mimeType: file.type,
      sizeBytes: file.size,
      fileName: file.name,
    });

    if (!meta.valid) {
      setResumeFile(null);
      setResumeError(meta.reason);
      toast.error(meta.reason);
      return;
    }

    setResumeFile(file);
  }

  const onSubmit = handleSubmit((values) => {
    if (!resumeFile) {
      setResumeError("Resume PDF is required");
      toast.error("Please attach a PDF resume");
      return;
    }

    startTransition(async () => {
      const result = await submitApplicationAction(jobSlug, values, resumeFile);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.[0]) {
            continue;
          }

          if (field === "resume") {
            setResumeError(messages[0]);
            continue;
          }

          setError(field as keyof ApplicationFormValues, {
            message: messages[0],
          });
        }
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Application submitted");
      router.push(careersApplySuccessPath(jobSlug));
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-10"
      noValidate
      aria-busy={isPending}
    >
      <FormSection
        title="Personal information"
        description="How we can reach you about this role."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="fullName"
            required
            error={errors.fullName?.message}
            className="sm:col-span-2"
          >
            <Input
              id="fullName"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              disabled={isPending}
              {...register("fullName")}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              disabled={isPending}
              {...register("email")}
            />
          </Field>

          <Field
            label="Phone"
            htmlFor="phone"
            required
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.phone)}
              disabled={isPending}
              {...register("phone")}
            />
          </Field>

          <Field
            label="Current location"
            htmlFor="currentLocation"
            required
            error={errors.currentLocation?.message}
            className="sm:col-span-2"
          >
            <Input
              id="currentLocation"
              autoComplete="address-level2"
              placeholder="City, country"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.currentLocation)}
              disabled={isPending}
              {...register("currentLocation")}
            />
          </Field>

          <Field
            label="LinkedIn URL"
            htmlFor="linkedinUrl"
            optional
            error={errors.linkedinUrl?.message}
          >
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/…"
              aria-invalid={Boolean(errors.linkedinUrl)}
              disabled={isPending}
              {...register("linkedinUrl")}
            />
          </Field>

          <Field
            label="Portfolio URL"
            htmlFor="portfolioUrl"
            optional
            error={errors.portfolioUrl?.message}
          >
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://"
              aria-invalid={Boolean(errors.portfolioUrl)}
              disabled={isPending}
              {...register("portfolioUrl")}
            />
          </Field>

          <Field
            label="GitHub URL"
            htmlFor="githubUrl"
            optional
            error={errors.githubUrl?.message}
            className="sm:col-span-2"
          >
            <Input
              id="githubUrl"
              type="url"
              placeholder="https://github.com/…"
              aria-invalid={Boolean(errors.githubUrl)}
              disabled={isPending}
              {...register("githubUrl")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Professional information"
        description="Your current role, experience, and availability."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Current job title"
            htmlFor="currentTitle"
            required
            error={errors.currentTitle?.message}
          >
            <Input
              id="currentTitle"
              placeholder="Frontend Engineer"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.currentTitle)}
              disabled={isPending}
              {...register("currentTitle")}
            />
          </Field>

          <Field
            label="Current company"
            htmlFor="currentCompany"
            optional
            error={errors.currentCompany?.message}
          >
            <Input
              id="currentCompany"
              placeholder="Company name"
              aria-invalid={Boolean(errors.currentCompany)}
              disabled={isPending}
              {...register("currentCompany")}
            />
          </Field>

          <Field
            label="Years of experience"
            htmlFor="yearsOfExperience"
            required
            error={errors.yearsOfExperience?.message}
          >
            <Input
              id="yearsOfExperience"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              placeholder="4"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.yearsOfExperience)}
              disabled={isPending}
              {...register("yearsOfExperience")}
            />
          </Field>

          <Field
            label="Expected salary"
            htmlFor="expectedSalary"
            optional
            error={errors.expectedSalary?.message}
          >
            <Input
              id="expectedSalary"
              placeholder="e.g. 80,000 USD / year"
              aria-invalid={Boolean(errors.expectedSalary)}
              disabled={isPending}
              {...register("expectedSalary")}
            />
          </Field>

          <Field
            label="Notice period"
            htmlFor="noticePeriod"
            required
            error={errors.noticePeriod?.message}
          >
            <Input
              id="noticePeriod"
              placeholder="e.g. Immediate, 30 days"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.noticePeriod)}
              disabled={isPending}
              {...register("noticePeriod")}
            />
          </Field>

          <Field
            label="Employment status"
            htmlFor="employmentStatus"
            required
            error={errors.employmentStatus?.message}
          >
            <select
              id="employmentStatus"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.employmentStatus) || undefined}
              disabled={isPending}
              className={cn(
                "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              {...register("employmentStatus")}
            >
              {employmentStatusOptions.map((value) => (
                <option key={value} value={value}>
                  {EMPLOYMENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Resume"
        description={`PDF only, max ${UPLOAD_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024)} MB. Stored privately — not publicly accessible.`}
      >
        <div className="min-w-0 space-y-2.5">
          <Label htmlFor="resume" className="gap-1 leading-snug">
            <span>Resume</span>
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </Label>
          <input
            id="resume"
            type="file"
            accept="application/pdf,.pdf"
            required
            aria-required="true"
            aria-invalid={Boolean(resumeError) || undefined}
            aria-describedby={resumeError ? "resume-error" : undefined}
            disabled={isPending}
            className={cn(
              "block w-full min-w-0 cursor-pointer rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors",
              "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
              "disabled:cursor-not-allowed disabled:opacity-50",
              resumeError && "border-destructive ring-3 ring-destructive/20",
            )}
            onChange={(event) => onResumeChange(event.target.files)}
          />
          {resumeFile ? (
            <p className="text-xs text-muted-foreground">
              Selected: {resumeFile.name} (
              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Choose a PDF file to upload with your application.
            </p>
          )}
          {resumeError ? (
            <p
              id="resume-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {resumeError}
            </p>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        title="Education"
        description="Add each school or program separately."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            disabled={isPending || educationFields.fields.length >= 10}
            onClick={() => educationFields.append({ ...emptyEducation })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add education
          </Button>
        }
      >
        {errors.education?.message || errors.education?.root?.message ? (
          <InlineAlert>
            {errors.education.message ?? errors.education.root?.message}
          </InlineAlert>
        ) : null}

        <div className="space-y-4">
          {educationFields.fields.map((field, index) => (
            <EducationEntryCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              isPending={isPending}
              canRemove={educationFields.fields.length > 1}
              onRemove={() => educationFields.remove(index)}
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Skills"
        description="Add skills by category (technical, software & platforms, programming languages, AI-related, and more)."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            disabled={isPending || skillFields.fields.length >= 30}
            onClick={() => skillFields.append({ ...emptySkill })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add skill
          </Button>
        }
      >
        {errors.skills?.message || errors.skills?.root?.message ? (
          <InlineAlert>
            {errors.skills.message ?? errors.skills.root?.message}
          </InlineAlert>
        ) : null}

        <div className="space-y-4">
          {skillFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-xl border border-border bg-muted/20 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Skill {index + 1}</p>
                {skillFields.fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove skill ${index + 1}`}
                    disabled={isPending}
                    onClick={() => skillFields.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="Category"
                  htmlFor={`skill-${index}-category`}
                  required
                  error={errors.skills?.[index]?.category?.message}
                >
                  <select
                    id={`skill-${index}-category`}
                    required
                    aria-required="true"
                    disabled={isPending}
                    className={cn(
                      "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors",
                      "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
                    )}
                    {...register(`skills.${index}.category`)}
                  >
                    {skillCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {SKILL_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Skill"
                  htmlFor={`skill-${index}-name`}
                  required
                  error={errors.skills?.[index]?.name?.message}
                >
                  <Input
                    id={`skill-${index}-name`}
                    placeholder="TypeScript"
                    required
                    aria-required="true"
                    disabled={isPending}
                    {...register(`skills.${index}.name`)}
                  />
                </Field>

                <Field
                  label="Proficiency"
                  htmlFor={`skill-${index}-proficiency`}
                  optional
                  error={errors.skills?.[index]?.proficiency?.message}
                >
                  <Input
                    id={`skill-${index}-proficiency`}
                    placeholder="Advanced"
                    disabled={isPending}
                    {...register(`skills.${index}.proficiency`)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Experience"
        description={`Summarize work that relates to ${jobTitle}.`}
      >
        <Field
          label="Relevant experience"
          htmlFor="workExperience"
          required
          error={errors.workExperience?.message}
        >
          <Textarea
            id="workExperience"
            placeholder="Roles, projects, impact, and tools you’ve used…"
            className="min-h-36"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.workExperience)}
            disabled={isPending}
            {...register("workExperience")}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Additional questions"
        description="Help us understand fit, availability, and motivation for this role."
      >
        <div className="space-y-5">
          <Field
            label="Why are you interested in this position?"
            htmlFor="interestReason"
            required
            error={errors.interestReason?.message}
          >
            <Textarea
              id="interestReason"
              placeholder="What draws you to this role and HireFlow?"
              className="min-h-28"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.interestReason)}
              disabled={isPending}
              {...register("interestReason")}
            />
          </Field>

          <Field
            label="Why should we consider you?"
            htmlFor="whyConsider"
            required
            error={errors.whyConsider?.message}
          >
            <Textarea
              id="whyConsider"
              placeholder="Relevant strengths, outcomes, or experience for this role."
              className="min-h-28"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.whyConsider)}
              disabled={isPending}
              {...register("whyConsider")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Available joining date"
              htmlFor="availableJoinDate"
              required
              error={errors.availableJoinDate?.message}
            >
              <Input
                id="availableJoinDate"
                type="date"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.availableJoinDate)}
                disabled={isPending}
                {...register("availableJoinDate")}
              />
            </Field>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  disabled={isPending}
                  {...register("willingOnsite")}
                />
                Willing to work on-site
              </label>
            </div>
          </div>

          <Field
            label="Additional notes"
            htmlFor="coverLetter"
            optional
            error={errors.coverLetter?.message}
          >
            <Textarea
              id="coverLetter"
              placeholder="Optional — anything else we should know."
              className="min-h-24"
              aria-invalid={Boolean(errors.coverLetter)}
              disabled={isPending}
              {...register("coverLetter")}
            />
          </Field>
        </div>
      </FormSection>

      {errors.root?.message ? (
        <InlineAlert>{errors.root.message}</InlineAlert>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}

function EducationEntryCard({
  index,
  control,
  register,
  errors,
  isPending,
  canRemove,
  onRemove,
}: {
  index: number;
  control: Control<ApplicationFormValues, unknown, ApplicationFormInput>;
  register: UseFormRegister<ApplicationFormValues>;
  errors: FieldErrors<ApplicationFormValues>;
  isPending: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const isCurrent = useWatch({
    control,
    name: `education.${index}.isCurrent`,
  });

  return (
    <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Education {index + 1}</p>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove education ${index + 1}`}
            disabled={isPending}
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Institution"
          htmlFor={`education-${index}-institution`}
          required
          error={errors.education?.[index]?.institution?.message}
          className="sm:col-span-2"
        >
          <Input
            id={`education-${index}-institution`}
            required
            aria-required="true"
            disabled={isPending}
            {...register(`education.${index}.institution`)}
          />
        </Field>

        <Field
          label="Degree"
          htmlFor={`education-${index}-degree`}
          optional
          error={errors.education?.[index]?.degree?.message}
        >
          <Input
            id={`education-${index}-degree`}
            disabled={isPending}
            {...register(`education.${index}.degree`)}
          />
        </Field>

        <Field
          label="Field of study"
          htmlFor={`education-${index}-field`}
          optional
          error={errors.education?.[index]?.fieldOfStudy?.message}
        >
          <Input
            id={`education-${index}-field`}
            disabled={isPending}
            {...register(`education.${index}.fieldOfStudy`)}
          />
        </Field>

        <Field
          label="Education level"
          htmlFor={`education-${index}-level`}
          optional
          error={errors.education?.[index]?.educationLevel?.message}
        >
          <select
            id={`education-${index}-level`}
            className={selectClassName}
            disabled={isPending}
            {...register(`education.${index}.educationLevel`)}
          >
            <option value="">Select level</option>
            {educationLevelOptions.map((value) => (
              <option key={value} value={value}>
                {EDUCATION_LEVEL_LABELS[value as EducationLevel]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Grade / GPA"
          htmlFor={`education-${index}-grade`}
          optional
          error={errors.education?.[index]?.grade?.message}
        >
          <Input
            id={`education-${index}-grade`}
            disabled={isPending}
            {...register(`education.${index}.grade`)}
          />
        </Field>

        <Field
          label="Graduation year"
          htmlFor={`education-${index}-grad-year`}
          required={!isCurrent}
          optional={Boolean(isCurrent)}
          error={errors.education?.[index]?.graduationYear?.message}
        >
          <Input
            id={`education-${index}-grad-year`}
            type="number"
            min={1950}
            max={2100}
            step={1}
            placeholder="2024"
            disabled={isPending || Boolean(isCurrent)}
            {...register(`education.${index}.graduationYear`)}
          />
        </Field>

        <Field
          label="Start date"
          htmlFor={`education-${index}-start`}
          optional
          error={errors.education?.[index]?.startDate?.message}
        >
          <Input
            id={`education-${index}-start`}
            type="date"
            className="min-w-0"
            disabled={isPending}
            {...register(`education.${index}.startDate`)}
          />
        </Field>

        <Field
          label="Exact end date"
          htmlFor={`education-${index}-end`}
          optional
          error={errors.education?.[index]?.endDate?.message}
        >
          <Input
            id={`education-${index}-end`}
            type="date"
            className="min-w-0"
            disabled={isPending || Boolean(isCurrent)}
            {...register(`education.${index}.endDate`)}
          />
        </Field>

        <label className="flex items-start gap-2.5 text-sm leading-snug sm:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-input"
            disabled={isPending}
            {...register(`education.${index}.isCurrent`)}
          />
          Currently studying here
        </label>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
  required = false,
  optional = false,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
  required?: boolean;
  optional?: boolean;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className={cn("min-w-0 space-y-2.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="flex flex-wrap items-center gap-x-1 gap-y-0.5 leading-snug"
      >
        <span>{label}</span>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(required)</span> : null}
        {optional ? (
          <span className="font-normal text-muted-foreground">(optional)</span>
        ) : null}
      </Label>
      {error
        ? cloneElement(children, { "aria-describedby": errorId })
        : children}
      {error ? (
        <p id={errorId} className="text-sm leading-snug text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const selectClassName = cn(
  "h-10 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
