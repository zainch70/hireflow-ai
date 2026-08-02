/**
 * Date helpers that tolerate both live Drizzle `Date`s and ISO strings.
 *
 * `unstable_cache` JSON-serializes results — on a cache *hit*, every `Date`
 * becomes a string. Calling `.toISOString()` / `.toLocaleDateString()` on that
 * value throws and trips the route error boundary (often only after a few navigations).
 *
 * Prefer these helpers (or return ISO strings from cached loaders) instead of
 * calling Date methods on values that may have passed through Data Cache.
 */

export type Timestamp = Date | string;
export type TimestampNull = Date | string | null | undefined;

export function toDate(value: Timestamp): Date {
  return value instanceof Date ? value : new Date(value);
}

export function toIsoString(value: Timestamp): string {
  return toDate(value).toISOString();
}

export function toIsoStringOrNull(value: TimestampNull): string | null {
  if (value == null) return null;
  return toIsoString(value);
}

export function formatDate(
  value: Timestamp,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
): string {
  return toDate(value).toLocaleDateString(locales, options);
}

export function formatDateTime(
  value: Timestamp,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
): string {
  return toDate(value).toLocaleString(locales, options);
}
