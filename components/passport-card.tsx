"use client";

import Link from "next/link";
import { useState } from "react";
import type { Prisma } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SubmitButton } from "@/components/admin-ui";
import { Spinner } from "@/components/ui/spinner";
import { updatePassportStatus } from "@/app/actions/passport";
import { cn } from "@/lib/utils";
import {
  fmt,
  lastEditorLine,
  NEXT_STAGE,
  PassportStage,
  STATUS_BADGE,
  STATUS_DOT,
  statusLabel,
} from "@/lib/passport-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, FileSearch, Send, Truck, CheckCircle2, Clock } from "lucide-react";
import { useFormStatus } from "react-dom";

type PassportWithPayment = Prisma.PassportGetPayload<{ include: { payment: true } }>;

/** Next pipeline stage for the card's status; null once delivered. */
function nextStageOf(status: string): PassportStage | null {
  return NEXT_STAGE[status as PassportStage];
}

/**
 * Submit button for an inline stage-advance form: spun and disabled while
 * the transition posts (useFormStatus sees the enclosing form), so a double
 * click cannot fire the action twice.
 */
function StagePendingButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "gap-1.5 text-xs font-bold cursor-pointer transition-all",
        pending ? "opacity-75" : "",
        className
      )}
    >
      {pending ? <Spinner className="size-3.5" /> : null}
      {children}
    </Button>
  );
}

export function PassportCard({
  passport,
  collectors,
  returnTo,
}: {
  passport: PassportWithPayment;
  collectors: Array<{ name: string }>;
  returnTo: string;
}) {
  const payment = passport.payment;
  const [isDeliverOpen, setIsDeliverOpen] = useState(false);
  const nextStage = nextStageOf(passport.status);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all">
      <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-foreground">
              {passport.passportNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[passport.status]}`}>
              <span className={`size-1.5 rounded-full ${STATUS_DOT[passport.status]}`} />
              {statusLabel(passport.status)}
            </span>
            {payment ? (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  payment.status === "PAID"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : payment.status === "REQUESTED"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {payment.status === "PAID" ? (
                  <CheckCircle2 className="size-3" />
                ) : payment.status === "REQUESTED" ? (
                  <Clock className="size-3" />
                ) : null}
                {payment.status === "PAID"
                  ? "Paid"
                  : payment.status === "REQUESTED"
                  ? "Payment Requested"
                  : "Unpaid"}
              </span>
            ) : null}
          </div>

          <p className="text-sm font-bold text-foreground">
            {passport.holderName} · <span className="text-muted-foreground font-medium">{passport.agencyName}</span>
          </p>

          <p className="text-xs text-muted-foreground">
            Contact: <span className="text-foreground font-medium">{passport.contactNumber}</span> · Fee: <span className="font-mono font-bold text-foreground">৳{passport.fee.toLocaleString()}</span> · Brought by: <span className="text-foreground font-medium">{passport.collectorName}</span>
            {passport.deliveryCollectorName ? ` · Delivered by: ${passport.deliveryCollectorName}` : null}
            {passport.visaTypeName ? ` · Visa: ${passport.visaTypeName}` : ""}
            {passport.serviceName ? ` · Service: ${passport.serviceName}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground pt-1">
            <span>Received: {fmt(passport.receiptDate)}</span>
            {passport.deliveryDate ? (
              <>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Delivered: {fmt(passport.deliveryDate)}
                </span>
              </>
            ) : null}
            <span>•</span>
            <span>
              Last edited by {lastEditorLine(passport.lastEditedByName, passport.lastEditedByRole, passport.lastEditedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Link
            href={`/passports/${passport.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs"
          >
            <Eye className="size-3.5 text-muted-foreground" />
            <span>View</span>
          </Link>
          <Link
            href={`/passports/${passport.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs"
          >
            <Edit className="size-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Link>
          {nextStage === "UNDER_REVIEW" && (
            <form action={updatePassportStatus}>
              <input type="hidden" name="id" value={passport.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="status" value="UNDER_REVIEW" />
              <StagePendingButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition-all shadow-sm">
                <FileSearch className="size-3.5" />
                <span>Start Review</span>
              </StagePendingButton>
            </form>
          )}
          {nextStage === "SUBMITTED" && (
            <form action={updatePassportStatus}>
              <input type="hidden" name="id" value={passport.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="status" value="SUBMITTED" />
              <StagePendingButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-all shadow-sm">
                <Send className="size-3.5" />
                <span>Submit</span>
              </StagePendingButton>
            </form>
          )}
          {nextStage === "DELIVERED" && (
            <>
              <button
                onClick={() => setIsDeliverOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <Truck className="size-3.5" />
                <span>Deliver</span>
              </button>
              <Dialog open={isDeliverOpen} onOpenChange={setIsDeliverOpen}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Assign Delivery Courier</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Assign a delivery collector to return this passport back to the agency.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={updatePassportStatus} className="flex flex-col gap-4 mt-2">
                    <input type="hidden" name="id" value={passport.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <input type="hidden" name="status" value="DELIVERED" />
                    <Select
                      label="Delivery collector (delivery man)"
                      name="deliveryCollectorName"
                      defaultValue={passport.deliveryCollectorName ?? ""}
                      options={[
                        {
                          value: "",
                          label:
                            collectors.length === 0
                              ? "No collectors registered yet"
                              : "Select a collector",
                        },
                        ...collectors.map((collector) => ({
                          value: collector.name,
                          label: collector.name,
                        })),
                      ]}
                    />
                    <DialogFooter className="mt-2">
                      <SubmitButton variant="primary">Confirm Delivery</SubmitButton>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
