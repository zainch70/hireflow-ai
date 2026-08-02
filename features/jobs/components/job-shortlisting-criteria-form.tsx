"use client";

import { useTransition, type ReactNode } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { InlineAlert } from "@/components/layouts/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CRITERION_TYPE_HINTS,
  CRITERION_TYPE_LABELS,
  CRITERION_TYPES,
  type CriterionType,
} from "@/constants/criterion-type";
import {
  EDUCATION_LEVEL_LABELS,
  EDUCATION_LEVELS,
} from "@/constants/education-level";
import { saveJobShortlistingCriteriaAction } from "@/features/jobs/actions/criteria.actions";
import {
  jobShortlistingCriteriaFormSchema,
  type JobShortlistingCriteriaFormInput,
  type JobShortlistingCriteriaFormValues,
} from "@/schemas/jobs";
import type { JobShortlistingCriterion } from "@/services/jobs";
import { cn } from "@/lib/utils";

const criterionTypeOptions = Object.values(CRITERION_TYPES);
const educationLevelOptions = Object.values(EDUCATION_LEVELS);

const emptyCriterion = {
  type: CRITERION_TYPES.SKILL as CriterionType,
  label: "",
  description: "",
  valueText: "",
  valueNumber: undefined as number | undefined,
  educationLevel: "" as const,
  weight: 1,
  isRequired: true,
};

type JobShortlistingCriteriaFormProps = {
  jobId: string;
  initialCriteria: JobShortlistingCriterion[];
};

export function JobShortlistingCriteriaForm({
  jobId,
  initialCriteria,
}: JobShortlistingCriteriaFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<
    JobShortlistingCriteriaFormValues,
    unknown,
    JobShortlistingCriteriaFormInput
  >({
    resolver: zodResolver(jobShortlistingCriteriaFormSchema),
    defaultValues: {
      jobId,
      criteria:
        initialCriteria.length > 0
          ? initialCriteria.map((row) => ({
              type: row.type,
              label: row.label,
              description: row.description ?? "",
              valueText: row.valueText ?? "",
              valueNumber: row.valueNumber ?? undefined,
              educationLevel: row.educationLevel ?? "",
              weight: row.weight,
              isRequired: row.isRequired,
            }))
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "criteria",
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveJobShortlistingCriteriaAction(values);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof JobShortlistingCriteriaFormValues, {
              message: messages[0],
            });
          }
        }
        toast.error("Fix the highlighted criteria fields");
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        values.criteria.length === 0
          ? "Shortlisting criteria cleared"
          : "Shortlisting criteria saved",
      );
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Define must-haves and preferences for AI shortlisting. Leave empty to
          rely on the job description and requirements only.
        </p>
        {errors.criteria?.message || errors.criteria?.root?.message ? (
          <InlineAlert>
            {errors.criteria.message ?? errors.criteria.root?.message}
          </InlineAlert>
        ) : null}
        {errors.jobId?.message ? (
          <InlineAlert>{errors.jobId.message}</InlineAlert>
        ) : null}
      </div>

      <input type="hidden" {...register("jobId")} />

      <ul className="space-y-4">
        {fields.map((field, index) => (
          <CriterionRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            errors={errors}
            canRemove
            onRemove={() => remove(index)}
            disabled={isPending}
          />
        ))}
      </ul>

      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          No criteria yet. Add skills, experience, education, or custom
          instructions for this role.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || fields.length >= 30}
          onClick={() => append({ ...emptyCriterion })}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add criterion
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save criteria"}
        </Button>
      </div>
    </form>
  );
}

function CriterionRow({
  index,
  control,
  register,
  errors,
  canRemove,
  onRemove,
  disabled,
}: {
  index: number;
  control: ReturnType<
    typeof useForm<
      JobShortlistingCriteriaFormValues,
      unknown,
      JobShortlistingCriteriaFormInput
    >
  >["control"];
  register: ReturnType<
    typeof useForm<
      JobShortlistingCriteriaFormValues,
      unknown,
      JobShortlistingCriteriaFormInput
    >
  >["register"];
  errors: ReturnType<
    typeof useForm<
      JobShortlistingCriteriaFormValues,
      unknown,
      JobShortlistingCriteriaFormInput
    >
  >["formState"]["errors"];
  canRemove: boolean;
  onRemove: () => void;
  disabled: boolean;
}) {
  const type = useWatch({ control, name: `criteria.${index}.type` }) as
    | CriterionType
    | undefined;

  const rowErrors = errors.criteria?.[index];

  return (
    <li className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Criterion {index + 1}
        </p>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Remove criterion ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Type"
          htmlFor={`criterion-${index}-type`}
          error={rowErrors?.type?.message}
        >
          <select
            id={`criterion-${index}-type`}
            className={selectClassName}
            disabled={disabled}
            {...register(`criteria.${index}.type`)}
          >
            {criterionTypeOptions.map((value) => (
              <option key={value} value={value}>
                {CRITERION_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Label"
          htmlFor={`criterion-${index}-label`}
          error={rowErrors?.label?.message}
        >
          <Input
            id={`criterion-${index}-label`}
            disabled={disabled}
            placeholder="e.g. Next.js, BS Computer Science"
            {...register(`criteria.${index}.label`)}
          />
        </Field>
      </div>

      {type ? (
        <p className="text-xs text-muted-foreground">
          {CRITERION_TYPE_HINTS[type]}
        </p>
      ) : null}

      {type === "experience_years" ? (
        <Field
          label="Minimum years"
          htmlFor={`criterion-${index}-years`}
          error={rowErrors?.valueNumber?.message}
        >
          <Input
            id={`criterion-${index}-years`}
            type="number"
            min={0}
            step={0.5}
            disabled={disabled}
            {...register(`criteria.${index}.valueNumber`)}
          />
        </Field>
      ) : null}

      {type === "education_level" ? (
        <Field
          label="Education level"
          htmlFor={`criterion-${index}-edu`}
          error={rowErrors?.educationLevel?.message}
        >
          <select
            id={`criterion-${index}-edu`}
            className={selectClassName}
            disabled={disabled}
            {...register(`criteria.${index}.educationLevel`)}
          >
            <option value="">Select level</option>
            {educationLevelOptions.map((value) => (
              <option key={value} value={value}>
                {EDUCATION_LEVEL_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {type === "skill" || type === "keyword" || type === "custom" ? (
        <Field
          label={type === "custom" ? "Instruction" : "Value / detail"}
          htmlFor={`criterion-${index}-value`}
          error={rowErrors?.valueText?.message}
        >
          {type === "custom" ? (
            <Textarea
              id={`criterion-${index}-value`}
              rows={3}
              disabled={disabled}
              placeholder="e.g. Prefer production RAG experience; on-site 3 days/week"
              {...register(`criteria.${index}.valueText`)}
            />
          ) : (
            <Input
              id={`criterion-${index}-value`}
              disabled={disabled}
              placeholder={
                type === "skill" ? "Skill name if different from label" : "e.g. Remote, 30 days notice"
              }
              {...register(`criteria.${index}.valueText`)}
            />
          )}
        </Field>
      ) : null}

      <Field
        label="Notes (optional)"
        htmlFor={`criterion-${index}-desc`}
        error={rowErrors?.description?.message}
      >
        <Input
          id={`criterion-${index}-desc`}
          disabled={disabled}
          placeholder="Why this matters for the role"
          {...register(`criteria.${index}.description`)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            disabled={disabled}
            {...register(`criteria.${index}.isRequired`)}
          />
          Required (must-have)
        </label>
        <Field
          label="Weight (1–10)"
          htmlFor={`criterion-${index}-weight`}
          className="w-28"
        >
          <Input
            id={`criterion-${index}-weight`}
            type="number"
            min={1}
            max={10}
            disabled={disabled}
            {...register(`criteria.${index}.weight`)}
          />
        </Field>
      </div>
    </li>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
