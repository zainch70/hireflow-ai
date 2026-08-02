import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";

/**
 * Shared Next.js Data Cache tags for HR + careers reads.
 *
 * Cached loaders must return JSON-safe values (ISO date strings, not `Date`).
 * See `lib/dates.ts` — cache hits revive timestamps as strings.
 *
 * Mutations must call the helpers below so tags + routes stay fresh.
 * Soft-nav client cache (`staleTimes`) is also cleared for revalidated paths.
 */
export const CACHE_TAGS = {
  jobs: "jobs",
  applications: "applications",
  ai: "ai-analyses",
  dashboard: "hr-dashboard",
  careers: "careers",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export function revalidateCacheTags(...tags: CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/** Public careers tree (list + detail + apply). */
function revalidateCareersTree() {
  revalidatePath(ROUTES.careers, "layout");
}

/** After job mutations — HR lists, overview, stats, and public careers. */
export function revalidateAfterJobChange(jobId?: string) {
  revalidateCacheTags(
    CACHE_TAGS.jobs,
    CACHE_TAGS.applications,
    CACHE_TAGS.dashboard,
    CACHE_TAGS.careers,
  );
  revalidatePath(ROUTES.dashboard.jobs);
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
  revalidateCareersTree();
  if (jobId) {
    revalidatePath(`${ROUTES.dashboard.jobs}/${jobId}/edit`);
  }
}

/** After application / status / note / public submit. */
export function revalidateAfterApplicationChange(applicationId?: string) {
  revalidateCacheTags(
    CACHE_TAGS.applications,
    CACHE_TAGS.dashboard,
    CACHE_TAGS.ai,
  );
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
  if (applicationId) {
    revalidatePath(`${ROUTES.dashboard.applications}/${applicationId}`);
  }
}

/** After AI shortlist run. */
export function revalidateAfterAiShortlist(applicationId: string) {
  revalidateCacheTags(
    CACHE_TAGS.ai,
    CACHE_TAGS.applications,
    CACHE_TAGS.dashboard,
  );
  revalidatePath(`${ROUTES.dashboard.applications}/${applicationId}`);
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
}
