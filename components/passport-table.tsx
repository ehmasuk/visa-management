"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Prisma } from "@prisma/client";
import { updatePassportStatus } from "@/app/actions/passport";
import { Select, SubmitButton } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  fmtDate,
  lastEditorLine,
  NEXT_STAGE,
  statusLabel,
  STATUS_BADGE,
  STATUS_DOT,
  type PassportStage,
} from "@/lib/passport-format";
import { Edit, Eye, FileSearch, Send, Truck } from "lucide-react";

type PassportRow = Prisma.PassportGetPayload<{ include: { payment: true } }>;

const CELL = "whitespace-nowrap border-r border-border/60 px-3 py-2 align-middle last:border-r-0";
const HEAD = "whitespace-nowrap border-r border-border/70 px-3 py-2.5 text-left font-semibold text-muted-foreground last:border-r-0";

/** Local calendar day key, so "today" follows the operator's timezone. */
function dayKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`;
}

// Read "today" only in the browser: the server renders a stable empty snapshot,
// so SSR and hydration agree before the dots appear.
const subscribeToToday = () => () => {};
const getClientToday = () => dayKey(new Date());
const getServerToday = () => "";

function PendingButton({
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

/**
 * Staff desk table: every passport field is a column, the surface scrolls in
 * both directions with no frozen columns, and the header stays put while rows
 * move. Stage changes are confirmed before they post.
 */
export function PassportTable({
  rows,
  collectors,
  returnTo,
}: {
  rows: PassportRow[];
  collectors: Array<{ name: string }>;
  returnTo: string;
}) {
  const [confirm, setConfirm] = useState<{ row: PassportRow; stage: PassportStage } | null>(null);
  const [deliverRow, setDeliverRow] = useState<PassportRow | null>(null);
  const today = useSyncExternalStore(subscribeToToday, getClientToday, getServerToday);

  return (
    <>
      <div className="h-[65vh] min-h-105 w-full max-w-full min-w-0 overflow-auto bg-card">
        <table className="w-max min-w-full border-collapse text-xs text-foreground">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className={HEAD}>Passport No.</th>
              <th className={HEAD}>Holder</th>
              <th className={HEAD}>Agency</th>
              <th className={HEAD}>Agency Gmail</th>
              <th className={HEAD}>Visa Type</th>
              <th className={HEAD}>Service</th>
              <th className={HEAD}>Intake Collector</th>
              <th className={HEAD}>Delivery Collector</th>
              <th className={HEAD}>Contact</th>
              <th className={HEAD}>Fee (৳)</th>
              <th className={HEAD}>Status</th>
              <th className={HEAD}>Receipt Date</th>
              <th className={HEAD}>Under Review</th>
              <th className={HEAD}>Submitted</th>
              <th className={HEAD}>Delivered</th>
              <th className={HEAD}>Comment</th>
              <th className={HEAD}>Payment</th>
              <th className={HEAD}>Paid Amount</th>
              <th className={HEAD}>Paid At</th>
              <th className={HEAD}>Last Edited By</th>
              <th className={HEAD}>Status Change</th>
              <th className={HEAD}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const next = NEXT_STAGE[p.status as PassportStage];
              const payment = p.payment;
              const addedToday = dayKey(p.receiptDate) === today;
              return (
                <tr
                  key={p.id}
                  className="border-b border-border/70 odd:bg-card even:bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <td className={cn(CELL, "font-mono font-bold text-primary")}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden={!addedToday}
                        role={addedToday ? "img" : undefined}
                        aria-label={addedToday ? "Received today" : undefined}
                        title={addedToday ? "Received today" : undefined}
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          addedToday ? "bg-red-500" : "bg-transparent"
                        )}
                      />
                      {p.passportNumber}
                    </span>
                  </td>
                  <td className={cn(CELL, "font-semibold")}>{p.holderName}</td>
                  <td className={CELL}>{p.agencyName}</td>
                  <td className={cn(CELL, "text-muted-foreground")}>{p.agencyGmail}</td>
                  <td className={CELL}>{p.visaTypeName ?? "—"}</td>
                  <td className={CELL}>{p.serviceName ?? "—"}</td>
                  <td className={CELL}>{p.collectorName}</td>
                  <td className={CELL}>{p.deliveryCollectorName ?? "—"}</td>
                  <td className={cn(CELL, "tabular-nums")}>{p.contactNumber}</td>
                  <td className={cn(CELL, "tabular-nums font-semibold")}>
                    {p.fee.toLocaleString()}
                  </td>
                  <td className={CELL}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold",
                        STATUS_BADGE[p.status]
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", STATUS_DOT[p.status])} />
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className={cn(CELL, "tabular-nums text-muted-foreground")}>{fmtDate(p.receiptDate)}</td>
                  <td className={cn(CELL, "tabular-nums text-muted-foreground")}>{fmtDate(p.underReviewDate)}</td>
                  <td className={cn(CELL, "tabular-nums text-muted-foreground")}>{fmtDate(p.submittedDate)}</td>
                  <td className={cn(CELL, "tabular-nums text-muted-foreground")}>{fmtDate(p.deliveryDate)}</td>
                  <td className={cn(CELL, "max-w-72 text-muted-foreground")}>{p.comment || "—"}</td>
                  <td className={CELL}>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-bold",
                        payment?.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : payment?.status === "REQUESTED"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {payment?.status ?? "UNPAID"}
                    </span>
                  </td>
                  <td className={cn(CELL, "tabular-nums font-semibold")}>
                    {payment ? payment.amount.toLocaleString() : "—"}
                  </td>
                  <td className={cn(CELL, "tabular-nums text-muted-foreground")}>{fmtDate(payment?.paidAt)}</td>
                  <td className={cn(CELL, "text-muted-foreground")}>
                    {lastEditorLine(p.lastEditedByName, p.lastEditedByRole, p.lastEditedAt, false)}
                  </td>
                  <td className={CELL}>
                    {next === "DELIVERED" ? (
                      <button
                        type="button"
                        onClick={() => setDeliverRow(p)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <Truck className="size-3.5" />
                        Deliver
                      </button>
                    ) : next ? (
                      <button
                        type="button"
                        onClick={() => setConfirm({ row: p, stage: next })}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer",
                          next === "UNDER_REVIEW"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-purple-600 hover:bg-purple-700"
                        )}
                      >
                        {next === "UNDER_REVIEW" ? <FileSearch className="size-3.5" /> : <Send className="size-3.5" />}
                        {next === "UNDER_REVIEW" ? "Review" : "Submit"}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={CELL}>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/passports/${p.id}`}
                        aria-label={`View passport ${p.passportNumber}`}
                        title="View passport details"
                        className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                      >
                        <Eye className="size-3.5 text-muted-foreground" />
                      </Link>
                      <Link
                        href={`/passports/${p.id}/edit`}
                        aria-label={`Edit passport ${p.passportNumber}`}
                        title="Edit passport"
                        className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                      >
                        <Edit className="size-3.5 text-muted-foreground" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm status change</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Passport{" "}
              <span className="font-mono font-bold text-foreground">{confirm?.row.passportNumber}</span>{" "}
              ({confirm?.row.holderName}) will move from{" "}
              <span className="font-semibold text-foreground">
                {confirm ? statusLabel(confirm.row.status) : ""}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {confirm ? statusLabel(confirm.stage) : ""}
              </span>
              . The timestamp and your name are recorded automatically.
            </DialogDescription>
          </DialogHeader>
          {confirm ? (
            <form action={updatePassportStatus} className="flex flex-col gap-4 mt-2">
              <input type="hidden" name="id" value={confirm.row.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="status" value={confirm.stage} />
              <DialogFooter className="mt-2">
                <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                <PendingButton className="rounded-xl px-4 py-2 font-semibold text-xs cursor-pointer shadow-xs transition-all hover:scale-[1.01]">
                  Confirm change
                </PendingButton>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deliverRow !== null}
        onOpenChange={(open) => {
          if (!open) setDeliverRow(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Assign Delivery Courier</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm the status change to Delivered and assign a delivery collector to return this passport back to the agency.
            </DialogDescription>
          </DialogHeader>
          {deliverRow ? (
            <form action={updatePassportStatus} className="flex flex-col gap-4 mt-2">
              <input type="hidden" name="id" value={deliverRow.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="status" value="DELIVERED" />
              <Select
                label="Delivery collector (delivery man)"
                name="deliveryCollectorName"
                defaultValue={deliverRow.deliveryCollectorName ?? ""}
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
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
