import { prisma } from "@/lib/prisma";

/**
 * Admin metrics reports (spec admin/reports) — computed on demand from live
 * data (recorded assumption). Small dataset, so aggregation happens in JS
 * after narrow selects.
 *
 * Date anchors:
 *  - Passport counts group by the passport's receiptDate (when collected).
 *  - Money groups by the payment request's createdAt (the only date both
 *    paid and unpaid requests share; paidAt only exists for approved ones).
 *  Range boundaries and day/month buckets use the server's local timezone.
 */

export type GroupBy = "day" | "month" | "agency";

export const GROUP_BY_OPTIONS = ["day", "month", "agency"] as const;

export function parseGroupBy(value: string | undefined | null): GroupBy {
  return (GROUP_BY_OPTIONS as readonly string[]).includes(value ?? "")
    ? (value as GroupBy)
    : "day";
}

/** Parse a yyyy-mm-dd filter into an inclusive local-day range, or null. */
export function parseDateFilter(
  value: string | null | undefined
): { start: Date; end: Date } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return {
    start: new Date(year, month - 1, day, 0, 0, 0, 0),
    end: new Date(year, month - 1, day, 23, 59, 59, 999),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
});

type Bucket = { key: string; label: string };

function bucketFor(groupBy: GroupBy, receipt: Date, agencyName: string): Bucket {
  if (groupBy === "agency") {
    return { key: agencyName, label: agencyName };
  }
  const y = receipt.getFullYear();
  const m = receipt.getMonth() + 1;
  const d = receipt.getDate();
  if (groupBy === "day") {
    return { key: `${y}-${pad2(m)}-${pad2(d)}`, label: DAY_LABEL.format(receipt) };
  }
  return { key: `${y}-${pad2(m)}`, label: MONTH_LABEL.format(new Date(y, m - 1, 15)) };
}

type ReportParams = {
  groupBy?: GroupBy;
  from?: string | null;
  to?: string | null;
  agencyGmail?: string | null;
};

/**
 * Requirement: Admin views passport count report — passports collected,
 * grouped by day / month / agency.
 */
export type PassportReportRow = Bucket & {
  count: number;
  receivedCount: number;
  deliveredCount: number;
  totalFee: number;
};

export async function passportCountReport(
  params: ReportParams
): Promise<PassportReportRow[]> {
  const groupBy = parseGroupBy(params.groupBy);
  const from = parseDateFilter(params.from);
  const to = parseDateFilter(params.to);

  const where: {
    receiptDate?: { gte?: Date; lte?: Date };
    agencyGmail?: string;
  } = {};
  if (from || to) {
    where.receiptDate = {
      ...(from ? { gte: from.start } : {}),
      ...(to ? { lte: to.end } : {}),
    };
  }
  if (params.agencyGmail) {
    where.agencyGmail = params.agencyGmail;
  }

  const rows = await prisma.passport.findMany({
    where,
    select: { receiptDate: true, agencyName: true, status: true, fee: true },
  });

  const buckets = new Map<string, PassportReportRow>();
  for (const row of rows) {
    const { key, label } = bucketFor(groupBy, row.receiptDate, row.agencyName);
    const isReceived = row.status === "RECEIVED";
    const isDelivered = row.status === "DELIVERED";
    const fee = row.fee || 0;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
      if (isReceived) bucket.receivedCount += 1;
      if (isDelivered) bucket.deliveredCount += 1;
      bucket.totalFee += fee;
    } else {
      buckets.set(key, {
        key,
        label,
        count: 1,
        receivedCount: isReceived ? 1 : 0,
        deliveredCount: isDelivered ? 1 : 0,
        totalFee: fee,
      });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Requirement: Admin views money collected report (paid vs unpaid tracked
 * separately), grouped by day / month / agency. Unpaid = not yet approved,
 * which includes rejected requests awaiting re-submission (the money is
 * still owed).
 */
export type MoneyReportRow = Bucket & {
  paidTotal: number;
  unpaidTotal: number;
  paidCount: number;
  unpaidCount: number;
};

export async function moneyReport(params: ReportParams): Promise<MoneyReportRow[]> {
  const groupBy = parseGroupBy(params.groupBy);
  const from = parseDateFilter(params.from);
  const to = parseDateFilter(params.to);

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from.start } : {}),
      ...(to ? { lte: to.end } : {}),
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    select: {
      amount: true,
      status: true,
      createdAt: true,
      passport: { select: { agencyName: true, agencyGmail: true } },
    },
  });
  const scoped =
    params.agencyGmail
      ? payments.filter((p) => p.passport.agencyGmail === params.agencyGmail)
      : payments;

  const buckets = new Map<string, MoneyReportRow>();
  for (const payment of scoped) {
    const { key, label } = bucketFor(
      groupBy,
      payment.createdAt,
      payment.passport.agencyName
    );
    const paid = payment.status === "PAID";
    const bucket = buckets.get(key);
    if (bucket) {
      if (paid) {
        bucket.paidTotal += payment.amount;
        bucket.paidCount += 1;
      } else {
        bucket.unpaidTotal += payment.amount;
        bucket.unpaidCount += 1;
      }
    } else {
      buckets.set(key, {
        key,
        label,
        paidTotal: paid ? payment.amount : 0,
        unpaidTotal: paid ? 0 : payment.amount,
        paidCount: paid ? 1 : 0,
        unpaidCount: paid ? 0 : 1,
      });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}
