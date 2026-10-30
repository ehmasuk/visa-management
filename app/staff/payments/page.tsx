import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell, SubmitButton } from "@/components/admin-ui";
import { approvePayment, rejectPayment } from "@/app/actions/payment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ReceiptTextIcon } from "lucide-react";

export const metadata = { title: "Payments — Staff" };

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

export default async function StaffPaymentsPage() {
  await requireStaff();

  // Task 7.1 — pending list: payment requests with status "REQUESTED" awaiting
  // staff approval.
  const pending = await prisma.payment.findMany({
    where: { status: "REQUESTED" },
    orderBy: { createdAt: "asc" },
    include: {
      passport: {
        select: {
          passportNumber: true,
          holderName: true,
          agencyName: true,
          fee: true,
          status: true,
        },
      },
    },
  });

  return (
    <PageShell
        title="Payment requests"
        subtitle="Agency payment requests on delivered passports — approve to mark paid, reject to keep unpaid."
      >
        {pending.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptTextIcon />
              </EmptyMedia>
              <EmptyTitle>No pending payment requests</EmptyTitle>
              <EmptyDescription>
                New requests appear here when agencies click "Pay" on a delivered passport.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {pending.map((payment) => (
              <li key={payment.id}>
                <Card className="gap-0 py-3">
                  <CardContent className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {payment.passport.passportNumber}
                      <Badge variant="secondary" className="ml-2 font-normal">
                        {payment.passport.status.charAt(0) + payment.passport.status.slice(1).toLowerCase()}
                      </Badge>
                    </p>
                    <p className="mt-1 text-sm">
                      {payment.passport.holderName} · {payment.passport.agencyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Amount ৳{payment.amount} · requested {fmt(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <form action={approvePayment}>
                      <input type="hidden" name="id" value={payment.id} />
                      <SubmitButton>Approve</SubmitButton>
                    </form>
                    <form action={rejectPayment}>
                      <input type="hidden" name="id" value={payment.id} />
                      <SubmitButton variant="danger">Reject</SubmitButton>
                    </form>
                  </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
  );
}
