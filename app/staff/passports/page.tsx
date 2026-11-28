import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/admin-ui";
import { PassportListClient } from "@/components/passport-list-client";
import { searchInternalPassports } from "@/app/actions/passport-search";

export const metadata = { title: "Passports — Staff Desk" };

/**
 * Staff passport desk: the server renders the first page as the island's
 * initial snapshot, then `PassportListClient` drives debounced search +
 * receipt-day filtering and load-more paging through the indexed search
 * action — the whole collection is never loaded or re-rendered. Results show
 * as a fixed-height, horizontally scrollable table; the registry list feeds
 * its Deliver dialog (bounded, tens of rows).
 */
export default async function StaffPassportsPage() {
  await requireStaff();

  const [initial, collectors] = await Promise.all([
    searchInternalPassports({}),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <PageShell>
      <PassportListClient
        initial={initial}
        collectors={collectors}
        returnTo="/staff/passports"
        emptyHint="Record your first passport on the Passport Entry page — it will appear here with its status and fee details."
      />
    </PageShell>
  );
}
