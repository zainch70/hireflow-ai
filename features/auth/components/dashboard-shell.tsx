import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireHrProfile } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.dashboard.root, label: "Overview" },
  { href: ROUTES.dashboard.jobs, label: "Jobs" },
] as const;

export async function DashboardShell({ children }: { children: ReactNode }) {
  const profile = await requireHrProfile();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <BrandMark href={ROUTES.dashboard.root} />
            <nav className="hidden items-center gap-1 sm:flex" aria-label="HR">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Badge
              variant="secondary"
              className="hidden border border-border bg-muted/60 font-normal text-muted-foreground md:inline-flex"
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

      <div className="border-b border-border bg-card sm:hidden">
        <Container className="flex gap-1 py-2" aria-label="HR mobile">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </div>

      <div className="py-8 sm:py-10">
        <Container>{children}</Container>
      </div>
    </div>
  );
}
