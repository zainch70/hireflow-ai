"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.dashboard.root, label: "Overview", exact: true },
  { href: ROUTES.dashboard.jobs, label: "Jobs", exact: false },
  { href: ROUTES.dashboard.applications, label: "Applications", exact: false },
  { href: ROUTES.dashboard.statistics, label: "Statistics", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type DashboardNavProps = {
  className?: string;
  linkClassName?: string;
};

export function DashboardNav({ className, linkClassName }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="HR">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              linkClassName,
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
