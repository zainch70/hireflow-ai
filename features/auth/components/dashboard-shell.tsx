import type { ReactNode } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireHrProfile } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";

export async function DashboardShell({ children }: { children: ReactNode }) {
  const profile = await requireHrProfile();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark href={ROUTES.dashboard.root} />
            <Badge
              variant="secondary"
              className="hidden border border-border bg-muted/60 font-normal text-muted-foreground sm:inline-flex"
            >
              {profile.role.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <LogoutButton />
          </div>
        </Container>
      </header>

      <div className="py-8 sm:py-10">
        <Container>{children}</Container>
      </div>
    </div>
  );
}
