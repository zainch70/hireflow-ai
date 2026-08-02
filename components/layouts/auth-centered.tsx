import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthCenteredProps = {
  children: ReactNode;
  className?: string;
  /** Fixed to the viewport (e.g. theme toggle) — not inside the form column. */
  corner?: ReactNode;
};

/** Shared centered auth chrome (login, errors, skeletons). */
export function AuthCentered({
  children,
  className,
  corner,
}: AuthCenteredProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6",
        className,
      )}
    >
      {corner ? (
        <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
          {corner}
        </div>
      ) : null}
      <div className="relative w-full max-w-[420px] space-y-8">{children}</div>
    </main>
  );
}
