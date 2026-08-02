"use client";

import { cloneElement, useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { InlineAlert } from "@/components/layouts/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  type EmploymentType,
} from "@/constants/employment-type";
import { ROUTES } from "@/constants/routes";
import {
  createJobAction,
  updateJobAction,
} from "@/features/jobs/actions/job.actions";
import {
  jobFormSchema,
  type JobFormInput,
  type JobFormValues,
} from "@/schemas/jobs";
import { cn } from "@/lib/utils";

const employmentOptions = Object.values(EMPLOYMENT_TYPES);

type JobFormProps = {
  mode: "create" | "edit";
  jobId?: string;
  defaultValues?: Partial<JobFormValues>;
};

export function JobForm({ mode, jobId, defaultValues }: JobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<JobFormValues, unknown, JobFormInput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experience: "",
      location: "",
      description: "",
      requirements: "",
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: "USD",
      ...defaultValues,
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createJobAction(values)
          : await updateJobAction(jobId!, values);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof JobFormValues, {
              message: messages[0],
            });
          }
        }
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (mode === "create") {
        toast.success("Job created as draft");
        if ("jobId" in result && result.jobId) {
          router.push(`${ROUTES.dashboard.jobs}/${result.jobId}/edit`);
          router.refresh();
          return;
        }
        router.push(ROUTES.dashboard.jobs);
        router.refresh();
        return;
      }

      toast.success("Job updated");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate aria-busy={isPending}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Title"
          htmlFor="title"
          required
          error={errors.title?.message}
          className="sm:col-span-2"
        >
          <Input
            id="title"
            placeholder="Senior Frontend Engineer"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.title)}
            disabled={isPending}
            {...register("title")}
          />
        </Field>

        <Field
          label="Department"
          htmlFor="department"
          required
          error={errors.department?.message}
        >
          <Input
            id="department"
            placeholder="Engineering"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.department)}
            disabled={isPending}
            {...register("department")}
          />
        </Field>

        <Field
          label="Employment type"
          htmlFor="employmentType"
          required
          error={errors.employmentType?.message}
        >
          <select
            id="employmentType"
            className={selectClassName}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.employmentType)}
            disabled={isPending}
            {...register("employmentType")}
          >
            {employmentOptions.map((value) => (
              <option key={value} value={value}>
                {EMPLOYMENT_TYPE_LABELS[value as EmploymentType]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Experience"
          htmlFor="experience"
          required
          error={errors.experience?.message}
        >
          <Input
            id="experience"
            placeholder="3+ years"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.experience)}
            disabled={isPending}
            {...register("experience")}
          />
        </Field>

        <Field
          label="Location"
          htmlFor="location"
          required
          error={errors.location?.message}
        >
          <Input
            id="location"
            placeholder="Remote / New York, NY"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.location)}
            disabled={isPending}
            {...register("location")}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="description"
          required
          error={errors.description?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            placeholder="Summarize the role, team, and impact."
            required
            aria-required="true"
            aria-invalid={Boolean(errors.description)}
            disabled={isPending}
            {...register("description")}
          />
        </Field>

        <Field
          label="Requirements"
          htmlFor="requirements"
          required
          error={errors.requirements?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="requirements"
            placeholder="List must-have skills and qualifications."
            required
            aria-required="true"
            aria-invalid={Boolean(errors.requirements)}
            disabled={isPending}
            {...register("requirements")}
          />
        </Field>

        <Field
          label="Min salary"
          htmlFor="salaryMin"
          optional
          error={errors.salaryMin?.message}
        >
          <Input
            id="salaryMin"
            type="number"
            inputMode="numeric"
            placeholder="80000"
            aria-invalid={Boolean(errors.salaryMin)}
            disabled={isPending}
            {...register("salaryMin")}
          />
        </Field>

        <Field
          label="Max salary"
          htmlFor="salaryMax"
          optional
          error={errors.salaryMax?.message}
        >
          <Input
            id="salaryMax"
            type="number"
            inputMode="numeric"
            placeholder="120000"
            aria-invalid={Boolean(errors.salaryMax)}
            disabled={isPending}
            {...register("salaryMax")}
          />
        </Field>

        <Field
          label="Currency"
          htmlFor="salaryCurrency"
          optional
          error={errors.salaryCurrency?.message}
        >
          <Input
            id="salaryCurrency"
            placeholder="USD"
            maxLength={3}
            aria-invalid={Boolean(errors.salaryCurrency)}
            disabled={isPending}
            {...register("salaryCurrency")}
          />
        </Field>
      </div>

      {errors.root?.message ? (
        <InlineAlert>{errors.root.message}</InlineAlert>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push(ROUTES.dashboard.jobs)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create job"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

const selectClassName = cn(
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
);

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
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="gap-1">
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
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
