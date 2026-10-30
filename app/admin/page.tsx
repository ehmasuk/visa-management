import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import {
  AdminDashboardClient,
  type AdminDashboardData,
} from "@/components/admin-dashboard-client";

export const metadata = { title: "Admin Overview — Visa Management" };

export default async function AdminPage() {
  const session = await requireAdmin();

  const [
    branches,
    agencies,
    collectors,
    staff,
    visaTypes,
    services,
    totalPassports,
    receivedPassports,
    deliveredPassports,
    paidAggregate,
    unpaidAggregate,
    recentPassportsRaw,
  ] = await Promise.all([
    prisma.branch.count(),
    prisma.agency.count(),
    prisma.collector.count(),
    prisma.staff.count(),
    prisma.visaType.count(),
    prisma.service.count(),
    prisma.passport.count(),
    prisma.passport.count({ where: { status: "RECEIVED" } }),
    prisma.passport.count({ where: { status: "DELIVERED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "UNPAID" },
    }),
    prisma.passport.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        passportNumber: true,
        holderName: true,
        agencyName: true,
        status: true,
        fee: true,
        lastEditedByName: true,
        updatedAt: true,
      },
    }),
  ]);

  const dashboardData: AdminDashboardData = {
    counts: {
      branches,
      agencies,
      collectors,
      staff,
      visaTypes,
      services,
      totalPassports,
      receivedPassports,
      deliveredPassports,
      paidAmount: paidAggregate._sum.amount ?? 0,
      unpaidAmount: unpaidAggregate._sum.amount ?? 0,
    },
    recentPassports: recentPassportsRaw.map((p) => ({
      id: p.id,
      passportNumber: p.passportNumber,
      holderName: p.holderName,
      agencyName: p.agencyName,
      status: p.status,
      fee: p.fee,
      lastEditedByName: p.lastEditedByName,
      updatedAt: p.updatedAt.toISOString(),
    })),
    adminEmail: session.user.email ?? "Admin",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <AdminDashboardClient data={dashboardData} />
    </div>
  );
}
