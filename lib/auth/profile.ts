import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ROLES } from "@/constants/roles";
import { parseRole } from "@/lib/auth/roles";
import type { User } from "@supabase/supabase-js";

export type Profile = typeof profiles.$inferSelect;

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile ?? null;
}

/**
 * Uncached profile read — avoids stale null after ensureProfile inserts
 * within the same request when React cache would retain a miss.
 */
export async function getProfileById(
  userId: string,
): Promise<Profile | null> {
  return fetchProfileById(userId);
}

/**
 * Ensures a profiles row exists for the auth user.
 * Role comes from auth user_metadata.role when present (for future provisioning).
 */
export async function ensureProfile(user: User): Promise<Profile> {
  const existing = await fetchProfileById(user.id);

  if (existing) {
    return existing;
  }

  const email = user.email;

  if (!email) {
    throw new Error("Authenticated user is missing an email address");
  }

  const role = parseRole(user.user_metadata?.role, ROLES.CANDIDATE);
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : (email.split("@")[0] ?? "User");

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email,
      fullName,
      role,
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const profile = await fetchProfileById(user.id);

  if (!profile) {
    throw new Error("Failed to create user profile");
  }

  return profile;
}

export async function touchLastLogin(userId: string): Promise<void> {
  await db
    .update(profiles)
    .set({ lastLoginAt: new Date() })
    .where(eq(profiles.id, userId));
}
