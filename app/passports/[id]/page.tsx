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

export const metadata = { title: "Passport details" };

/**
 * One labelled value in the read-only detail grid. Unset data renders as an
 * em dash so every known field of the passport always has a home on this
 * view (spec: fields never captured are shown as empty, not hidden).
 */
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm">{children}</div>
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
    <div className="flex min-h-svh flex-col">
      <RoleNav
        pathname={`/passports/${id}`}
        role={session.user.role}
        userLabel={session.user.name ?? session.user.email}
      />
      <PageShell
        title="Passport details"
        subtitle={`${passport.passportNumber} · ${passport.holderName} · ${passport.agencyName}`}
      >
        <div className="mb-4 flex items-center gap-3">
          {/* Edit button on every field-level landing: back to the prefilled edit form */}
          <Link href={`/passports/${id}/edit`} className={cn(buttonVariants({ variant: "default" }))}>
            Edit passport
          </Link>
          <Link href={backTo} className={cn(buttonVariants({ variant: "outline" }))}>
            Back to passports
          </Link>
        </div>

        {/* Entry details */}
        <Card className="mb-6 gap-0 px-5 py-5">
          <CardContent className="gap-0 p-0">
            <h2 className="mb-4 text-lg font-semibold">Details</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Passport number">
                <span className="font-mono font-semibold">{passport.passportNumber}</span>
              </Detail>
              <Detail label="Status">
                <Badge className={STATUS_BADGE[passport.status]}>{statusLabel(passport.status)}</Badge>
              </Detail>
              <Detail label="Fee (taka)">৳{passport.fee}</Detail>
              <Detail label="Agency name">{passport.agencyName}</Detail>
              <Detail label="Agency Gmail (ownership reference)">{passport.agencyGmail}</Detail>
              <Detail label="Intake collector (brought the passport)">{passport.collectorName}</Detail>
              <Detail label="Passport holder name">{passport.holderName}</Detail>
              <Detail label="Contact number">{passport.contactNumber}</Detail>
              <Detail label="Visa type">
                {passport.visaTypeName ?? "—"}
              </Detail>
              <Detail label="Service">{passport.serviceName ?? "—"}</Detail>
              <Detail label="Comment" >
                {passport.comment ? passport.comment : "—"}
              </Detail>
            </div>
          </CardContent>
        </Card>

        {/* Status timeline */}
        <Card className="mb-6 gap-0 px-5 py-5">
          <CardContent className="gap-0 p-0">
            <h2 className="mb-4 text-lg font-semibold">Status timeline</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Receipt date (set automatically)">{fmt(passport.receiptDate)}</Detail>
              <Detail label="Delivery date (set automatically)">
                {fmt(passport.deliveryDate)}
              </Detail>
              <Detail label="Delivery collector (delivery man)">
                {passport.deliveryCollectorName ?? "—"}
              </Detail>
            </div>
          </CardContent>
        </Card>

        {/* Payment trail */}
        <Card className="mb-6 gap-0 px-5 py-5">
          <CardContent className="gap-0 p-0">
            <h2 className="mb-4 text-lg font-semibold">Payment</h2>
            {payment ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Detail label="Amount (taka)">৳{payment.amount}</Detail>
                <Detail label="Status">
                  <Badge variant={payment.status === "PAID" ? "default" : "secondary"}>
                    {payment.status === "PAID" ? "Paid" : payment.rejectedAt ? "Payment rejected" : "Payment requested"}
                  </Badge>
                </Detail>
                <Detail label="Requested at">{fmt(payment.createdAt)}</Detail>
                <Detail label="Approved at">{fmt(payment.paidAt)}</Detail>
                <Detail label="Rejected at">{fmt(payment.rejectedAt)}</Detail>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment requested yet — the agency can request payment on a delivered passport.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Last editor */}
        <Card className="gap-0 px-5 py-5">
          <CardContent className="gap-0 p-0">
            <h2 className="mb-4 text-lg font-semibold">Last editor</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Detail label="Edited by (name · role · time)">
                {lastEditorLine(
                  passport.lastEditedByName,
                  passport.lastEditedByRole,
                  passport.lastEditedAt
                )}
              </Detail>
              <Detail label="Editor email">{passport.lastEditedByEmail ?? "—"}</Detail>
              <Detail label="Edit note">
                {passport.lastEditedAt
                  ? "Reflects the most recent change to this passport."
                  : "Never edited since it was recorded — attribution starts from the entry."}
              </Detail>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}
