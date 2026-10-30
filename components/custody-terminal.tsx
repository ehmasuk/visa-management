"use client";

import * as React from "react";
import {
  ShieldCheck,
  Clock,
  UserCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PassportStatus = "RECEIVED" | "DELIVERED";

interface MockPassport {
  id: string;
  passportNumber: string;
  holderName: string;
  agencyName: string;
  visaType: string;
  service: string;
  fee: number;
  intakeCollector: string;
  receivedAt: string;
  deliveryCollector?: string;
  deliveredAt?: string;
  paymentStatus: "PENDING" | "APPROVED" | "UNPAID";
  lastEditor: string;
}

const PRESETS: Record<PassportStatus, MockPassport> = {
  RECEIVED: {
    id: "rec_01",
    passportNumber: "A08492041",
    holderName: "Mohammad Al-Amin",
    agencyName: "Green Crest Travels",
    visaType: "Saudi Arabia (Work Visa)",
    service: "Normal Processing",
    fee: 8500,
    intakeCollector: "Zahid Collector",
    receivedAt: "Today, 09:45 AM",
    paymentStatus: "UNPAID",
    lastEditor: "Tanvir (Staff)",
  },
  DELIVERED: {
    id: "rec_03",
    passportNumber: "EE-7182930",
    holderName: "Tanvir Ahmed Chowdhury",
    agencyName: "Al-Haramain Overseas",
    visaType: "Qatar (Commercial Resident)",
    service: "Urgent Stamping",
    fee: 15500,
    intakeCollector: "Zahid Collector",
    receivedAt: "Oct 26, 11:30 AM",
    deliveryCollector: "Kamal (Delivery Man)",
    deliveredAt: "Today, 11:20 AM",
    paymentStatus: "APPROVED",
    lastEditor: "Admin Console",
  },
};

export function CustodyTerminal() {
  const [selectedStatus, setSelectedStatus] =
    React.useState<PassportStatus>("RECEIVED");
  const [customSearch, setCustomSearch] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);

  const activeRecord = PRESETS[selectedStatus];

  const handleCopySerial = () => {
    navigator.clipboard?.writeText(activeRecord.passportNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient decorative back-glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-foreground/5 via-foreground/10 to-foreground/5 blur-xl -z-10 opacity-70 pointer-events-none" />

      {/* Main Terminal Dossier Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl p-5 sm:p-7 text-card-foreground transition-all duration-300">
        {/* Dossier Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/5 border border-border text-foreground font-semibold">
              <FileCheck2 className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                  Passport Record
                </span>
                <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground/80 font-mono">
                REGISTRY ID #784-BGD
              </p>
            </div>
          </div>

          {/* Interactive Lifecycle Switcher Tabs */}
          <div className="flex items-center rounded-lg bg-muted/80 p-1 border border-border/60">
            {(["RECEIVED", "DELIVERED"] as PassportStatus[]).map(
              (status) => {
                const isActive = selectedStatus === status;
                return (
                  <Button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="relative rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                  >
                    {status === "RECEIVED" && "1. Received"}
                    {status === "DELIVERED" && "2. Delivered"}
                  </Button>
                );
              }
            )}
          </div>
        </div>

        {/* Passport Identity Ribbon */}
        <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Passport Holder
              </span>
              <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                {activeRecord.holderName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agency:{" "}
                <span className="font-medium text-foreground/90">
                  {activeRecord.agencyName}
                </span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Document Number
              </span>
              <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                <Button
                  onClick={handleCopySerial}
                  variant="outline"
                  size="sm"
                  title="Click to copy passport serial"
                >
                  {activeRecord.passportNumber}
                  <span className="text-[10px] uppercase font-sans font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {isCopied ? "Copied!" : "BGD"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Status Progression */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status Progression
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Automatic Timestamp
            </span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Intake */}
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                selectedStatus === "RECEIVED" ||
                selectedStatus === "DELIVERED"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : "border-border/50 bg-background/50 text-muted-foreground"
              }`}
            >
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    Received at Counter
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {activeRecord.receivedAt}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Brought by intake collector{" "}
                  <span className="font-medium text-foreground">
                    {activeRecord.intakeCollector}
                  </span>
                  . Receipt date stamped automatically.
                </p>
              </div>
            </div>

            {/* Step 2: Delivery */}
            <div
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                selectedStatus === "DELIVERED"
                  ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                  : "border-border/40 bg-background/30 text-muted-foreground opacity-60"
              }`}
            >
              <div
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                  selectedStatus === "DELIVERED"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedStatus === "DELIVERED" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Truck className="size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    Delivered to Agency
                  </span>
                  {selectedStatus === "DELIVERED" ? (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {activeRecord.deliveredAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Awaiting Completion
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedStatus === "DELIVERED" ? (
                    <>
                      Assigned delivery collector:{" "}
                      <span className="font-medium text-foreground">
                        {activeRecord.deliveryCollector}
                      </span>
                      . Delivery date stamped automatically.
                    </>
                  ) : (
                    "Delivery collector assigned upon transition to Delivered."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta & Ledger Status */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Office Fee
              </span>
              <span className="font-semibold text-foreground font-mono text-sm">
                ৳ {activeRecord.fee.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-border/80" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Payment Status
              </span>
              <span
                className={`font-medium ${
                  activeRecord.paymentStatus === "APPROVED"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : activeRecord.paymentStatus === "PENDING"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {activeRecord.paymentStatus === "APPROVED" && "Settled (Approved)"}
                {activeRecord.paymentStatus === "PENDING" && "Settlement Requested"}
                {activeRecord.paymentStatus === "UNPAID" && "Unpaid"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-muted-foreground block text-[11px]">
              Last Editor
            </span>
            <span className="text-foreground/90 font-medium">
              {activeRecord.lastEditor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
