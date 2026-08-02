/**
 * Auth / non-marketing public routes (e.g. login).
 * Careers + home live under `(marketing)` with a shared PublicSiteShell.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
