import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PublicSiteHeaderProps = {
  active?: "home" | "careers";
};

export function PublicSiteHeader({ active }: PublicSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4">
        <BrandMark />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <NavLink href={ROUTES.home} active={active === "home"}>
            Home
          </NavLink>
          <NavLink href={ROUTES.careers} active={active === "careers"}>
            Careers
          </NavLink>
        </nav>
      </Container>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/35",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <Container className="flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HireFlow AI
        </p>
        <Link
          href={ROUTES.careers}
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
  active?: "home" | "careers";
};

export function PublicSiteShell({ children, active }: PublicSiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader active={active} />
      <div className="flex-1">{children}</div>
      <PublicSiteFooter />
    </div>
  );
}
