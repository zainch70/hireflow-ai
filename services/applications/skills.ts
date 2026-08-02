import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { skills } from "@/db/schema";
import type { ApplicationFormInput } from "@/schemas/applications";
import { isUniqueViolation } from "@/services/applications/errors";
import { slugify } from "@/utils/slug";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type SkillInput = ApplicationFormInput["skills"][number];

export type ResolvedApplicationSkill = {
  skillId: string;
  proficiency: string | null;
};

/** Lookup existing skills in one query, create missing in bulk, then return IDs. */
export async function resolveApplicationSkills(
  tx: Tx,
  skillInputs: SkillInput[],
): Promise<ResolvedApplicationSkill[]> {
  const uniqueBySlug = new Map<
    string,
    { name: string; proficiency: string | null }
  >();

  for (const skill of skillInputs) {
    const name = skill.name.trim();
    const slug = slugify(name);

    if (!uniqueBySlug.has(slug)) {
      uniqueBySlug.set(slug, {
        name,
        proficiency: skill.proficiency ?? null,
      });
    }
  }

  const slugs = [...uniqueBySlug.keys()];

  if (slugs.length === 0) {
    return [];
  }

  const existing = await tx
    .select({ id: skills.id, slug: skills.slug })
    .from(skills)
    .where(inArray(skills.slug, slugs));

  const idBySlug = new Map(existing.map((row) => [row.slug, row.id]));

  const missing = [...uniqueBySlug.entries()]
    .filter(([slug]) => !idBySlug.has(slug))
    .map(([slug, value]) => ({ name: value.name, slug }));

  if (missing.length > 0) {
    try {
      const created = await tx
        .insert(skills)
        .values(missing)
        .returning({ id: skills.id, slug: skills.slug });

      for (const row of created) {
        idBySlug.set(row.slug, row.id);
      }
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const refetched = await tx
        .select({ id: skills.id, slug: skills.slug })
        .from(skills)
        .where(inArray(skills.slug, slugs));

      for (const row of refetched) {
        idBySlug.set(row.slug, row.id);
      }
    }
  }

  return [...uniqueBySlug.entries()].map(([slug, value]) => {
    const skillId = idBySlug.get(slug);

    if (!skillId) {
      throw new Error(`Failed to resolve skill: ${value.name}`);
    }

    return {
      skillId,
      proficiency: value.proficiency,
    };
  });
}
