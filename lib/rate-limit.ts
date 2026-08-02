import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { rateLimitBuckets } from "@/db/schema";
import { AppError } from "@/lib/errors/app-error";

export const RATE_LIMITS = {
  /** Public job applications per client IP. */
  apply: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** AI shortlist runs per HR user. */
  aiShortlist: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;

export function rateLimitExceededError(retryAfterSeconds: number) {
  return new AppError(
    `Too many requests. Try again in about ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} minute(s).`,
    {
      code: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
      details: { retryAfterSeconds },
    },
  );
}

/** Best-effort client IP from proxy headers (Vercel / common reverse proxies). */
export async function getRequestClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Fixed-window limiter backed by Postgres (works across serverless instances).
 * Throws AppError RATE_LIMIT_EXCEEDED when over the limit.
 */
export async function enforceRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<void> {
  const now = new Date();
  const windowMs = input.windowMs;

  const [row] = await db
    .insert(rateLimitBuckets)
    .values({
      key: input.key,
      count: 1,
      windowStartsAt: now,
    })
    .onConflictDoUpdate({
      target: rateLimitBuckets.key,
      set: {
        count: sql`CASE
          WHEN ${rateLimitBuckets.windowStartsAt} <= ${now.toISOString()}::timestamptz - (${windowMs}::bigint * interval '1 millisecond')
          THEN 1
          ELSE ${rateLimitBuckets.count} + 1
        END`,
        windowStartsAt: sql`CASE
          WHEN ${rateLimitBuckets.windowStartsAt} <= ${now.toISOString()}::timestamptz - (${windowMs}::bigint * interval '1 millisecond')
          THEN ${now.toISOString()}::timestamptz
          ELSE ${rateLimitBuckets.windowStartsAt}
        END`,
      },
    })
    .returning();

  if (!row) {
    throw new AppError("Failed to enforce rate limit", {
      code: "RATE_LIMIT_ERROR",
      statusCode: 500,
    });
  }

  if (row.count > input.limit) {
    const retryAfterSeconds = Math.ceil(
      (row.windowStartsAt.getTime() + windowMs - Date.now()) / 1000,
    );
    throw rateLimitExceededError(Math.max(1, retryAfterSeconds));
  }
}
