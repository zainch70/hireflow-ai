import { type NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { isDashboardPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Refreshes the Supabase session and protects HR routes.
 * Role checks happen in the dashboard layout (DB-backed profile).
 */
export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isDashboardPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
