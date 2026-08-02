/**
 * Server-side environment accessors.
 * Values come from process.env — never hardcode secrets.
 */

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  },
  get supabaseUrl() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  },
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
  get geminiApiKey() {
    return requireEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  },
};
