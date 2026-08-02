import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { getSafeAppPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ERRORS = new Set(["forbidden", "inactive"]);

/**
 * Clears the Supabase session outside of RSC render, then redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get("error");
  const next = getSafeAppPath(searchParams.get("next"), ROUTES.login);

  const supabase = await createClient();
  await supabase.auth.signOut();

  const redirectUrl = new URL(next, origin);

  // Defend against any absolute URL that slipped through.
  if (redirectUrl.origin !== origin) {
    redirectUrl.href = new URL(ROUTES.login, origin).href;
  }

  if (error && ALLOWED_ERRORS.has(error)) {
    redirectUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(redirectUrl);
}
