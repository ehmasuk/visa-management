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
 *  - passport-number prefix search: anchored `startsWith` on the indexed
 *    passportNumber field (not unique — passports can return) → O(log n).
 *  - agency / status / branch / receipt-window filters: equality or range
 *    predicates over the compound (status|agencyName|branchName, receiptDate)
 *    indexes → index scan. A picked day is a two-point range
 *    (day start → next-day start) on the same receiptDate index.
 *  - holder-name substring: the one unanchored predicate — scanned inside
 *    MongoDB (C++) and throttled by the 300ms client debounce; results are
 *    never round-tripped to the browser for filtering.
 *  - KPI cards: database aggregations (count/sum pipelines) — the totals are
 *    computed where the data lives, not by summing rows in JS.
 */

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { reportDateRange } from "@/lib/report-dates";
import type { Passport, Prisma } from "@prisma/client";

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
  branch?: string;
  status?: string;
  timeWindow?: string;
  page?: number;
};

/** Full passport rows (same shape as the desk lists) so reports can render
 * the identical table — all fields and real Dates. */
export type ReportRow = Passport;

export type ReportKpis = {
  totalPassports: number;
  totalFees: number;
  dueAmount: number;
};

export type ReportResult = {
  rows: ReportRow[];
  total: number;
  kpis: ReportKpis;
  /** True when pagination hit the MAX_PAGES guardrail. */
  capped: boolean;
};

const STATUSES = ["RECEIVED", "UNDER_REVIEW", "SUBMITTED", "DELIVERED"] as const;

/**
 * Build the passport filter. Unknown/blank values are ignored (not guessed),
 * so a tampered or malformed request degrades to the wider filter rather
 * than erroring. Search text matches passport number (both the typed and the
 * upper-cased prefix, ahead of the unique index), holder name substring, and
 * — for digits-only queries — the contact number prefix. A validated
 * specific date replaces the coarser timeWindow range; every other filter
 * (agency, branch, status, search) still combines with it via AND.
 */
function buildFilters(input: ReportQuery): Prisma.PassportWhereInput {
  const where: Prisma.PassportWhereInput = {};

  if (input.agency) {
    where.agencyName = input.agency;
  }
  if (input.branch) {
    where.branchName = input.branch;
  }
  if ((STATUSES as readonly string[]).includes(input.status ?? "")) {
    where.status = input.status as (typeof STATUSES)[number];
  }
  const range = reportDateRange(input);
  if (range) where.receiptDate = range;

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

  // Payments are agency-level: only the agency and date filters apply to them.
  const paymentWhere: Prisma.PaymentWhereInput = {};
  if (input.agency) paymentWhere.agencyName = input.agency;
  const range = reportDateRange(input);
  if (range) paymentWhere.receivedAt = range;

  const [records, total, feeAgg, paymentAgg] = await Promise.all([
    prisma.passport.findMany({
      where,
      // Secondary key keeps paging stable when rows share a receipt date.
      orderBy: [{ receiptDate: "desc" }, { id: "desc" }],
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.passport.count({ where }),
    prisma.passport.aggregate({ where, _sum: { fee: true } }),
    prisma.payment.aggregate({ where: paymentWhere, _sum: { amount: true } }),
  ]);

  const totalFees = feeAgg._sum.fee ?? 0;
  const totalPayments = paymentAgg._sum.amount ?? 0;

  return {
    rows: records,
    total,
    kpis: {
      totalPassports: total,
      totalFees,
      dueAmount: totalFees - totalPayments,
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
