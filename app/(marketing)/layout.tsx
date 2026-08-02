import type { ReactNode } from "react";

import { PublicSiteShell } from "@/features/careers/components/public-site-shell";

/**
 * Shared public chrome for Home + Careers.
 * Soft nav keeps this layout mounted (header does not remount).
 * ISR + tagged Data Cache; mutations revalidate careers/jobs tags.
 */
export const revalidate = 60;

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
