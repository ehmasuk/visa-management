"use server";

/**
 * Report data actions: everything powering /admin/reports is computed
 * SERVER-SIDE so the page never loads the whole passport collection.
 * With very large collections (target: 1M+ passports) loading findMany(all)
 * and filtering in the browser collapses — multi-MB payloads plus O(n) client
 * loops per keystroke/filter change. Instead the database does the search,
 * counting and summing with indexed predicates, and the client receives ONE
 * page of rows per request.
 *
 * Query cost profile at 1M records:
 *  - passport-number prefix search: anchored `startsWith` on the UNIQUE
 *    passportNumber index → O(log n).
 *  - agency / status / payment / receipt-window filters: equality or range
 *    predicates over existing indexes (status, agencyName) and the added
 *    receiptDate index → index scan. A picked day is a two-point range
 *    (day start → next-day start) on the same receiptDate index.
 *  - holder-name substring: the one unanchored predicate — scanned inside
 *    MongoDB (C++) and throttled by the 300ms client debounce; results are
 *    never round-tripped to the browser for filtering.
 *  - KPI cards: database aggregations (count/sum pipelines) — the totals are
 *    computed where the data lives, not by summing rows in JS.
 */

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

// MongoDB `skip` is O(skipped docs). Cap deep pagination so every request
// stays near O(1) regardless of result size; past the cap the UI asks for a
// refined search instead of paging further.
const MAX_PAGES = 200;

export type ReportQuery = {
  q?: string;
  /**YYYY-MM-DD receipt day; when set it wins over the timeWindow range. */
  date?: string;
  agency?: string;
  status?: string;
  payment?: string;
  timeWindow?: string;
  page?: number;
};

export type ReportRow = {
  id: string;
  passportNumber: string;
  holderName: string;
  agencyName: string;
  collectorName: string;
  fee: number;
  status: "RECEIVED" | "DELIVERED";
  receiptDate: string;
  paymentStatus: "PAID" | "UNPAID" | "REQUESTED" | null;
  paymentAmount: number | null;
};

export type ReportKpis = {
  totalPassports: number;
  totalFees: number;
  totalPaid: number;
  unpaidCount: number;
  totalUnpaid: number;
};

export type ReportResult = {
  rows: ReportRow[];
  total: number;
  kpis: ReportKpis;
  /** True when pagination hit the MAX_PAGES guardrail. */
  capped: boolean;
};

const STATUSES = ["RECEIVED", "DELIVERED"] as const;
const PAYMENTS = ["PAID", "UNPAID", "REQUESTED"] as const;

/** System-managed receipt-date window; anchor computed at query time. */
function windowStart(timeWindow: string): Date | null {
  if (timeWindow === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (timeWindow === "7d") return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (timeWindow === "30d") return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

/**
 * Validate a picked receipt day ("YYYY-MM-DD", native date-input format) and
 * resolve it to the two-point index range [start of day, start of next day).
 * Rolls over or malformed strings (e.g. 2026-02-30, "abc") return null — the
 * filter degrades to "ignore this input" rather than erroring. Both bounds
 * hit the receiptDate index, so a day query stays an index scan.
 */
function parseDay(date: string): [Date, Date] | null {
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
 * Build the passport filter. Unknown/blank values are ignored (not guessed),
 * so a tampered or malformed request degrades to the wider filter rather
 * than erroring. Search text matches passport number (both the typed and the
 * upper-cased prefix, ahead of the unique index), holder name substring, and
 * — for digits-only queries — the contact number prefix. A validated
 * specific date replaces the coarser timeWindow range; every other filter
 * (agency, status, settlement, search) still combines with it via AND.
 */
function buildFilters(input: ReportQuery): Prisma.PassportWhereInput {
  const where: Prisma.PassportWhereInput = {};

  if (input.agency) {
    where.agencyName = input.agency;
  }
  if ((STATUSES as readonly string[]).includes(input.status ?? "")) {
    where.status = input.status as (typeof STATUSES)[number];
  }
  if ((PAYMENTS as readonly string[]).includes(input.payment ?? "")) {
    where.payment = { status: input.payment as (typeof PAYMENTS)[number] };
  }

  // Specific day first: it is strictly narrower than any timeWindow, so the
  // two time mechanisms stay mutually exclusive.
  const day = parseDay(input.date ?? "");
  if (day) {
    const [dayStart, dayEnd] = day;
    where.receiptDate = { gte: dayStart, lt: dayEnd };
  } else {
    const start = windowStart(input.timeWindow ?? "");
    if (start) {
      where.receiptDate = { gte: start };
    }
  }

  const q = (input.q ?? "").trim();
  if (q) {
    const clauses: Prisma.PassportWhereInput[] = [
      { passportNumber: { startsWith: q.toUpperCase() } },
      { holderName: { contains: q } },
    ];
    const digits = q.replace(/\s+/g, "");
    if (/^\d+$/.test(digits)) {
      clauses.push({ contactNumber: { startsWith: digits } });
    } else if (q !== q.toUpperCase()) {
      // Cover staff-entered lower-case passport numbers; only added when it
      // differs from the upper-cased clause (digits uppercase to themselves).
      clauses.push({ passportNumber: { startsWith: q } });
    }
    where.OR = clauses;
  }

  return where;
}

async function loadReport(input: ReportQuery): Promise<ReportResult> {
  await requireAdmin();

  const requestedPage = Number.isFinite(input.page)
    ? Math.max(0, Math.floor(input.page as number))
    : 0;
  const page = Math.min(requestedPage, MAX_PAGES - 1);
  const capped = requestedPage >= MAX_PAGES;

  const where = buildFilters(input);
  // Passports with no settlement yet, or still awaiting approval: count them
  // for the unpaid-record card but sum their fee only when a payment exists
  // (same semantics as the previous client-side totals).
  const unpaidWhere: Prisma.PassportWhereInput = {
    AND: [
      where,
      {
        OR: [
          { payment: { status: { in: ["UNPAID", "REQUESTED"] } } },
          { payment: null },
        ],
      },
    ],
  };

  const [
    records,
    total,
    feeAgg,
    paidAgg,
    unpaidCount,
    unpaidFeeAgg,
  ] = await Promise.all([
    prisma.passport.findMany({
      where,
      orderBy: { receiptDate: "desc" },
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        passportNumber: true,
        holderName: true,
        agencyName: true,
        collectorName: true,
        fee: true,
        status: true,
        receiptDate: true,
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.passport.count({ where }),
    prisma.passport.aggregate({ where, _sum: { fee: true } }),
    prisma.payment.aggregate({
      // Same outer filter, restricted to approved settlement payments.
      where: { passport: where, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.passport.count({ where: unpaidWhere }),
    prisma.passport.aggregate({ where: unpaidWhere, _sum: { fee: true } }),
  ]);

  return {
    rows: records.map((p) => ({
      id: p.id,
      passportNumber: p.passportNumber,
      holderName: p.holderName,
      agencyName: p.agencyName,
      collectorName: p.collectorName,
      fee: p.fee,
      status: p.status as "RECEIVED" | "DELIVERED",
      receiptDate: p.receiptDate.toISOString(),
      paymentStatus: p.payment?.status ?? null,
      paymentAmount: p.payment?.amount ?? null,
    })),
    total,
    kpis: {
      totalPassports: total,
      totalFees: feeAgg._sum.fee ?? 0,
      totalPaid: paidAgg._sum.amount ?? 0,
      unpaidCount,
      totalUnpaid: unpaidFeeAgg._sum.fee ?? 0,
    },
    capped,
  };
}

/** One page of report rows + server-computed totals for the given filters. */
export async function searchReportData(
  input: ReportQuery
): Promise<ReportResult> {
  return loadReport(input);
}

/** Default snapshot (no filters) for the page's first paint. */
export async function getInitialReport(): Promise<ReportResult> {
  return loadReport({});
}
