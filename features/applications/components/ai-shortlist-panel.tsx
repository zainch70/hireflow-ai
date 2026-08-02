"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AI_RECOMMENDATION_LABELS,
  type AiRecommendation,
} from "@/lib/ai/shortlist-schema";
import { runAiShortlistingAction } from "@/features/applications/actions/ai.actions";
import { formatDateTime } from "@/lib/dates";
import type { AiShortlistView } from "@/services/ai";
import { cn } from "@/lib/utils";

type AiShortlistPanelProps = {
  applicationId: string;
  analysis: AiShortlistView | null;
};

function scoreTone(score: number | null) {
  if (score == null) {
    return "text-muted-foreground";
  }
  if (score >= 80) {
    return "text-green-700 dark:text-green-300";
  }
  if (score >= 65) {
    return "text-teal-700 dark:text-teal-300";
  }
  if (score >= 45) {
    return "text-amber-800 dark:text-amber-200";
  }
  return "text-red-700 dark:text-red-300";
}

function scoreRing(score: number | null) {
  if (score == null) {
    return "border-border bg-muted/40";
  }
  if (score >= 80) {
    return "border-green-300/80 bg-green-50 dark:border-green-700 dark:bg-green-950/40";
  }
  if (score >= 65) {
    return "border-teal-300/80 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/40";
  }
  if (score >= 45) {
    return "border-amber-300/80 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40";
  }
  return "border-red-300/80 bg-red-50 dark:border-red-800 dark:bg-red-950/40";
}

function recommendationStyle(value: AiRecommendation | null) {
  switch (value) {
    case "strong_match":
      return "border-green-300/80 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200";
    case "good_match":
      return "border-teal-300/80 bg-teal-100 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200";
    case "partial_match":
      return "border-amber-300/80 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200";
    case "poor_match":
      return "border-red-300/80 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function AiShortlistPanel({
  applicationId,
  analysis,
}: AiShortlistPanelProps) {
  const [pending, startTransition] = useTransition();

  function handleRun() {
    startTransition(async () => {
      const result = await runAiShortlistingAction(applicationId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        analysis ? "AI shortlisting refreshed" : "AI shortlisting complete",
      );
    });
  }

  const isProcessing =
    pending || analysis?.status === "processing" || analysis?.status === "pending";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            Gemini evaluates job requirements, the application form, and
            extracted CV text.
          </p>
          {analysis?.createdAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Last run {formatDateTime(analysis.createdAt)}
              {analysis.model ? ` · ${analysis.model}` : ""}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleRun}
          disabled={isProcessing}
          className="shrink-0"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {isProcessing
            ? "Running…"
            : analysis
              ? "Rerun AI"
              : "Run AI shortlisting"}
        </Button>
      </div>

      {!analysis ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          <CircleDashed
            className="mx-auto size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            No AI analysis yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run shortlisting to get a match score, recommendation, and skill
            gaps.
          </p>
        </div>
      ) : null}

      {analysis?.status === "failed" ? (
        <div className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          <p className="font-medium">Last run failed</p>
          <p className="mt-1 opacity-90">
            {analysis.errorMessage ?? "Unknown error. Try again."}
          </p>
        </div>
      ) : null}

      {analysis?.status === "completed" ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
            <div
              className={cn(
                "flex size-24 flex-col items-center justify-center rounded-2xl border",
                scoreRing(analysis.matchScore),
              )}
            >
              <p
                className={cn(
                  "text-3xl font-semibold tracking-tight",
                  scoreTone(analysis.matchScore),
                )}
              >
                {analysis.matchScore != null
                  ? Math.round(analysis.matchScore)
                  : "—"}
              </p>
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Match
              </p>
            </div>

            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recommendation
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit font-medium",
                  recommendationStyle(analysis.recommendation),
                )}
              >
                {analysis.recommendation
                  ? AI_RECOMMENDATION_LABELS[analysis.recommendation]
                  : "—"}
              </Badge>
              {analysis.summary ? (
                <p className="text-sm leading-relaxed text-foreground">
                  {analysis.summary}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SkillList
              title="Matching skills"
              empty="No matching skills identified"
              items={analysis.matchingSkills}
              tone="match"
            />
            <SkillList
              title="Missing skills"
              empty="No critical gaps identified"
              items={analysis.missingSkills}
              tone="gap"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <BulletList
              title="Strengths"
              icon={<CheckCircle2 className="size-4 text-teal-600" />}
              items={analysis.strengths}
              empty="None listed"
            />
            <BulletList
              title="Concerns"
              icon={<AlertTriangle className="size-4 text-amber-600" />}
              items={analysis.concerns}
              empty="None listed"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SkillList({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: "match" | "gap";
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item}>
              <Badge
                variant="outline"
                className={cn(
                  "font-normal",
                  tone === "match"
                    ? "border-teal-300/80 bg-teal-50 text-teal-900 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200"
                    : "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
                )}
              >
                {tone === "gap" ? (
                  <XCircle className="size-3 opacity-70" aria-hidden="true" />
                ) : (
                  <CheckCircle2
                    className="size-3 opacity-70"
                    aria-hidden="true"
                  />
                )}
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BulletList({
  title,
  items,
  empty,
  icon,
}: {
  title: string;
  items: string[];
  empty: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-foreground">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
