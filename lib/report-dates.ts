/** Shared date-window logic for admin report-style filters. */

export type ReportDateRange = { gte?: Date; lt?: Date };

/** Anchor for a named rolling window; null means all time. */
export function windowStart(timeWindow: string): Date | null {
  if (timeWindow === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (timeWindow === "7d") return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (timeWindow === "30d") return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

/** Validate a picked day ("YYYY-MM-DD") as a two-point local-day range. */
export function parseDay(date: string): [Date, Date] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  const start = new Date(year, monthIndex, day, 0, 0, 0, 0);
  if (
    start.getFullYear() !== year ||
    start.getMonth() !== monthIndex ||
    start.getDate() !== day
  ) {
    return null;
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start, end];
}

/** A specific day wins over the coarser rolling window. */
export function reportDateRange(input: {
  date?: string;
  timeWindow?: string;
}): ReportDateRange | null {
  const day = parseDay(input.date ?? "");
  if (day) return { gte: day[0], lt: day[1] };
  const start = windowStart(input.timeWindow ?? "");
  if (start) return { gte: start };
  return null;
}
