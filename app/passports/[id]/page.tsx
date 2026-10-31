import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaffOrAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell } from "@/components/admin-ui";
import { fmt, lastEditorLine, STAGES, STATUS_BADGE, STATUS_DOT, statusLabel, type PassportStage } from "@/lib/passport-format";
import { Edit, ArrowLeft, FileCheck2, FileText, FileSearch, Send, Truck, Clock, CreditCard, ShieldCheck, type LucideIcon } from "lucide-react";

export const metadata = { title: "Passport Dossier Details — Visa Management" };

const taka = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

/** Timeline presentation per pipeline stage: icon, label, and auto-record note. */
const STAGE_META: Record<PassportStage, { icon: LucideIcon; note: string }> = {
  RECEIVED: { icon: FileText, note: "Recorded automatically at counter entry" },
  UNDER_REVIEW: { icon: FileSearch, note: "Review confirmed by an operator" },
  SUBMITTED: { icon: Send, note: "Submitted for visa processing" },
  DELIVERED: { icon: Truck, note: "Handed to the delivery collector" },
};

/** The milestone timestamp recorded for a stage, or null if not reached yet. */
function stageDate(
  passport: {
    receiptDate: Date;
    underReviewDate: Date | null;
    submittedDate: Date | null;
    deliveryDate: Date | null;
  },
  stage: PassportStage
): Date | null {
  switch (stage) {
    case "RECEIVED":
      return passport.receiptDate;
    case "UNDER_REVIEW":
      return passport.underReviewDate;
    case "SUBMITTED":
      return passport.submittedDate;
    case "DELIVERED":
      return passport.deliveryDate;
  }
}

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
                  <span className={`size-1.5 rounded-full ${STATUS_DOT[passport.status]}`} />
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

          {/* Custody timeline: the four pipeline milestones, recorded
              automatically when each stage is entered. Unreached stages
              render as unset rather than being hidden. */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
              <Clock className="size-4.5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-foreground">
                Custody Timeline
              </h2>
            </div>
            <ol className="max-w-xl">
              {STAGES.map((stage, index) => {
                const date = stageDate(passport, stage);
                const reached = stage === "RECEIVED" || date !== null;
                const meta = STAGE_META[stage];
                const MetaIcon = meta.icon;
                return (
                  <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Rail: stage dot with the connecting line to the next */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`size-8 shrink-0 rounded-xl flex items-center justify-center border ${
                          reached
                            ? `text-white border-transparent ${STATUS_DOT[stage]}`
                            : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        <MetaIcon className="size-4" />
                      </span>
                      {index < STAGES.length - 1 && (
                        <span className="w-px flex-1 bg-border/70 my-1.5" />
                      )}
                    </div>
                    <div className={`min-w-0 ${index < STAGES.length - 1 ? "" : ""}`}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={`text-sm font-bold ${
                            reached ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {statusLabel(stage)}
                        </span>
                        <span className="font-mono text-xs font-semibold">
                          {date ? (
                            <span className="text-foreground">{fmt(date)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {meta.note}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Assigned Delivery Courier:{" "}
                {passport.deliveryCollectorName ? (
                  <span className="font-semibold text-foreground">
                    {passport.deliveryCollectorName}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Stage dates are recorded automatically — never entered by hand.
              </p>
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
