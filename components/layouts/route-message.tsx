import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RouteMessageProps = {
  /** Short label above the title, e.g. "Error" or "404" */
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  tone?: "error" | "neutral";
};

/**
 * In-layout error / not-found panel.
 * Does not render a header — use inside DashboardShell or other shells to avoid duplication.
 */
export function RouteMessage({
  eyebrow,
  title,
  description,
  actions,
  className,
  tone = "neutral",
}: RouteMessageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <p
        className={cn(
          "text-sm font-semibold tracking-wide uppercase",
          tone === "error" ? "text-destructive" : "text-primary",
        )}
      >
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actions ? (
        <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
