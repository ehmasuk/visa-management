"use server";

/**
 * Passport list search action for the two internal desks:
 *  - /staff/passports
 *  - /admin/passports
 *
 * Same scale contract as the admin reports module (app/actions/reports.ts)
 * but with only the two filter axes those desks need: free-text search and a
 * picked receipt day. Filtering, counting and paging execute in MongoDB;
 * each request returns ONE page of rows plus database counts. Prefix and day
 * predicates are index-backed; holder-name substring is the one unindexed
 * scan, throttled by the client debounce.
 *
 * Query cost profile at 1M records:
 *  - passport-number prefix: anchored `startsWith` on the indexed
 *    passportNumber field (not unique — passports can return) → O(log n).
 *  - receipt-day: two-point range on the receiptDate index.
 *  - holder-name substring: the unanchored predicate — scanned inside
 *    MongoDB (C++), throttled by the client's 300 ms debounce, page ≤ 20.
 *  - total: a `count()` on the same indexed where clause, done once per page
 *    request so the client gets an exact page count without extra round trips.
 */

import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/guards";
import type { Passport, Prisma } from "@prisma/client";
import {
  buildListFilters,
  type PassportListQuery,
} from "@/lib/passport-list-filters";

/** Desk tables show 20 rows per page. */
const DEFAULT_PAGE_SIZE = 20;

// MongoDB `skip` is O(skipped docs). Cap the deepest reachable page (20k rows)
// so an unfiltered jump to page 50,000 can never force a full-collection walk;
// past the cap the UI asks for a refined search instead.
const MAX_PAGES = 1000;

/** A row is a full passport document; no relation includes are needed. */
export type PassportListRow = Passport;

export type PassportListResult = {
  rows: PassportListRow[];
  total: number;
  /** True when a page beyond MAX_PAGES was requested. */
  capped: boolean;
  /** Zero-based page actually served, after clamping to the available range. */
  page: number;
  pageSize: number;
  /** Total number of pages available for the applied filters. */
  pageCount: number;
};

/** One page of desk rows for the given filters, scoped by `scope`. */
async function loadList(
  scope: (
    where: Prisma.PassportWhereInput
  ) => Promise<Prisma.PassportWhereInput>,
  input: PassportListQuery,
  { withContact = false }: { withContact?: boolean } = {}
): Promise<PassportListResult> {
  const pageSize = DEFAULT_PAGE_SIZE;
  // `scope` re-verifies the acting role server-side before querying.
  const where = await scope(buildListFilters(input, {}, { withContact }));

  // Count first so the served page and total page count are always consistent,
  // even when a filter change lands while an old page number is still active.
  const total = await prisma.passport.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Number.isFinite(input.page)
    ? Math.max(0, Math.floor(input.page as number))
    : 0;
  const capped = requestedPage >= MAX_PAGES;
  const page = Math.min(requestedPage, MAX_PAGES - 1, pageCount - 1);

  const rows = await prisma.passport.findMany({
    where,
    // Secondary key makes ordering stable when passports share a receiptDate,
    // so page N never repeats or skips rows from page N-1.
    orderBy: [{ receiptDate: "desc" }, { id: "desc" }],
    skip: page * pageSize,
    take: pageSize,
  });

  return { rows, total, capped, page, pageSize, pageCount };
}

/** Staff/admin desk search — one page matching the filters. */
export async function searchInternalPassports(
  input: PassportListQuery
): Promise<PassportListResult> {
  return loadList(
    async (where) => {
      await requireStaffOrAdmin();
      return where;
    },
    input,
    { withContact: true }
  );
}

