import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { AdminReportsClient } from "@/components/admin-reports-client";
import { getInitialReport } from "@/app/actions/reports";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Report" };

// The passport collection is queried through the report server actions —
// one page of rows plus database-side aggregates per request (see
// app/actions/reports.ts) — so this page stays O(pageSize) in payload size
// no matter how large the collection grows.
export default async function AdminReportsPage() {
  await requireAdmin();

  const [agencies, initial] = await Promise.all([
    prisma.agency.findMany({
      orderBy: { name: "asc" },
      select: { name: true, gmail: true },
    }),
    getInitialReport(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <AdminReportsClient agencies={agencies} initial={initial} />
    </div>
  );
}
