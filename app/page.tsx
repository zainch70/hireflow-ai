import type { Metadata } from "next";
import { Syne } from "next/font/google";

import { HomeLanding } from "@/features/careers/components/home-landing";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { env } from "@/lib/env";

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-home-display",
});

export const metadata: Metadata = {
  title: "HireFlow AI",
  description:
    "Find open roles at HireFlow AI. Browse published openings and apply with a clear, candidate-first process.",
  alternates: {
    canonical: env.appUrl,
  },
  openGraph: {
    title: "HireFlow AI",
    description:
      "Open roles. A straightforward apply. Real follow-through.",
    url: env.appUrl,
    type: "website",
  },
};

/**
 * Public landing — static server content for candidates.
 * HR access stays private at /login (provisioned accounts only).
 */
export default function HomePage() {
  return (
    <PublicSiteShell active="home">
      <div className={syne.variable}>
        <HomeLanding displayClassName="font-[family-name:var(--font-home-display)] font-semibold" />
      </div>
    </PublicSiteShell>
  );
}
