import { cache } from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { isHrRole } from "@/lib/auth/roles";
import {
  ensureProfile,
  getProfileById,
  type Profile,
} from "@/lib/auth/profile";
import { buildSignOutUrl } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

/** Prefer getUser() over getSession() — validated by Supabase Auth server. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  return user;
}

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return getProfileById(user.id);
});

/**
 * Requires an authenticated user with HR or admin role.
 * Deduped per request via cache().
 */
export const requireHrProfile = cache(async (): Promise<Profile> => {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  if (!profile.isActive) {
    redirect(buildSignOutUrl({ error: "inactive", next: ROUTES.login }));
  }

  if (!isHrRole(profile.role)) {
    redirect(buildSignOutUrl({ error: "forbidden", next: ROUTES.login }));
  }

  return profile;
});
