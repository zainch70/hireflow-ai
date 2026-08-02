import type { Metadata } from "next";
import { Syne } from "next/font/google";

import { HomeLanding } from "@/features/careers/components/home-landing";
import { env } from "@/lib/env";

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-home-display",
});

export const metadata: Metadata = {
  title: "HireFlow AI",
  description:
    "Careers at HireFlow AI. Explore open roles across engineering, product, and operations.",
  alternates: {
    canonical: env.appUrl,
  },
  openGraph: {
    title: "HireFlow AI",
    description:
      "Technology careers for people who ship real work. Browse open roles.",
    url: env.appUrl,
    type: "website",
  },
};

/**
 * Public landing — static server content for candidates.
 * Chrome comes from `(marketing)/layout` (shared shell stays mounted on soft nav).
 */
export default function HomePage() {
  return (
    <div className={syne.variable}>
      <HomeLanding displayClassName="font-[family-name:var(--font-home-display)] font-semibold" />
    </div>
  );
}
