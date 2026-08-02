import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ROLES } from "@/constants/roles";

export type HrTeamMember = {
  id: string;
  fullName: string;
  email: string;
};

/** Active HR / admin profiles for assignment pickers. */
export async function listHrTeamMembers(): Promise<HrTeamMember[]> {
  return db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        inArray(profiles.role, [ROLES.HR, ROLES.ADMIN]),
        eq(profiles.isActive, true),
      ),
    )
    .orderBy(asc(profiles.fullName));
}
