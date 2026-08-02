import { ensureProfile, isHrRole, touchLastLogin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AUTH_MESSAGES } from "@/features/auth/lib/login-errors";
import type { AuthActionResult } from "@/types/auth";

export type LoginHrInput = {
  email: string;
  password: string;
};

export type LoginHrSuccess = {
  ok: true;
};

export type LoginHrFailure = {
  ok: false;
} & AuthActionResult;

export type LoginHrResult = LoginHrSuccess | LoginHrFailure;

/**
 * HR login business rules — keep Server Actions thin.
 */
export async function loginHr(
  input: LoginHrInput,
): Promise<LoginHrResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    return { ok: false, error: AUTH_MESSAGES.invalidCredentials };
  }

  const profile = await ensureProfile(data.user);

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return { ok: false, error: AUTH_MESSAGES.inactive };
  }

  if (!isHrRole(profile.role)) {
    await supabase.auth.signOut();
    return { ok: false, error: AUTH_MESSAGES.noHrAccess };
  }

  await touchLastLogin(profile.id);

  return { ok: true };
}
