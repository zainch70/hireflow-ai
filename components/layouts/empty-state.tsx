import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center",
        className,
      )}
      role="status"
    >
      {icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
