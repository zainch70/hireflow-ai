import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCentered } from "@/components/layouts/auth-centered";
import { BrandMark } from "@/components/layouts/brand-mark";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { ThemeToggle } from "@/components/layouts/theme-toggle";
import { LoginSessionGate } from "@/features/auth/components/login-session-gate";
import { LoginFormSkeleton } from "@/features/auth/components/skeletons";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "HR Sign in",
  description: "Sign in to the HireFlow AI HR portal",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
};

async function LoginGateFromParams({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginSessionGate error={params.error} redirectTo={params.redirectTo} />
  );
}

/**
 * Static chrome paints immediately; searchParams + session resolve in Suspense.
 */
export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthCentered corner={<ThemeToggle />}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_55%)]"
      />

      <div className="flex flex-col items-center gap-6 text-center">
        <BrandMark href={ROUTES.home} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            Sign in to HR
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Use your work account to access recruiting tools.
          </p>
        </div>
      </div>

      <SurfaceCard>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginGateFromParams searchParams={searchParams} />
        </Suspense>
      </SurfaceCard>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Access is limited to provisioned HR and admin accounts.
      </p>
    </AuthCentered>
  );
}
