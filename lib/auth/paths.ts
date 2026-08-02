import { ROUTES } from "@/constants/routes";

/** True for `/hr` and nested HR paths — not `/hrfake`. */
export function isDashboardPath(path: string): boolean {
  return (
    path === ROUTES.dashboard.root ||
    path.startsWith(`${ROUTES.dashboard.root}/`)
  );
}

/**
 * Allows only same-origin relative paths under the HR dashboard.
 * Prevents open redirects after login.
 */
export function getSafeDashboardRedirect(
  value: FormDataEntryValue | string | null | undefined,
): string {
  if (typeof value !== "string") {
    return ROUTES.dashboard.root;
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return ROUTES.dashboard.root;
  }

  if (!isDashboardPath(path)) {
    return ROUTES.dashboard.root;
  }

  return path;
}

/**
 * Allows only relative, same-origin paths for post-signout redirects.
 */
export function getSafeAppPath(
  value: string | null | undefined,
  fallback: string = ROUTES.login,
): string {
  if (!value) {
    return fallback;
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  return path;
}

export function buildSignOutUrl(options?: {
  error?: "forbidden" | "inactive";
  next?: string;
}): string {
  const params = new URLSearchParams();
  const next = getSafeAppPath(options?.next, ROUTES.login);

  params.set("next", next);

  if (options?.error) {
    params.set("error", options.error);
  }

  return `${ROUTES.auth.signOut}?${params.toString()}`;
}
