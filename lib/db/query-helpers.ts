/**
 * Shared DB/query helpers used across services.
 * Keep pure — no DB client imports here.
 */

/** Strip LIKE wildcards and cap length for safe `ilike` patterns. */
export function sanitizeLikeTerm(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const cleaned = value.trim().slice(0, 100).replace(/[%_]/g, " ");
  return cleaned.length > 0 ? cleaned : undefined;
}

/** Parse nullable numeric strings from Postgres `numeric` columns. */
export function parseNumericString(value: string | null): number | null {
  if (value == null || value === "") {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Local midnight, then subtract (days - 1) for inclusive window start. */
export function startOfLocalDayWindow(days: number): Date {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  return since;
}

/** Fill a continuous daily series (YYYY-MM-DD) with zeros for missing days. */
export function fillDailyCounts(
  since: Date,
  days: number,
  byDate: Map<string, number>,
): Array<{ date: string; count: number }> {
  const series: Array<{ date: string; count: number }> = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    series.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  return series;
}
