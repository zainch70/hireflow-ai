import type { Metadata } from "next";

import { PageHeader } from "@/components/layouts/page-header";
import {
  ApplicationsByStatusChart,
  ApplicationsOverTimeChart,
  JobsByStatusChart,
  TopJobsByApplicationsChart,
} from "@/features/dashboard/components/stats-charts";
import { getHrDashboardStats } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Hiring pipeline metrics",
};

export default async function HrStatisticsPage() {
  const stats = await getHrDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistics"
        description="Pipeline volume and trends across jobs and applications."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total jobs" value={stats.jobsTotal} />
        <MetricCard label="Published" value={stats.publishedJobs} />
        <MetricCard label="Applications" value={stats.applicationsTotal} />
        <MetricCard label="Shortlisted" value={stats.shortlistedApplications} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JobsByStatusChart data={stats.jobsByStatus} />
        <ApplicationsByStatusChart data={stats.applicationsByStatus} />
        <ApplicationsOverTimeChart data={stats.applicationsOverTime} />
        <TopJobsByApplicationsChart data={stats.topJobsByApplications} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
