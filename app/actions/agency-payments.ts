"use server";

/** Agency-wise payment summary for admin. All aggregation runs in MongoDB. */

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { reportDateRange } from "@/lib/report-dates";
import type { Payment, Prisma } from "@prisma/client";

const PAGE_SIZE = 50;
const MAX_PAGES = 100;

export type AgencyPaymentQuery = {
  q?: string;
  date?: string;
  timeWindow?: string;
  page?: number;
};

export type AgencySummary = {
  name: string;
  passportCount: number;
  totalFees: number;
  paymentCount: number;
  totalPaid: number;
  due: number;
  lastPaymentAt: Date | null;
};

export type AgencyPaymentResult = {
  agencies: AgencySummary[];
  records: Payment[];
  totalRecords: number;
  page: number;
  pageCount: number;
  capped: boolean;
  kpis: {
    totalPassports: number;
    totalFees: number;
    totalPaid: number;
    totalDue: number;
  };
};

export async function searchAgencyPayments(
  input: AgencyPaymentQuery
): Promise<AgencyPaymentResult> {
  await requireAdmin();

  const q = (input.q ?? "").trim();
  const range = reportDateRange(input);

  const agencies = await prisma.agency.findMany({
    where: q ? { name: { contains: q } } : {},
    orderBy: { name: "asc" },
    take: 200,
    select: { name: true },
  });
  const names = agencies.map((agency) => agency.name);

  const requestedPage = Number.isFinite(input.page)
    ? Math.max(0, Math.floor(input.page as number))
    : 0;
  const capped = requestedPage >= MAX_PAGES;
  const page = Math.min(requestedPage, MAX_PAGES - 1);

  // The picked day / rolling window applies to both passport receipt dates
  // and payment received dates, so every figure reflects the same period.
  const passportWhere: Prisma.PassportWhereInput = {
    agencyName: { in: names },
  };
  if (range) passportWhere.receiptDate = range;
  const paymentWhere: Prisma.PaymentWhereInput = {
    agencyName: { in: names },
  };
  if (range) paymentWhere.receivedAt = range;

  const [feeGroups, paidGroups, records, totalRecords] = await Promise.all([
    prisma.passport.groupBy({
      by: ["agencyName"],
      where: passportWhere,
      _sum: { fee: true },
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["agencyName"],
      where: paymentWhere,
      _sum: { amount: true },
      _count: { _all: true },
      _max: { receivedAt: true },
    }),
    prisma.payment.findMany({
      where: paymentWhere,
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.payment.count({ where: paymentWhere }),
  ]);

  const feeMap = new Map(feeGroups.map((group) => [group.agencyName, group]));
  const paidMap = new Map(paidGroups.map((group) => [group.agencyName, group]));

  const summaries = agencies.map((agency) => {
    const fee = feeMap.get(agency.name);
    const paid = paidMap.get(agency.name);
    const totalFees = fee?._sum.fee ?? 0;
    const totalPaid = paid?._sum.amount ?? 0;
    return {
      name: agency.name,
      passportCount: fee?._count._all ?? 0,
      totalFees,
      paymentCount: paid?._count._all ?? 0,
      totalPaid,
      due: totalFees - totalPaid,
      lastPaymentAt: paid?._max.receivedAt ?? null,
    };
  });

  return {
    agencies: summaries,
    records,
    totalRecords,
    page,
    pageCount: Math.max(1, Math.ceil(totalRecords / PAGE_SIZE)),
    capped,
    kpis: {
      totalPassports: summaries.reduce((sum, row) => sum + row.passportCount, 0),
      totalFees: summaries.reduce((sum, row) => sum + row.totalFees, 0),
      totalPaid: summaries.reduce((sum, row) => sum + row.totalPaid, 0),
      totalDue: summaries.reduce((sum, row) => sum + row.due, 0),
    },
  };
}

/** Default snapshot (no filters) for the first paint. */
export async function getInitialAgencyPayments(): Promise<AgencyPaymentResult> {
  return searchAgencyPayments({});
}
