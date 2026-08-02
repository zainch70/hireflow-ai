import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/layouts/empty-state";
import { PageHeader } from "@/components/layouts/page-header";

/**
 * Minimal protected HR landing (Server Component).
 * Real dashboard pages come in a later phase.
 */
export default function HrHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Your recruiting workspace is ready. Job boards, applications, and AI screening will appear here next."
      />

      <EmptyState
        icon={<LayoutDashboard className="size-5" aria-hidden="true" />}
        title="No dashboard modules yet"
        description="Authentication and the HR shell are live. Feature modules for jobs, candidates, and analytics will be added in upcoming phases."
      />
    </div>
  );
}
