import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layouts/container";
import { PublicSiteHeader } from "@/features/careers/components/public-site-header";
import { ROUTES } from "@/constants/routes";

export function PublicSiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <Container className="flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HireFlow AI
        </p>
        <Link
          href={ROUTES.careers}
          prefetch
          className="text-sm font-medium text-primary hover:underline"
        >
          View open roles
        </Link>
      </Container>
    </footer>
  );
}

type PublicSiteShellProps = {
  children: ReactNode;
};

/**
 * Shared public chrome — lives in the marketing layout so header/footer
 * stay mounted across soft navigations (instant feel).
 */
export function PublicSiteShell({ children }: PublicSiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />
      <div className="flex-1">{children}</div>
      <PublicSiteFooter />
    </div>
  );
}
