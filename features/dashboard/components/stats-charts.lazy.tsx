"use client";

import dynamic from "next/dynamic";

import { SurfaceCard } from "@/components/layouts/surface-card";

function ChartSkeleton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SurfaceCard title={title} description={description}>
      <div className="h-72 w-full animate-pulse rounded-lg bg-muted/50" />
    </SurfaceCard>
  );
}

export const ApplicationsByStatusChart = dynamic(
  () =>
    import("@/features/dashboard/components/stats-charts").then(
      (mod) => mod.ApplicationsByStatusChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton
        title="Applications by status"
        description="Where candidates sit in the hiring pipeline."
      />
    ),
  },
);

export const ApplicationsOverTimeChart = dynamic(
  () =>
    import("@/features/dashboard/components/stats-charts").then(
      (mod) => mod.ApplicationsOverTimeChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton
        title="Applications over time"
        description="Daily submissions for the last 30 days."
      />
    ),
  },
);

export const AiRecommendationsChart = dynamic(
  () =>
    import("@/features/dashboard/components/stats-charts").then(
      (mod) => mod.AiRecommendationsChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton
        title="AI recommendations"
        description="Latest shortlist band per screened application."
      />
    ),
  },
);

export const JobsPublishedChart = dynamic(
  () =>
    import("@/features/dashboard/components/stats-charts").then(
      (mod) => mod.JobsPublishedChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton
        title="Jobs published"
        description="Roles published per day for the last 30 days."
      />
    ),
  },
);
