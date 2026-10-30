import { requireAgency } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { RoleNav } from "@/components/role-nav";
import { PageShell, SubmitButton } from "@/components/admin-ui";
import { requestPayment } from "@/app/actions/payment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { NativeSelect } from "@/components/ui/native-select";
import { IdCardIcon } from "lucide-react";

export const metadata = { title: "Agency — Visa Management" };

const STATUS_BADGE: Record<string, string> = {
  RECEIVED: "bg-blue-500/15 text-blue-600",
  PROCESSING: "bg-amber-500/15 text-amber-600",
  DELIVERED: "bg-emerald-500/15 text-emerald-600",
};

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

  return (
    <div className="flex min-h-svh flex-col">
      <RoleNav pathname="/agency" role="AGENCY" userLabel={session.user.name ?? session.user.email} />
      <PageShell
        title="My passports"
        subtitle={`Signed in as ${agencyGmail}. You see only your agency's passports, across all statuses.`}
      >
        {passports.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IdCardIcon />
              </EmptyMedia>
              <EmptyTitle>No passports recorded for your agency yet</EmptyTitle>
              <EmptyDescription>
                Our staff enter passports once they are received from you via a collector.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {passports.map((passport) => {
              const delivered = passport.status === "DELIVERED";
              const payment = passport.payment;
              const paid = payment?.status === "PAID";
              const requested = payment?.status === "REQUESTED";
              // Task 6.2 — pay button ONLY on delivered passports with no
              // payment request yet (status UNPAID).
              const showPay = delivered && payment?.status === "UNPAID";

              return (
                <li key={passport.id}>
                  <Card className="gap-0 py-3">
                    <CardContent className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{passport.passportNumber}</span>
                        <Badge className={STATUS_BADGE[passport.status]}>
                          {passport.status.charAt(0) + passport.status.slice(1).toLowerCase()}
                        </Badge>
                        {paid ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600">Paid</Badge>
                        ) : null}
                        {requested ? (
                          <Badge className="bg-amber-500/15 text-amber-600">
                            Payment awaiting approval
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm">{passport.holderName}</p>
                      <p className="text-xs text-muted-foreground">
                        Fee ৳{passport.fee} · received {fmt(passport.receiptDate)}
                        {passport.deliveryDate ? ` · delivered ${fmt(passport.deliveryDate)}` : ""}
                      </p>
                    </div>
                    <div>
                      {showPay ? (
                        <form action={requestPayment}>
                          <input type="hidden" name="id" value={passport.id} />
                          <SubmitButton>Pay</SubmitButton>
                        </form>
                      ) : null}
                      {paid ? (
                        <p className="text-xs text-muted-foreground">Approved{payment.paidAt ? ` on ${fmt(payment.paidAt)}` : ""}</p>
                      ) : null}
                    </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </PageShell>
    </div>
  );
}
