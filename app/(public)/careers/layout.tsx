/**
 * Careers pages query Postgres — skip static prerender so Vercel/local
 * builds do not open DB connections at build time.
 */
export const dynamic = "force-dynamic";

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
