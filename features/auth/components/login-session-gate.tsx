import { redirect } from "next/navigation";

import { InlineAlert } from "@/components/layouts/inline-alert";
import { LoginForm } from "@/features/auth/components/login-form";
import { mapLoginQueryError } from "@/features/auth/lib/login-errors";
import {
  buildSignOutUrl,
  getCurrentProfile,
  getSafeDashboardRedirect,
  getUser,
  isHrRole,
} from "@/lib/auth";
import { ROUTES } from "@/constants/routes";

type LoginSessionGateProps = {
  error?: string;
  redirectTo?: string;
};

/**
 * Async Server Component — session check streams behind Suspense.
 * Non-HR sessions are cleared via /auth/signout (no side effects in render).
 */
export async function LoginSessionGate({
  error,
  redirectTo,
}: LoginSessionGateProps) {
  const user = await getUser();

  if (user) {
    const profile = await getCurrentProfile();

    if (profile && isHrRole(profile.role) && profile.isActive) {
      redirect(getSafeDashboardRedirect(redirectTo));
    }

    redirect(buildSignOutUrl({ error: "forbidden", next: ROUTES.login }));
  }

  const queryError = mapLoginQueryError(error);

  return (
    <div className="space-y-5">
      {queryError ? <InlineAlert>{queryError}</InlineAlert> : null}
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
