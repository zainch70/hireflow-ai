import { PageHeader } from "@/components/layouts/page-header";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        description="Loading candidate submissions…"
      />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <span className="sr-only">Loading applications</span>
    </div>
  );
}
