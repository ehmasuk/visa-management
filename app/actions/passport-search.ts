"use server";

/**
 * Passport list search actions for the three desk surfaces:
 *  - /staff/passports and /admin/passports (internal audiences)
 *  - /agency (agency portal)
 *
 * Same scale contract as the admin reports module (app/actions/reports.ts)
 * but with only the two filter axes those desks need: free-text search and a
 * picked receipt day. Everything heavy executes in MongoDB over indexed
 * predicates; each request returns ONE page of rows plus database counts.
 *
 * Query cost profile at 1M records:
 *  - passport-number prefix: anchored `startsWith` on the UNIQUE
 *    passportNumber index → O(log n).
 *  - receipt-day: two-point range on the receiptDate index; for the agency
 *    the (agencyGmail, receiptDate) compound serves filter AND sort.
 *  - holder-name substring: the unanchored predicate — scanned inside
 *    MongoDB (C++), throttled by the client's 300 ms debounce, page ≤ 50.
 *  - total: a `count()` on the same indexed where clause.
 */

import { prisma } from "@/lib/prisma";
import { requireAgency, requireStaffOrAdmin } from "@/lib/guards";
import type { Prisma } from "@prisma/client";
import {
  buildListFilters,
  type PassportListQuery,
} from "@/lib/passport-list-filters";

const PAGE_SIZE = 50;

// MongoDB `skip` is O(skipped docs). Same guardrail as the reports module:
// past the cap the UI asks for a refined search instead of paging further.
const MAX_PAGES = 200;

/** A row keeps the card's exact prop shape so the shared card is reused as-is. */
export type PassportListRow = Prisma.PassportGetPayload<{
  include: { payment: true };
}>;

export type PassportListResult = {
  rows: PassportListRow[];
  total: number;
  /** True when pagination hit the MAX_PAGES guardrail. */
  capped: boolean;
  page: number;
};

/** One page of desk rows for the given filters, scoped by `scope`. */
async function loadList(
  scope: (
    where: Prisma.PassportWhereInput
  ) => Promise<Prisma.PassportWhereInput>,
  input: PassportListQuery,
  { withContact = false }: { withContact?: boolean } = {}
): Promise<PassportListResult> {
  const requestedPage = Number.isFinite(input.page)
    ? Math.max(0, Math.floor(input.page as number))
    : 0;
  const page = Math.min(requestedPage, MAX_PAGES - 1);
  const capped = requestedPage >= MAX_PAGES;

  // `scope` re-verifies the acting role server-side and, for agencies, injects
  // the session Gmail as the only shard the query may touch.
  const where = await scope(buildListFilters(input, {}, { withContact }));

  const [records, total] = await Promise.all([
    prisma.passport.findMany({
      where,
      orderBy: { receiptDate: "desc" },
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { payment: true },
    }),
    prisma.passport.count({ where }),
  ]);

  return { rows: records, total, capped, page };
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

/** Agency portal search — scoped to the ACTING agency's Gmail only. */
export async function searchAgencyPassports(
  input: PassportListQuery
): Promise<PassportListResult> {
  return loadList(async (where) => {
    const session = await requireAgency();
    // Data isolation is enforced here: the agency mailbox comes from the
    // authenticated session, never from action input.
    return { ...where, agencyGmail: session.user.email.toLowerCase() };
  }, input);
}
