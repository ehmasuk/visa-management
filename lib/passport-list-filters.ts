import type { Prisma } from "@prisma/client";

/**
 * Pure filter building for the three passport desk lists (staff, admin,
 * agency). Kept out of the "use server" action module so the clause logic is
 * spot-checkable in a REPL; the actions inject role/agency scoping on top.
 * Mirrors the admin-reports semantics: unknown/blank inputs are ignored, not
 * guessed, so a tampered request degrades to the wider filter rather than
 * erroring.
 */

export type PassportListQuery = {
  q?: string;
  /** "YYYY-MM-DD" receipt day; blank or malformed values are ignored. */
  date?: string;
  page?: number;
};

/**
 * Validate a picked receipt day ("YYYY-MM-DD", native date-input format) and
 * resolve it to the two-point index range [start of day, start of next day).
 * Rollover or malformed strings (e.g. 2026-02-30, "abc") return null — the
 * filter degrades to "ignore this input" rather than erroring. Both bounds
 * hit the receiptDate index, so a day query stays an index scan.
 */
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

/**
 * Build the desk filter. Search text matches passport number (both the typed
 * and the upper-cased prefix, ahead of the unique index), holder-name
 * substring and — when `withContact` (internal audiences) — a digits-only
 * contact-number prefix.
 */
export function buildListFilters(
  input: PassportListQuery,
  extra: Prisma.PassportWhereInput,
  { withContact = false }: { withContact?: boolean } = {}
): Prisma.PassportWhereInput {
  const where: Prisma.PassportWhereInput = { ...extra };

  const day = parseDay(input.date ?? "");
  if (day) {
    const [dayStart, dayEnd] = day;
    where.receiptDate = { gte: dayStart, lt: dayEnd };
  }

  const q = (input.q ?? "").trim();
  if (q) {
    const clauses: Prisma.PassportWhereInput[] = [
      { passportNumber: { startsWith: q.toUpperCase() } },
      { holderName: { contains: q } },
    ];
    const digits = q.replace(/\s+/g, "");
    if (/^\d+$/.test(digits)) {
      if (withContact) {
        clauses.push({ contactNumber: { startsWith: digits } });
      }
    } else if (q !== q.toUpperCase()) {
      // Cover staff-entered lower-case passport numbers; only added when it
      // differs from the upper-cased clause (digits uppercase to themselves).
      clauses.push({ passportNumber: { startsWith: q } });
    }
    where.OR = clauses;
  }

  return where;
}
