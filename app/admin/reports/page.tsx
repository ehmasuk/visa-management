import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { AdminReportsClient } from "@/components/admin-reports-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Report" };

export default async function AdminReportsPage() {
  await requireAdmin();

  const [agencies, passportRecords] = await Promise.all([
    prisma.agency.findMany({
      orderBy: { name: "asc" },
      select: { name: true, gmail: true },
    }),
    prisma.passport.findMany({
      orderBy: { receiptDate: "desc" },
      include: { payment: true },
    }),
  ]);

  const serializedPassports = passportRecords.map((p) => ({
    id: p.id,
    passportNumber: p.passportNumber,
    holderName: p.holderName,
    agencyName: p.agencyName,
    collectorName: p.collectorName,
    deliveryCollectorName: p.deliveryCollectorName,
    fee: p.fee,
    status: p.status,
    receiptDate: p.receiptDate.toISOString(),
    deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString() : null,
    paymentStatus: p.payment?.status ?? null,
    paymentAmount: p.payment?.amount ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <AdminReportsClient
        agencies={agencies}
        passports={serializedPassports}
      />
    </div>
  );
}
