import type { ReactNode } from "react";
import { Suspense } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { ThemeToggle } from "@/components/layouts/theme-toggle";
import { DashboardNav } from "@/features/auth/components/dashboard-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireHrProfile } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";

/**
 * Sync chrome — paints immediately on soft nav (client nav stays mounted).
 */
function DashboardChrome({
  userSlot,
  children,
}: {
  userSlot: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <BrandMark href={ROUTES.dashboard.root} />
            <DashboardNav className="hidden items-center gap-1 sm:flex" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {userSlot}
            <ThemeToggle />
            <LogoutButton />
          </div>
        </Container>
      </header>

      <div className="border-b border-border bg-card sm:hidden">
        <Container className="py-2">
          <DashboardNav className="flex flex-wrap gap-1" />
        </Container>
      </div>

      <div className="py-8 sm:py-10">
        <Container>{children}</Container>
      </div>
    </div>
  );
}

function UserBadgeSkeleton() {
  return (
    <div className="hidden text-right sm:block" aria-hidden="true">
      <div className="ml-auto h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-1 ml-auto h-3 w-40 animate-pulse rounded bg-muted" />
    </div>
  );
}

async function DashboardUserBadge() {
  const profile = await requireHrProfile();
  const roleLabel = profile.role.replaceAll("_", " ");

  return (
    <div className="hidden text-right sm:block">
      <p className="truncate text-sm font-medium text-foreground">
        {profile.fullName}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        <span className="capitalize">{roleLabel}</span>
        <span className="mx-1 text-border" aria-hidden="true">
          ·
        </span>
        {profile.email}
      </p>
    </div>
  );
}

/** Blocks page content until HR auth passes (shared cache with user badge). */
async function HrAuthGate({ children }: { children: ReactNode }) {
  await requireHrProfile();
  return children;
}

/**
 * Auth-gated HR shell: chrome is sync; profile + page stream in parallel Suspense.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashboardChrome
      userSlot={
        <Suspense fallback={<UserBadgeSkeleton />}>
          <DashboardUserBadge />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <HrAuthGate>{children}</HrAuthGate>
      </Suspense>
    </DashboardChrome>
  );
}
