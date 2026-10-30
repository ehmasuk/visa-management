import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaffOrAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmt, lastEditorLine, STATUS_BADGE, statusLabel } from "@/lib/passport-format";
import { Edit, ArrowLeft, FileCheck2, Clock, CreditCard, ShieldCheck } from "lucide-react";

export const metadata = { title: "Passport Dossier Details — Visa Management" };

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export default async function PassportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaffOrAdmin();
  const { id } = await params;

  const passport = await prisma.passport.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!passport) notFound();

  const backTo = session.user.role === "ADMIN" ? "/admin/passports" : "/staff/passports";
  const payment = passport.payment;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <RoleNav
        pathname={`/passports/${id}`}
        role={session.user.role}
        userLabel={session.user.name ?? session.user.email}
      />
      <PageShell
        title={`Passport ${passport.passportNumber}`}
        subtitle={`${passport.holderName} · Agency: ${passport.agencyName}`}
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/passports/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-all"
          >
            <Edit className="size-3.5" />
            <span>Edit Passport</span>
          </Link>
          <Link
            href={backTo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold text-xs shadow-2xs hover:bg-muted transition-all"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Passports</span>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Entry details */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
              <FileCheck2 className="size-4.5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Passport Identification & Custody
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Passport Number">
                <span className="font-mono font-bold text-primary text-base">{passport.passportNumber}</span>
              </Detail>
              <Detail label="Status">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[passport.status]}`}>
                  <span className={`size-1.5 rounded-full ${passport.status === "DELIVERED" ? "bg-emerald-500" : "bg-blue-500"}`} />
                  {statusLabel(passport.status)}
                </span>
              </Detail>
              <Detail label="Service Fee">
                <span className="font-mono font-bold text-foreground">{taka(passport.fee)}</span>
              </Detail>
              <Detail label="Agency Name">{passport.agencyName}</Detail>
              <Detail label="Agency Gmail (Ownership)">{passport.agencyGmail}</Detail>
              <Detail label="Intake Collector (Courier)">{passport.collectorName}</Detail>
              <Detail label="Passport Holder Name">{passport.holderName}</Detail>
              <Detail label="Contact Number">{passport.contactNumber}</Detail>
              <Detail label="Visa Type">
                {passport.visaTypeName ?? "—"}
              </Detail>
              <Detail label="Service Tier">{passport.serviceName ?? "—"}</Detail>
              <div className="md:col-span-2 lg:col-span-3">
                <Detail label="Operational Comment">
                  {passport.comment ? (
                    <span className="text-muted-foreground">{passport.comment}</span>
                  ) : (
                    "—"
                  )}
                </Detail>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
              <Clock className="size-4.5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-foreground">
                Lifecycle & Timestamps
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Receipt Timestamp (Auto)">{fmt(passport.receiptDate)}</Detail>
              <Detail label="Delivery Timestamp (Auto)">
                {passport.deliveryDate ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmt(passport.deliveryDate)}</span>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="Assigned Delivery Courier">
                {passport.deliveryCollectorName ? (
                  <span className="font-semibold text-foreground">{passport.deliveryCollectorName}</span>
                ) : (
                  "—"
                )}
              </Detail>
            </div>
          </div>

          {/* Payment trail */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
              <CreditCard className="size-4.5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-foreground">
                Settlement & Payment Ledger
              </h2>
            </div>
            {payment ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Detail label="Settlement Amount">
                  <span className="font-mono font-bold text-foreground">{taka(payment.amount)}</span>
                </Detail>
                <Detail label="Settlement Status">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      payment.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : payment.status === "REQUESTED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {payment.status === "PAID"
                      ? "Settled (Approved)"
                      : payment.rejectedAt
                      ? "Payment Rejected"
                      : "Awaiting Staff Approval"}
                  </span>
                </Detail>
                <Detail label="Requested At">{fmt(payment.createdAt)}</Detail>
                <Detail label="Approved At">{fmt(payment.paidAt)}</Detail>
                <Detail label="Rejected At">{fmt(payment.rejectedAt)}</Detail>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No payment requested yet — client agency can initiate settlement once delivered.
              </p>
            )}
          </div>

          {/* Last editor audit trail */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
              <ShieldCheck className="size-4.5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-foreground">
                Audit Trail
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Last Edited By">
                {lastEditorLine(
                  passport.lastEditedByName,
                  passport.lastEditedByRole,
                  passport.lastEditedAt
                )}
              </Detail>
              <Detail label="Editor Gmail">{passport.lastEditedByEmail ?? "—"}</Detail>
              <Detail label="Audit Attribution">
                {passport.lastEditedAt
                  ? "Stamps the exact acting user on every update."
                  : "Original counter intake record."}
              </Detail>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
