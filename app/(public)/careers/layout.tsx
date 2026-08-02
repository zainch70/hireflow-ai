/**
 * Public careers — ISR via Data Cache tags + time revalidation.
 * Mutations call revalidateTag(CACHE_TAGS.careers / jobs).
 */
export const revalidate = 60;

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
