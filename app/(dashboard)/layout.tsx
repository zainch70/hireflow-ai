import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/features/auth/components/dashboard-shell";
import { DashboardShellSkeleton } from "@/features/auth/components/skeletons";

/** HR routes always need auth + live DB data — never statically prerender. */
export const dynamic = "force-dynamic";

/**
 * Protected HR layout (Server Component).
 * Suspense streams the auth-gated shell; children wait until HR auth succeeds.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
