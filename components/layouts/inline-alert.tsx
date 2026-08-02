import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InlineAlertProps = {
  children: ReactNode;
  className?: string;
  variant?: "destructive" | "default";
};

export function InlineAlert({
  children,
  className,
  variant = "destructive",
}: InlineAlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3 text-sm",
        variant === "destructive" &&
          "border-destructive/25 bg-destructive/5 text-destructive",
        variant === "default" && "border-border bg-muted/50 text-foreground",
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
