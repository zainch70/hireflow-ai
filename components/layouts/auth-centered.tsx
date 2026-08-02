import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthCenteredProps = {
  children: ReactNode;
  className?: string;
};

/** Shared centered auth chrome (login, errors, skeletons). */
export function AuthCentered({ children, className }: AuthCenteredProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6",
        className,
      )}
    >
      <div className="relative w-full max-w-[420px] space-y-8">{children}</div>
    </main>
  );
}
