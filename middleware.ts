import { type NextRequest } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Middleware foundation for protected HR routes.
 * Full role-based authorization will be implemented later.
 */
export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh session — required for Supabase Auth SSR.
  await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isHrRoute = pathname.startsWith(ROUTES.dashboard.root);

  if (isHrRoute) {
    // Placeholder: redirect unauthenticated users once auth pages exist.
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // if (!user) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = ROUTES.login;
    //   url.searchParams.set("redirectTo", pathname);
    //   return NextResponse.redirect(url);
    // }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and images.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
