import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageShell, SubmitButton } from "@/components/admin-ui";
import { approvePayment, rejectPayment } from "@/app/actions/payment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ReceiptTextIcon, Check, X, Clock } from "lucide-react";

export const metadata = { title: "Payment Requests — Staff" };

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
      title="Payment Approval Desk"
      subtitle="Agency settlement requests on delivered passports — verify exterior payment and click Approve to settle or Reject to keep unpaid."
    >
      {pending.length === 0 ? (
        <Empty className="border border-border/80 rounded-2xl bg-card p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ReceiptTextIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No pending payment requests</EmptyTitle>
            <EmptyDescription>
              All settlements are up to date. New requests appear here when agencies request payment on delivered passports.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-4">
          {pending.map((payment) => (
            <li key={payment.id}>
              <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-amber-500/40 transition-all">
                <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-foreground">
                        {payment.passport.passportNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="size-3" />
                        <span>Awaiting Approval</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span>Delivered</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {payment.passport.holderName} · <span className="text-muted-foreground font-medium">{payment.passport.agencyName}</span>
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Requested settlement: <strong className="font-mono text-sm text-foreground">{taka(payment.amount)}</strong> · Requested on {fmt(payment.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start md:self-center">
                    <form action={approvePayment}>
                      <input type="hidden" name="id" value={payment.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="size-3.5" />
                        <span>Approve Settlement</span>
                      </button>
                    </form>
                    <form action={rejectPayment}>
                      <input type="hidden" name="id" value={payment.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-destructive/30 hover:bg-destructive/10 text-xs font-bold text-destructive shadow-2xs transition-all cursor-pointer"
                      >
                        <X className="size-3.5" />
                        <span>Reject</span>
                      </button>
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
