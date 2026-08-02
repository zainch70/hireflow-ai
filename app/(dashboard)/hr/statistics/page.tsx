import type { Metadata } from "next";

import { MetricCard } from "@/components/layouts/metric-card";
import { PageHeader } from "@/components/layouts/page-header";
import {
  AiRecommendationsChart,
  ApplicationsByStatusChart,
  ApplicationsOverTimeChart,
  JobsPublishedChart,
} from "@/features/dashboard/components/stats-charts.lazy";
import { getHrDashboardStats } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Hiring pipeline analytics",
};

export default async function HrStatisticsPage() {
  const stats = await getHrDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistics"
        description="Applications, AI shortlisting, and publish activity — focused charts only."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Applications" value={stats.applicationsTotal} />
        <MetricCard label="AI screened" value={stats.aiScreenedTotal} />
        <MetricCard label="Published jobs" value={stats.publishedJobs} />
        <MetricCard label="Shortlisted" value={stats.shortlistedApplications} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationsByStatusChart data={stats.applicationsByStatus} />
        <ApplicationsOverTimeChart data={stats.applicationsOverTime} />
        <AiRecommendationsChart data={stats.aiRecommendations} />
        <JobsPublishedChart data={stats.jobsPublishedOverTime} />
      </div>
    </div>
  );
}
