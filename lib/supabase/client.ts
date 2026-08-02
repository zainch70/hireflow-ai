import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * Uses placeholders when env vars are missing so Next.js can prerender
 * without credentials; configure .env.local before calling Auth/Storage.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
  );
}
