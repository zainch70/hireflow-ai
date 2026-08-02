export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Map Zod issues to RHF-style fieldErrors (supports nested paths). */
export function zodIssuesToFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string[] | undefined> {
  const fieldErrors: Record<string, string[] | undefined> = {};

  for (const issue of issues) {
    const path = issue.path.map(String).join(".");
    if (!path) {
      continue;
    }

    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
  }

  return fieldErrors;
}
