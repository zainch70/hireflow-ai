"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Client header so active state updates without remounting the public shell
 * on soft navigations (Home ↔ Careers ↔ job detail).
 */
export function PublicSiteHeader() {
  const pathname = usePathname();
  const homeActive = pathname === ROUTES.home;
  const careersActive =
    pathname === ROUTES.careers || pathname.startsWith(`${ROUTES.careers}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4">
        <BrandMark />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <NavLink href={ROUTES.home} active={homeActive}>
            Home
          </NavLink>
          <NavLink href={ROUTES.careers} active={careersActive}>
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
      prefetch
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
