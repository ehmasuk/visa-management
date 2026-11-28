import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getInitialAgencyPayments } from "@/app/actions/agency-payments";
import { AdminPaymentsClient } from "@/components/admin-payments-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agency Payments — Admin" };

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const [initial, agencies, collectors] = await Promise.all([
    getInitialAgencyPayments(),
    prisma.agency.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.collector.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <AdminPaymentsClient
        initial={initial}
        agencies={agencies}
        collectors={collectors}
      />
    </div>
  );
}
