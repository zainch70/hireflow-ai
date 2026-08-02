"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import {
  getSafeDashboardRedirect,
} from "@/lib/auth/paths";
import { loginSchema } from "@/schemas/auth";
import { loginHr } from "@/services/auth/login-hr";
import type { AuthActionResult } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Thin Server Action — validation + redirect only.
 * Business rules live in services/auth.
 */
export async function loginHrAction(
  prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  void prevState;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      fieldErrors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  const result = await loginHr(parsed.data);

  if (!result.ok) {
    return {
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  redirect(getSafeDashboardRedirect(formData.get("redirectTo")));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.login);
}
