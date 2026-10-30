import { requireAgency } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, SubmitButton } from "@/components/admin-ui";
import { requestPayment } from "@/app/actions/payment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  IdCardIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  Truck,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Agency Portal — Visa Management" };

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function fmt(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AgencyPage() {
  const session = await requireAgency();
  const agencyGmail = session.user.email.toLowerCase();

  // Task 6.1 — data isolation: only THIS agency's passports.
  const passports = await prisma.passport.findMany({
    where: { agencyGmail },
    orderBy: { receiptDate: "desc" },
    include: { payment: true },
  });

  const totalCount = passports.length;
  const receivedCount = passports.filter((p) => p.status === "RECEIVED").length;
  const deliveredCount = passports.filter((p) => p.status === "DELIVERED").length;
  const unpaidCount = passports.filter((p) => p.payment?.status === "UNPAID").length;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <RoleNav pathname="/agency" role="AGENCY" userLabel={session.user.name ?? session.user.email} />
      <PageShell
        title="Agency Passport Portal"
        subtitle={`Signed in as ${agencyGmail}. Self-service tracking for your submitted client passports.`}
      >
        <div className="space-y-6">
          {/* Agency Summary KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Submitted
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                {totalCount}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                In Processing
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">
                {receivedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Delivered
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {deliveredCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending Settlement
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-amber-700 dark:text-amber-300">
                {unpaidCount}
              </p>
            </div>
          </div>

          {/* Passports List */}
          {passports.length === 0 ? (
            <Empty className="border border-border/80 rounded-2xl bg-card p-12">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                  <IdCardIcon className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No passports recorded for your agency yet</EmptyTitle>
                <EmptyDescription>
                  Our office staff will enter your passports here once they are received via a collector.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="space-y-4">
              {passports.map((passport) => {
                const delivered = passport.status === "DELIVERED";
                const payment = passport.payment;
                const paid = payment?.status === "PAID";
                const requested = payment?.status === "REQUESTED";
                const showPay = delivered && payment?.status === "UNPAID";

                return (
                  <li key={passport.id}>
                    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all">
                      <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-extrabold text-foreground">
                              {passport.passportNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                delivered
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  delivered ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                              />
                              {delivered ? "Delivered" : "Counter Received"}
                            </span>

                            {paid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="size-3" />
                                <span>Paid</span>
                              </span>
                            ) : requested ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Clock className="size-3" />
                                <span>Settlement Awaiting Staff Approval</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <span>Unpaid</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-foreground">
                            {passport.holderName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>Fee: <strong className="font-mono text-foreground">{taka(passport.fee)}</strong></span>
                            <span>•</span>
                            <span>Received: {fmt(passport.receiptDate)}</span>
                            {passport.deliveryDate ? (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Delivered: {fmt(passport.deliveryDate)}
                                </span>
                              </>
                            ) : null}
                            {passport.deliveryCollectorName ? (
                              <>
                                <span>•</span>
                                <span>Courier: {passport.deliveryCollectorName}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          {showPay ? (
                            <form action={requestPayment}>
                              <input type="hidden" name="id" value={passport.id} />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                              >
                                <CreditCard className="size-4" />
                                <span>Request Payment Approval</span>
                              </button>
                            </form>
                          ) : null}
                          {paid ? (
                            <div className="text-right text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>Approved {payment?.paidAt ? `on ${fmt(payment.paidAt)}` : ""}</span>
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PageShell>
    </div>
  );
}
