import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SurfaceCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Clean bordered card for forms and content panels.
 * Uses subtle ring/border — no heavy shadows.
 */
export function SurfaceCard({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: SurfaceCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border bg-card shadow-none ring-0",
        className,
      )}
    >
      {title || description ? (
        <CardHeader className="border-b border-border pb-4">
          {title ? (
            <CardTitle className="text-lg font-semibold tracking-tight">
              {title}
            </CardTitle>
          ) : null}
          {description ? (
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn("pt-5", contentClassName)}>{children}</CardContent>
      {footer ? (
        <CardFooter className="justify-between gap-3 border-border bg-transparent">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
