import { requireStaff } from "@/lib/guards";
import { PageShell } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  Receipt,
  ArrowRight,
  PlusCircle,
  Truck,
  Eye,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Staff Workspace — Visa Management" };

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function StaffPage() {
  const session = await requireStaff();

  const [
    receivedPassports,
    deliveredPassports,
    unpaidPassports,
    pendingPayments,
    recentPassports,
  ] = await Promise.all([
    prisma.passport.count({ where: { status: "RECEIVED" } }),
    prisma.passport.count({ where: { status: "DELIVERED" } }),
    prisma.payment.count({ where: { status: "UNPAID" } }),
    prisma.payment.count({ where: { status: "REQUESTED" } }),
    prisma.passport.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { payment: true },
    }),
  ]);

  return (
    <PageShell
      title="Staff Operations Desk"
      subtitle="Daily intake, courier custody tracking, and agency payment settlement."
    >
      <div className="space-y-8">
        {/* Quick Operational Ribbon */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Ready for Passport Intake
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{session.user.name ?? session.user.email}</span>. Record incoming physical passports or verify couriers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/staff/payments"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-2xs"
            >
              <Receipt className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Pending Payments ({pendingPayments})</span>
            </Link>

            <Link
              href="/staff/passports"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <PlusCircle className="size-4" />
              <span>New Passport Entry</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Received / In Processing */}
          <Link
            href="/staff/passports"
            className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-blue-500/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                In Processing
              </span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-extrabold text-foreground">
              {receivedPassports}
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Awaiting delivery to agency
            </p>
          </Link>

          {/* Delivered Passports */}
          <Link
            href="/staff/passports"
            className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Delivered
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-extrabold text-foreground">
              {deliveredPassports}
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Completed custody chain
            </p>
          </Link>

          {/* Pending Payment Requests */}
          <Link
            href="/staff/payments"
            className="group rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-xs hover:border-amber-500/60 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Awaiting Approval
              </span>
              <div className="size-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Receipt className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-extrabold text-amber-700 dark:text-amber-300">
              {pendingPayments}
            </p>
            <p className="mt-1 text-xs text-amber-600/90 dark:text-amber-400/90 font-medium">
              Agency payment requests
            </p>
          </Link>

          {/* Unpaid Passports */}
          <Link
            href="/staff/passports"
            className="group rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 shadow-xs hover:border-rose-500/60 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Unpaid Passports
              </span>
              <div className="size-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="size-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-3xl font-extrabold text-rose-700 dark:text-rose-300">
              {unpaidPassports}
            </p>
            <p className="mt-1 text-xs text-rose-600/90 dark:text-rose-400/90 font-medium">
              Outstanding fees
            </p>
          </Link>
        </div>

        {/* Recent Passports Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Recent Passports Queue
              </h3>
              <p className="text-xs text-muted-foreground">
                Latest passports registered or updated by staff.
              </p>
            </div>
            <Link
              href="/staff/passports"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View all passports</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recentPassports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No passports recorded yet. Click &quot;New Passport Entry&quot; above to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPassports.map((p) => {
                const isDelivered = p.status === "DELIVERED";
                const isPaid = p.payment?.status === "PAID";
                const isRequested = p.payment?.status === "REQUESTED";

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {p.passportNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isDelivered ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                          />
                          {p.status}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-foreground">
                        {p.holderName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Agency: <span className="font-medium text-foreground">{p.agencyName}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                        Fee: {taka(p.fee)}
                        {isPaid ? (
                          <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
                            • Paid
                          </span>
                        ) : isRequested ? (
                          <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold font-sans">
                            • Awaiting Pay
                          </span>
                        ) : (
                          <span className="ml-2 text-rose-600 dark:text-rose-400 font-semibold font-sans">
                            • Unpaid
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(p.receiptDate)}
                      </span>
                      <Link
                        href={`/passports/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                      >
                        <Eye className="size-3 text-muted-foreground" />
                        <span>Manage</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
