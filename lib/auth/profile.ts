import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ROLES } from "@/constants/roles";
import type { User } from "@supabase/supabase-js";

export type Profile = typeof profiles.$inferSelect;

/** Deduped per request — soft navs still hit DB once per navigation. */
export const getProfileById = cache(
  async (userId: string): Promise<Profile | null> => {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return profile ?? null;
  },
);

/**
 * Ensures a profiles row exists for the auth user.
 * New profiles always start as `candidate` — never trust Auth
 * `user_metadata.role` for privilege (HR/admin must be set in DB).
 */
export async function ensureProfile(user: User): Promise<Profile> {
  const existing = await getProfileById(user.id);

  if (existing) {
    return existing;
  }

  const email = user.email;

  if (!email) {
    throw new Error("Authenticated user is missing an email address");
  }

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
      role: ROLES.CANDIDATE,
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  // Bypass request cache after insert race — re-read from DB.
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

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
