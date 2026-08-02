import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { userRoleEnum, timestampConfig } from "./enums";
import { timestamps } from "./timestamps";

/**
 * App user profile.
 * `id` must match Supabase `auth.users.id` (create that FK in Supabase/SQL yourself if needed).
 * Covers HR, admin, and candidate accounts.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull().default("candidate"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    headline: text("headline"),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", timestampConfig),
    ...timestamps,
  },
  (table) => [
    index("profiles_email_idx").on(table.email),
    index("profiles_role_idx").on(table.role),
  ],
);
