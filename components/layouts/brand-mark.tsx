import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href?: string | null;
  className?: string;
  showWordmark?: boolean;
};

export function BrandMark({
  href = ROUTES.home,
  className,
  showWordmark = true,
}: BrandMarkProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-lg border border-border bg-card text-[11px] font-semibold tracking-tight text-primary"
      >
        Hf
      </span>
      {showWordmark ? (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          HireFlow AI
        </span>
      ) : (
        <span className="sr-only">HireFlow AI</span>
      )}
    </span>
  );

  if (href === null || href === undefined) {
    return (
      <span className="inline-flex" aria-label="HireFlow AI">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label="HireFlow AI"
      className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
    >
      {content}
    </Link>
  );
}
