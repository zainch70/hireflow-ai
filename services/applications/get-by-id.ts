import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications } from "@/db/schema";
import type { Application } from "@/services/applications/types";

export async function getApplicationById(
  applicationId: string,
): Promise<Application | null> {
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  return row ?? null;
}
