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

type PassportWithPayment = Prisma.PassportGetPayload<{ include: { payment: true } }>;

/**
 * Passport card shared by the staff and admin list pages: summary details,
 * View/Edit/Deliver buttons that reach the internal detail pages, the governed
 * status-change form, and the last-editor line. Admin and staff both drive the
 * inline forms; `returnTo` sends each server action back to the list page that
 * rendered the card (whitelisted server-side).
 */
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
    <Card className="gap-0 py-3">
      <CardContent className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{passport.passportNumber}</span>
            <Badge className={STATUS_BADGE[passport.status]}>{statusLabel(passport.status)}</Badge>
            {payment ? (
              <Badge variant="secondary">
                {payment.status === "PAID"
                  ? "Paid"
                  : payment.status === "REQUESTED"
                    ? "Requested"
                    : "Unpaid"}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm">
            {passport.holderName} · <span className="text-muted-foreground">{passport.agencyName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Contact {passport.contactNumber} · fee ৳{passport.fee} · brought by {passport.collectorName}
            {passport.deliveryCollectorName ? ` · delivered by ${passport.deliveryCollectorName}` : null}
            {passport.visaTypeName ? ` · visa: ${passport.visaTypeName}` : ""}
            {passport.serviceName ? ` · service: ${passport.serviceName}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Received {fmt(passport.receiptDate)}
            {passport.deliveryDate ? ` · delivered ${fmt(passport.deliveryDate)}` : ""}
          </p>
          {/* Last editor: refreshed by every update (entry, details, comment, status) */}
          <p className="mt-1 text-xs text-muted-foreground">
            Last edited by {lastEditorLine(passport.lastEditedByName, passport.lastEditedByRole, passport.lastEditedAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <Link
              href={`/passports/${passport.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View
            </Link>
            <Link
              href={`/passports/${passport.id}/edit`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Edit
            </Link>
            {passport.status !== "DELIVERED" && (
              <>
                <button
                  onClick={() => setIsDeliverOpen(true)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "bg-emerald-600 text-emerald-foreground hover:bg-emerald-700"
                  )}
                >
                  Deliver
                </button>
                <Dialog open={isDeliverOpen} onOpenChange={setIsDeliverOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deliver Passport</DialogTitle>
                      <DialogDescription>
                        Assign a delivery collector to take this passport back to the agency.
                      </DialogDescription>
                    </DialogHeader>
                    <form action={updatePassportStatus} className="flex flex-col gap-3">
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
                      <DialogFooter>
                        <SubmitButton variant="primary">Deliver</SubmitButton>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
