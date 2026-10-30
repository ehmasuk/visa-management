"use client";

import Link from "next/link";
import { useState } from "react";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Select, SubmitButton } from "@/components/admin-ui";
import { updatePassportStatus } from "@/app/actions/passport";
import { cn } from "@/lib/utils";
import { fmt, lastEditorLine, STATUS_BADGE, statusLabel } from "@/lib/passport-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Truck, CheckCircle2, Clock } from "lucide-react";

type PassportWithPayment = Prisma.PassportGetPayload<{ include: { payment: true } }>;

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

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all">
      <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-foreground">
              {passport.passportNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[passport.status]}`}>
              <span className={`size-1.5 rounded-full ${passport.status === "DELIVERED" ? "bg-emerald-500" : "bg-blue-500"}`} />
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
          {passport.status !== "DELIVERED" && (
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
