/**
 * Public route group layout.
 * Careers pages bring their own PublicSiteShell; login keeps AuthCentered.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
