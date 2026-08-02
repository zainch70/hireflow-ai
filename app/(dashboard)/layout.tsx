import type { ReactNode } from "react";

import { DashboardShell } from "@/features/auth/components/dashboard-shell";

/**
 * Protected HR layout.
 * Auth via cookies keeps requests dynamic; list/stats data uses tagged
 * `unstable_cache` + `revalidateTag` on mutations (not force-dynamic).
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
